-- Migration to add role column to users table
-- Run this SQL script against your database

-- Add the role column with a default value
ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'delta' NOT NULL;

-- Create an enum type for roles (PostgreSQL specific)
-- If you're using PostgreSQL, uncomment the lines below:
-- CREATE TYPE user_role AS ENUM ('alpha', 'delta');
-- ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Update existing users to have delta role by default
UPDATE users SET role = 'delta' WHERE role IS NULL;
