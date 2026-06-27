"""extraction_test_src/*.png(카톡 대타/추가근무 캡처)로 대타·추가근무 Agent 테스트.

대타/추가근무 Agent 플로우(UF):
  POST /extra-shifts (생성)
    -> POST /extra-shifts/{id}/evidences (증빙 업로드 → vlm_interpret 잡 트리거)
    -> GET  /agent-jobs/{jobId} (폴링)
    -> GET  /extra-shifts/{id} (VLM 해석 결과 + 매핑 후보 조회)

실제 Gemini Vision 호출(.env 의 GEMINI_API_KEY 사용). 실행:
    cd backend && .venv/bin/python test_extra_shift_src.py
"""
from __future__ import annotations

import glob
import json
import os
import time

from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.db import SessionLocal
from app.main import app
from app.models import AgentJob, Employee, Store

client = TestClient(app)

SRC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "extraction_test_src")


def make_store_and_employee() -> tuple[int, int]:
    db = SessionLocal()
    try:
        store = Store(name="테스트매장(대타)")
        db.add(store)
        db.flush()
        emp = Employee(store_id=store.id, name="테스트알바", phone="010-0000-0000")
        db.add(emp)
        db.commit()
        return store.id, emp.id
    finally:
        db.close()


def wait_job(job_id: int, timeout: float = 60.0) -> str:
    deadline = time.time() + timeout
    while time.time() < deadline:
        r = client.get(f"/api/v1/agent-jobs/{job_id}")
        status = r.json()["status"]
        if status in ("succeeded", "failed"):
            return status
        time.sleep(0.5)
    return "timeout"


def run_one(path: str, store_id: int, employee_id: int) -> None:
    name = os.path.basename(path)
    print("\n" + "=" * 70)
    print(f"파일: {name}")
    print("=" * 70)

    # 1) 대타 건 생성 (스크린샷이 '대타' 요청이므로 substitute)
    r = client.post(
        "/api/v1/extra-shifts",
        json={
            "store_id": store_id,
            "employee_id": employee_id,
            "shift_type": "substitute",
        },
    )
    assert r.status_code == 201, r.text
    shift_id = r.json()["id"]
    print(f"  extra_shift 생성: id={shift_id} status={r.json()['status']}")

    # 2) 카톡 캡처 증빙 업로드 → VLM 해석 잡 트리거
    with open(path, "rb") as f:
        r = client.post(
            f"/api/v1/extra-shifts/{shift_id}/evidences",
            data={"evidence_type": "kakaotalk_image"},
            files={"file": (name, f, "image/png")},
        )
    assert r.status_code == 202, r.text
    job_id = r.json()["job_id"]
    status = wait_job(job_id)
    print(f"  vlm_interpret job: {status}")

    db = SessionLocal()
    try:
        job = db.get(AgentJob, job_id)
        if status == "failed":
            print(f"  ERROR: {job.error}")
            return
    finally:
        db.close()

    # 3) 해석 결과 + 매핑 후보 조회
    r = client.get(f"/api/v1/extra-shifts/{shift_id}")
    assert r.status_code == 200, r.text
    shift = r.json()
    vlm = shift.get("vlm_extraction") or {}
    print(f"  status={shift['status']}")
    print("  --- VLM 해석 결과 ---")
    print(f"    event:            {vlm.get('event')}")
    print(f"    requested_by:     {vlm.get('requested_by')}")
    print(f"    start:            {vlm.get('start')}")
    print(f"    end:              {vlm.get('end')}")
    print(f"    duration_minutes: {vlm.get('duration_minutes')}")
    print(f"    confidence:       {vlm.get('confidence')}")
    print("  --- shift 반영값 ---")
    print(f"    work_date:        {shift.get('work_date')}")
    print(f"    start_at:         {shift.get('start_at')}")
    print(f"    end_at:           {shift.get('end_at')}")
    print(f"    worked_minutes:   {shift.get('worked_minutes')}")
    candidates = shift.get("mapping_candidates") or []
    print(f"  --- 매핑 후보 ({len(candidates)}건) ---")
    if candidates:
        print("    " + json.dumps(candidates, ensure_ascii=False, indent=2))
    else:
        print("    (terms 확정된 계약 없음 → 후보 없음. 매핑 단계는 계약 필요)")


def main() -> None:
    print(f"Gemini enabled: {settings.gemini_enabled} (model={settings.gemini_model})")
    store_id, employee_id = make_store_and_employee()
    print(f"store_id={store_id}, employee_id={employee_id}")

    files = sorted(glob.glob(os.path.join(SRC_DIR, "*.png")))
    if not files:
        print(f"테스트 파일(.png) 없음: {SRC_DIR}")
        return

    for path in files:
        run_one(path, store_id, employee_id)

    print("\n완료.")


if __name__ == "__main__":
    main()
