"""데모용 시드 데이터. `python -m app.seed` 로 실행한다."""
from __future__ import annotations

from app.core.db import SessionLocal
from app.models import Employee, Store


def main() -> None:
    db = SessionLocal()
    try:
        if db.query(Store).count() > 0:
            print("이미 시드 데이터가 존재합니다.")
            return
        store = Store(
            name="행복카페 강남점",
            representative="박사장",
            address="서울시 강남구 테헤란로 123",
        )
        db.add(store)
        db.flush()
        emp = Employee(store_id=store.id, name="김알바", phone="010-1234-5678")
        db.add(emp)
        db.commit()
        print(f"시드 완료: store_id={store.id}, employee_id={emp.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
