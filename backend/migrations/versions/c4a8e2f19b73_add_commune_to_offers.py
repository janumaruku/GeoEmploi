"""add commune to offers

Revision ID: c4a8e2f19b73
Revises: d391614abd0c
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4a8e2f19b73"
down_revision: Union[str, None] = "d391614abd0c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("offers", sa.Column("commune", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("offers", "commune")
