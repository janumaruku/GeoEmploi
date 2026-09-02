"""Create Job Offers

Revision ID: 4d8ffa943863
Revises: 974e70c59ab9
Create Date: 2026-09-02 14:23:54.435968

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d8ffa943863'
down_revision = '974e70c59ab9'


def upgrade() -> None:
    op.create_table(
        'job_offers',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('employer_id', sa.Integer, nullable=False),
        sa.Column('title', sa.String, nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('job_type', sa.String, nullable=True),
        sa.Column('salary_min', sa.Integer, nullable=True),
        sa.Column('salary_max', sa.Integer, nullable=True),
        sa.Column('address', sa.String, nullable=False),
        sa.Column('postal_code', sa.String, nullable=False),
        sa.Column('city', sa.String, nullable=False),
        sa.Column('location_lat', sa.Float, nullable=True),
        sa.Column('location_lon', sa.Float, nullable=True),
        sa.Column('geocoding_source', sa.String, nullable=True),
        sa.Column('geocoding_confidence', sa.Float, nullable=True),
        sa.Column('geocoding_date', sa.DateTime, nullable=True),
        sa.Column('geocoding_status', sa.String, default='pending'),
        sa.Column('geocoding_error', sa.String, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column('expires_at', sa.DateTime, nullable=False),
        sa.Column('archived_at', sa.DateTime, nullable=True),
        sa.Column('is_published', sa.Boolean, default=False),
        sa.Column('is_moderated', sa.Boolean, default=False),
        sa.Column('moderated_by_admin_id', sa.Integer, nullable=True),
        sa.Column('moderation_reason', sa.String, nullable=True),
        sa.Column('is_flagged', sa.Boolean, default=False),
        sa.Column('flag_reason', sa.String, nullable=True),
        sa.ForeignKeyConstraint(['employer_id'], ['employer_profiles.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_job_offers_employer', 'job_offers', ['employer_id'])
    op.create_index('idx_job_offers_created', 'job_offers', ['created_at'])
    op.create_index('idx_job_offers_city', 'job_offers', ['city'])
    op.create_index('idx_job_offers_location', 'job_offers', ['location_lat', 'location_lon'])

def downgrade() -> None:
    op.drop_index('idx_job_offers_location')
    op.drop_index('idx_job_offers_city')
    op.drop_index('idx_job_offers_created')
    op.drop_index('idx_job_offers_employer')
    op.drop_table('job_offers')
