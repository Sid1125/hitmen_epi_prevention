"""empty message

Revision ID: 30c5feec15d0
Revises: 78d85e4c9f9c, auto_add_role_column_and_fix_enum
Create Date: 2025-07-24 17:07:47.335929

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '30c5feec15d0'
down_revision: Union[str, Sequence[str], None] = ('78d85e4c9f9c', 'a1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
