"""Add role column to users table and fix userrole enum to lowercase

Revision ID: auto_add_role_column_and_fix_enum
Revises: 33591deca6e8
Create Date: 2025-07-24 23:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '33591deca6e8'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Rename old enum type if exists
    op.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN ALTER TYPE userrole RENAME TO userrole_old; END IF; END$$;")
    # 2. Create new enum type with lowercase values
    op.execute("CREATE TYPE userrole AS ENUM ('alpha', 'delta');")
    # 3. Add the column if it doesn't exist
    with op.get_context().autocommit_block():
        op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
                ALTER TABLE users ADD COLUMN role userrole NOT NULL DEFAULT 'delta';
            END IF;
        END$$;
        """)
    # 4. If the column already exists and is of the old type, convert it
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
            BEGIN
                ALTER TABLE users ALTER COLUMN role TYPE userrole USING LOWER(role)::userrole;
            EXCEPTION WHEN others THEN NULL; -- ignore errors if already correct
            END;
        END IF;
    END$$;
    """)
    # 5. Drop the old enum type if it exists
    op.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole_old') THEN DROP TYPE userrole_old; END IF; END$$;")

def downgrade():
    op.drop_column('users', 'role')
    op.execute("DROP TYPE userrole;") 