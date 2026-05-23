"""users table + FKs from cart_items.user_id, orders.user_id

Revision ID: 0002_users_table
Revises: 0001_initial
Create Date: 2026-05-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_users_table"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("firebase_uid", sa.String(length=128), nullable=False, unique=True),
        sa.Column("email", sa.String(length=254), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"])

    op.execute(
        """
        INSERT INTO users (id, firebase_uid, email)
        VALUES (1, '__guest__', 'guest@local')
        ON CONFLICT (firebase_uid) DO NOTHING;
        """
    )
    op.execute("SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT MAX(id) FROM users), 1));")

    op.create_foreign_key(
        "fk_cart_items_user_id_users",
        "cart_items",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_orders_user_id_users",
        "orders",
        "users",
        ["user_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint("fk_orders_user_id_users", "orders", type_="foreignkey")
    op.drop_constraint("fk_cart_items_user_id_users", "cart_items", type_="foreignkey")
    op.drop_index("ix_users_firebase_uid", table_name="users")
    op.drop_table("users")
