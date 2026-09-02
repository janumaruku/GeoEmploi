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
    op.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR UNIQUE NOT NULL,
            role VARCHAR NOT NULL,
            password_hash VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP NULL
        );
    """)

    op.execute("""
        CREATE INDEX idx_users_email ON users(email);
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_users_email;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")
