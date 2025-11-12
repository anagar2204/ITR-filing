-- Migration: Create KYC tables
-- Version: 002
-- Description: KYC information and consent logging

CREATE TABLE IF NOT EXISTS kyc_info (
    kyc_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pan VARCHAR(10) UNIQUE NOT NULL,
    pan_name VARCHAR(255),
    pan_verified BOOLEAN DEFAULT FALSE,
    pan_verified_at TIMESTAMP,
    aadhaar_masked VARCHAR(12),
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    aadhaar_verified_at TIMESTAMP,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    verification_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consent_logs (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_text TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_kyc_user ON kyc_info(user_id);
CREATE INDEX idx_kyc_pan ON kyc_info(pan);
CREATE INDEX idx_kyc_status ON kyc_info(kyc_status);
CREATE INDEX idx_consent_user ON consent_logs(user_id);
CREATE INDEX idx_consent_type ON consent_logs(consent_type);

-- Trigger for updated_at
CREATE TRIGGER update_kyc_info_updated_at BEFORE UPDATE ON kyc_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE kyc_info IS 'User KYC information (PAN, Aadhaar)';
COMMENT ON TABLE consent_logs IS 'User consent tracking for compliance';
