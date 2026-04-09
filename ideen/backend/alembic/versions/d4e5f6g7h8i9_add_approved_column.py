"""Add approved column to users table.

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2026-04-09
"""

from alembic import op
import sqlalchemy as sa

revision = "d4e5f6g7h8i9"
down_revision = "c3d4e5f6g7h8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "approved",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )
    # Mark existing admin/team users as approved
    op.execute("UPDATE users SET approved = true WHERE user_type IN ('admin', 'team')")


def downgrade() -> None:
    op.drop_column("users", "approved")
