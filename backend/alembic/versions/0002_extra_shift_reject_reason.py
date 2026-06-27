"""add reject_reason to extra_shifts

Revision ID: 0002_reject_reason
Revises: 0001_initial
Create Date: 2026-06-27
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_reject_reason"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column in {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    # 0001(create_all 기반)이 최신 모델을 그대로 생성하므로, 신규 DB 에는 이미
    # 컬럼이 존재한다. 구버전 0001 로 생성된 DB 에만 추가한다(멱등).
    if not _has_column("extra_shifts", "reject_reason"):
        op.add_column(
            "extra_shifts", sa.Column("reject_reason", sa.Text(), nullable=True)
        )


def downgrade() -> None:
    if _has_column("extra_shifts", "reject_reason"):
        op.drop_column("extra_shifts", "reject_reason")
