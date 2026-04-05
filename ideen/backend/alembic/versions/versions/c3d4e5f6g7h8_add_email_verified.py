"""Add email_verified to users table.

Revision ID: c3d4e5f6g7h8
Revises: b1a2c3d4e5f6
Create Date: 2026-03-06
"""

from alembic import op
import sqlalchemy as sa

revision = "c3d4e5f6g7h8"
down_revision = "b1a2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )
    # Mark existing admin/team users as verified
    op.execute("UPDATE users SET email_verified = true WHERE user_type IN ('admin', 'team')")


def downgrade() -> None:
    op.drop_column("users", "email_verified")
