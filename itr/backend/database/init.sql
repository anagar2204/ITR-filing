-- Database initialization script
-- This runs automatically when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE itr_platform TO itr_user;

-- Note: Individual table migrations will be run separately
-- See backend/database/migrations/ folder
