"""Create Users

Revision ID: fccb95a9e678
Revises: 
Create Date: 2026-09-02 11:41:57.731284

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fccb95a9e678'
down_revision = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String, unique=True, nullable=False),
        sa.Column('role', sa.String, nullable=False),
        sa.Column('password_hash', sa.String, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column('deleted_at', sa.DateTime, nullable=True),
    )

    op.create_index('idx_users_email', 'users', ['email'])


def downgrade() -> None:
    op.drop_index('idx_users_email')
    op.drop_table('users')
