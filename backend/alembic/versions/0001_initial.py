"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-27

모든 모델을 Base.metadata 로부터 생성한다. 모델 정의가 단일 진실의 원천이며,
이 초기 마이그레이션은 그것과 항상 일치한다.
"""
from typing import Sequence, Union

from alembic import op

from app.core.db import Base
import app.models  # noqa: F401  (모든 테이블을 메타데이터에 등록)

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
