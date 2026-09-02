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
down_revision = 'de02828596c6'


def upgrade() -> None:
    op.create_table(
        'employer_profiles',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, nullable=False, unique=True),
        sa.Column('company_name', sa.String, nullable=False),
        sa.Column('company_siret', sa.String, nullable=True),
        sa.Column('verified', sa.Boolean, default=False),
        sa.Column('address', sa.String, nullable=False),
        sa.Column('postal_code', sa.String, nullable=False),
        sa.Column('city', sa.String, nullable=False),
        sa.Column('country', sa.String, default='FR'),
        sa.Column('contact_phone', sa.String, nullable=True),
        sa.Column('contact_person_name', sa.String, nullable=True),
        sa.Column('location_lat', sa.Float, nullable=True),
        sa.Column('location_lon', sa.Float, nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_employer_user', 'employer_profiles', ['user_id'])

def downgrade() -> None:
    op.drop_index('idx_employer_user')
    op.drop_table('employer_profiles')
