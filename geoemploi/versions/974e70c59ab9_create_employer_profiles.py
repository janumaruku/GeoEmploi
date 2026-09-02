"""Create Employer Profiles

Revision ID: 974e70c59ab9
Revises: de02828596c6
Create Date: 2026-09-02 14:09:16.023786

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '974e70c59ab9'
down_revision: Union[str, Sequence[str], None] = 'de02828596c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
