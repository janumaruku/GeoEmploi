"""Create Admin Profiles

Revision ID: 3d2251202d4f
Revises: 9d3d781a8213
Create Date: 2026-09-02 15:23:44.111609

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3d2251202d4f'
down_revision = '9d3d781a8213'


def upgrade() -> None:
    op.create_table(
        'admin_profiles',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('admin_id', sa.Integer, nullable=False),
        sa.Column('action_type', sa.String, nullable=False),
        sa.Column('target_type', sa.String, nullable=False),
        sa.Column('target_id', sa.Integer, nullable=False),
        sa.Column('details', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_admin_profiles_admin', 'admin_profiles', ['admin_id'])

def downgrade() -> None:
    op.drop_index('idx_admin_profiles_admin')
    op.drop_table('admin_profiles')
