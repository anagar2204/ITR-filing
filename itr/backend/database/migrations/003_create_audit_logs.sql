-- Migration: Create audit logs table
-- Version: 003
-- Description: Audit trail for all user actions

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    changes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Comments
COMMENT ON TABLE audit_logs IS 'Audit trail of all user actions';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., user_login, file_return)';
COMMENT ON COLUMN audit_logs.changes IS 'Before/after values in JSON format';
