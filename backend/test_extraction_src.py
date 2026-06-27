"""extraction_test_src/*.docx 를 업로드 파이프라인(UF1)으로 추출 테스트.

실제 Gemini 호출(.env 의 GEMINI_API_KEY 사용). 실행:
    DATABASE_URL=... python test_extraction_src.py
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
from app.models import AgentJob, Store

client = TestClient(app)

SRC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "extraction_test_src")

KEY_FIELDS = [
    "gap_company_name",
    "eul_name",
    "contract_start_date",
    "contract_end_date",
    "workplace",
    "job_description",
    "work_days_per_week",
    "work_days_note",
    "work_start_time",
    "work_end_time",
    "break_start_time",
    "break_end_time",
    "weekly_holiday_day",
    "wage_type",
    "wage_amount",
    "overtime_rate_pct",
    "pay_day",
    "pay_cycle",
    "eul_resident_id",
    "confidence",
]


def make_store() -> int:
    db = SessionLocal()
    try:
        store = Store(name="테스트매장")
        db.add(store)
        db.commit()
        return store.id
    finally:
        db.close()


def wait_job(job_id: int, timeout: float = 60.0) -> str:
    """TestClient 의 BackgroundTasks 는 응답 후 동기 실행되지만, 안전하게 폴링."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        r = client.get(f"/api/v1/agent-jobs/{job_id}")
        status = r.json()["status"]
        if status in ("succeeded", "failed"):
            return status
        time.sleep(0.5)
    return "timeout"


def main() -> None:
    print(f"Gemini enabled: {settings.gemini_enabled} (model={settings.gemini_model})")
    store_id = make_store()

    files = sorted(glob.glob(os.path.join(SRC_DIR, "*.docx")))
    if not files:
        print(f"테스트 파일 없음: {SRC_DIR}")
        return

    for path in files:
        name = os.path.basename(path)
        print("\n" + "=" * 70)
        print(f"파일: {name}")
        print("=" * 70)

        with open(path, "rb") as f:
            r = client.post(
                "/api/v1/contracts/upload",
                data={"store_id": str(store_id)},
                files={
                    "file": (
                        name,
                        f,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    )
                },
            )
        assert r.status_code == 202, r.text
        job_id = r.json()["job_id"]
        status = wait_job(job_id)
        print(f"  parse job: {status}")

        db = SessionLocal()
        try:
            job = db.get(AgentJob, job_id)
            if status == "failed":
                print(f"  ERROR: {job.error}")
                continue
            contract_id = job.result["contract_id"]
        finally:
            db.close()

        r = client.get(f"/api/v1/contracts/{contract_id}")
        contract = r.json()
        extracted = contract["extracted_terms"] or {}
        print(f"  contract_id={contract_id} status={contract['status']}")
        print("  --- 추출 결과 (주요 필드) ---")
        for k in KEY_FIELDS:
            print(f"    {k}: {extracted.get(k)}")

        # confirm → 정형화된 terms
        r = client.post(f"/api/v1/contracts/{contract_id}/confirm", json={})
        assert r.status_code == 200, r.text
        terms = r.json()["terms"]
        print("  --- 정형화 terms (confirm) ---")
        print("    " + json.dumps(terms, ensure_ascii=False))

    print("\n완료.")


if __name__ == "__main__":
    main()
