"""Create Applications

Revision ID: 9d3d781a8213
Revises: 4d8ffa943863
Create Date: 2026-09-02 15:17:26.692501

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d3d781a8213'
down_revision = '4d8ffa943863'


def upgrade() -> None:
    op.create_table(
        'applications',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('job_seeker_id', sa.Integer, nullable=False),
        sa.Column('job_offer_id', sa.Integer, nullable=False),
        sa.Column('status', sa.String, default='applied'),
        sa.Column('applied_at', sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.current_timestamp()),
        sa.Column('employer_notified_at', sa.DateTime, nullable=True),
        sa.Column('employer_response_at', sa.DateTime, nullable=True),
        sa.Column('employer_response', sa.Text, nullable=True),
        sa.ForeignKeyConstraint(['job_seeker_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['job_offer_id'], ['job_offers.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_applications_seeker', 'applications', ['job_seeker_id'])
    op.create_index('idx_applications_offer', 'applications', ['job_offer_id'])

def downgrade() -> None:
    op.drop_index('idx_applications_offer')
    op.drop_index('idx_applications_seeker')
    op.drop_table('applications')
