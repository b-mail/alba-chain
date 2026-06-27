"""핵심 유저플로우 스모크 테스트. GEMINI_API_KEY 미설정 시 mock 으로 동작.

실행: DATABASE_URL=... python smoke_test.py
"""
from __future__ import annotations

import io

from fastapi.testclient import TestClient

from app.core.db import SessionLocal
from app.main import app
from app.models import Employee, Store

client = TestClient(app)


def setup_org() -> tuple[int, int]:
    db = SessionLocal()
    try:
        store = Store(name="행복카페 강남점", representative="박사장")
        db.add(store)
        db.flush()
        emp = Employee(store_id=store.id, name="김알바", phone="010-1234-5678")
        db.add(emp)
        db.commit()
        return store.id, emp.id
    finally:
        db.close()


def main() -> None:
    store_id, employee_id = setup_org()
    print(f"[setup] store_id={store_id} employee_id={employee_id}")

    # UF2: 줄글 draft
    r = client.post(
        "/api/v1/contracts/draft",
        json={
            "store_id": store_id,
            "raw_text": "김알바 시급 11000원, 월수금 18시~22시 근무, 매월 10일 지급, 4대보험 미가입 3.3%",
        },
    )
    assert r.status_code == 201, r.text
    contract = r.json()
    cid = contract["id"]
    print(f"[draft] contract_id={cid} status={contract['status']} extracted_wage={contract['extracted_terms'].get('wage_amount')}")
    assert contract["extracted_terms"]["wage_amount"] == 11000

    # 추출된 알바를 위 employee 에 연결 (확정 시 급여 계산용)
    db = SessionLocal()
    try:
        from app.models import LaborContract

        lc = db.get(LaborContract, cid)
        lc.employee_id = employee_id
        db.add(lc)
        db.commit()
    finally:
        db.close()

    # confirm → active + 정형화
    r = client.post(f"/api/v1/contracts/{cid}/confirm", json={})
    assert r.status_code == 200, r.text
    confirmed = r.json()
    print(f"[confirm] status={confirmed['status']} terms={confirmed['terms']}")
    assert confirmed["status"] == "active"
    assert confirmed["terms"]["hourly_wage"] == 11000
    assert len(confirmed["terms"]["schedules"]) == 3  # 월수금

    # generate-pdf
    r = client.post(f"/api/v1/contracts/{cid}/generate-pdf")
    assert r.status_code == 201, r.text
    print(f"[generate-pdf] {r.json()['file_url']}")

    # send
    r = client.post(
        f"/api/v1/contracts/{cid}/send", json={"employee_phone": "010-1234-5678"}
    )
    assert r.status_code == 200 and r.json()["status"] == "pending_signature", r.text
    print(f"[send] status={r.json()['status']}")

    # UF1: PDF 업로드 (텍스트 PDF 가 아니어도 raw fallback 경로 확인)
    fake_pdf = io.BytesIO(b"%PDF-1.4 fake")
    r = client.post(
        "/api/v1/contracts/upload",
        data={"store_id": str(store_id)},
        files={"file": ("test.pdf", fake_pdf, "application/pdf")},
    )
    assert r.status_code == 202, r.text
    job = r.json()
    print(f"[upload] job_id={job['job_id']} poll_url={job['poll_url']}")
    # BackgroundTasks in TestClient run after response; poll
    r = client.get(f"/api/v1/agent-jobs/{job['job_id']}")
    assert r.status_code == 200, r.text
    print(f"[job] type={r.json()['job_type']} status={r.json()['status']}")

    # 대타/추가근무 플로우
    r = client.post(
        "/api/v1/extra-shifts",
        json={"store_id": store_id, "employee_id": employee_id, "shift_type": "overtime"},
    )
    assert r.status_code == 201, r.text
    shift = r.json()
    sid = shift["id"]
    print(f"[extra-shift] id={sid} status={shift['status']}")

    r = client.post(
        f"/api/v1/extra-shifts/{sid}/evidences",
        data={"evidence_type": "text", "raw_content": "사장님: 오늘 저녁 6시부터 4시간만 더 부탁해요"},
    )
    assert r.status_code == 202, r.text
    print(f"[evidence] job accepted: {r.json()['job_id']}")

    r = client.get(f"/api/v1/extra-shifts/{sid}")
    shift = r.json()
    print(f"[extra-shift after interpret] status={shift['status']} vlm={shift.get('vlm_extraction')}")
    assert shift["status"] == "interpreted", "VLM 해석 완료 후 interpreted 상태여야 함"
    cands = shift["mapping_candidates"]
    print(f"[candidates] {[(c['contract_id'], c['score'], c['reason']) for c in cands]}")
    assert len(cands) >= 1, "매핑 후보가 1개 이상 있어야 함"
    assert cands[0]["contract_id"] == cid
    assert cands[0]["node_id"] is not None, "근태 온톨로지 노드가 후보에 포함되어야 함"

    # mapping (명시적 7월 시간으로 매핑 → 급여 계산용)
    r = client.patch(
        f"/api/v1/extra-shifts/{sid}/mapping",
        json={
            "contract_id": cid,
            "start_at": "2026-07-04T18:00:00",
            "end_at": "2026-07-04T22:00:00",
        },
    )
    assert r.status_code == 200, r.text
    mapped = r.json()
    print(f"[mapping] status={mapped['status']} worked_minutes={mapped['worked_minutes']} node={mapped['mapped_node_id']}")
    assert mapped["worked_minutes"] == 240
    assert mapped["mapped_node_id"] is not None, "node_id 미지정 시 근태 노드로 폴백되어야 함"

    # confirm → 급여 재계산
    r = client.post(f"/api/v1/extra-shifts/{sid}/confirm")
    assert r.status_code == 200, r.text
    body = r.json()
    print(f"[extra-shift confirm] status={body['status']} pay={body['pay_estimate']}")
    assert body["status"] == "confirmed"
    assert body["pay_estimate"]["extra_minutes"] == 240

    # pay-estimate 직접 조회
    r = client.get(
        f"/api/v1/employees/{employee_id}/pay-estimate",
        params={"from": "2026-07-01", "to": "2026-07-31"},
    )
    assert r.status_code == 200, r.text
    pay = r.json()
    print(f"[pay-estimate] gross={pay['gross_pay']} 주휴={pay['weekly_holiday_pay']} 세금={pay['tax_amount']} net={pay['net_pay']}")
    assert pay["base_minutes"] > 0, "기본 근로시간이 계산되어야 함"
    assert pay["gross_pay"] > 0, "급여가 계산되어야 함"
    assert pay["breakdown"]["hourly_wage"] == 11000
    assert pay["net_pay"] == pay["gross_pay"] + pay["weekly_holiday_pay"] - pay["tax_amount"]

    # --- 시간 폴백 매핑 + 반려 플로우 ---
    r = client.post(
        "/api/v1/extra-shifts",
        json={"store_id": store_id, "employee_id": employee_id, "shift_type": "substitute"},
    )
    sid2 = r.json()["id"]
    client.post(
        f"/api/v1/extra-shifts/{sid2}/evidences",
        data={"evidence_type": "text", "raw_content": "점장: 토요일 대타 부탁"},
    )
    shift2 = client.get(f"/api/v1/extra-shifts/{sid2}").json()
    assert shift2["status"] == "interpreted"

    # start/end 생략 → VLM 해석값으로 폴백
    r = client.patch(
        f"/api/v1/extra-shifts/{sid2}/mapping", json={"contract_id": cid}
    )
    assert r.status_code == 200, r.text
    fb = r.json()
    print(f"[mapping fallback] worked_minutes={fb['worked_minutes']} start={fb['start_at']}")
    assert fb["worked_minutes"] == 240, "시간 생략 시 VLM 해석(240분)으로 채워야 함"

    # 반려
    r = client.post(
        f"/api/v1/extra-shifts/{sid2}/reject", json={"reason": "증빙 불명확"}
    )
    assert r.status_code == 200, r.text
    rj = r.json()
    print(f"[reject] status={rj['status']} reason={rj['reject_reason']}")
    assert rj["status"] == "rejected" and rj["reject_reason"] == "증빙 불명확"

    # confirmed 건 반려 시도 → 409
    r = client.post(f"/api/v1/extra-shifts/{sid}/reject")
    assert r.status_code == 409, "confirmed 건은 반려 불가여야 함"

    print("\n✅ 모든 스모크 테스트 통과")


if __name__ == "__main__":
    main()
