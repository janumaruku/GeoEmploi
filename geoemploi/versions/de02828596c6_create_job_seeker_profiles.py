"""Create Job Seeker Profiles

Revision ID: de02828596c6
Revises: fccb95a9e678
Create Date: 2026-09-02 14:07:29.131899

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de02828596c6'
down_revision = 'fccb95a9e678'


def upgrade() -> None:
    op.create_table(
        'job_seeker_profiles',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, nullable=False, unique=True),
        sa.Column('first_name', sa.String, nullable=False),
        sa.Column('last_name', sa.String, nullable=False),
        sa.Column('phone', sa.String, nullable=True),
        sa.Column('skills', sa.Text, nullable=True),
        sa.Column('experience_level', sa.String, nullable=True),
        sa.Column('availability', sa.String, nullable=True),
        sa.Column('location_consent', sa.Boolean, default=False),
        sa.Column('location_lat', sa.Float, nullable=True),
        sa.Column('location_lon', sa.Float, nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_job_seeker_user', 'job_seeker_profiles', ['user_id'])

def downgrade() -> None:
    op.drop_index('idx_job_seeker_user')
    op.drop_table('job_seeker_profiles')
