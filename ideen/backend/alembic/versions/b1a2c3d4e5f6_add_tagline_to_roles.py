"""add tagline to roles

Revision ID: b1a2c3d4e5f6
Revises: 8eacd454f4c8
Create Date: 2026-03-06 10:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1a2c3d4e5f6'
down_revision: Union[str, None] = '8eacd454f4c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('roles', sa.Column('tagline', sa.String(200), nullable=True))


def downgrade() -> None:
    op.drop_column('roles', 'tagline')
