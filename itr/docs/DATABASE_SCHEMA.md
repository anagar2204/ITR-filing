# Database Schema Design

## Overview
The platform uses a hybrid database approach:
- **PostgreSQL**: Relational data (users, returns, transactions)
- **MongoDB**: Document storage metadata
- **Redis**: Caching and sessions

---

## PostgreSQL Schema

### 1. Users & Authentication

```sql
-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- KYC Information
CREATE TABLE kyc_info (
    kyc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pan VARCHAR(10) UNIQUE NOT NULL,
    pan_name VARCHAR(255),
    pan_verified BOOLEAN DEFAULT FALSE,
    pan_verified_at TIMESTAMP,
    aadhaar_masked VARCHAR(12), -- Last 4 digits only
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    aadhaar_verified_at TIMESTAMP,
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    verification_method VARCHAR(50), -- aadhaar_otp, digilocker, manual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_user ON kyc_info(user_id);
CREATE INDEX idx_kyc_pan ON kyc_info(pan);

-- Consent Logs
CREATE TABLE consent_logs (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- ais_access, 26as_access, digilocker
    consent_given BOOLEAN NOT NULL,
    consent_text TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consent_user ON consent_logs(user_id);
```

---

### 2. Tax Returns

```sql
-- Tax Returns
CREATE TABLE tax_returns (
    return_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assessment_year VARCHAR(10) NOT NULL, -- 2025-26
    financial_year VARCHAR(10) NOT NULL, -- 2024-25
    itr_form_type VARCHAR(10) NOT NULL, -- ITR-1, ITR-2, ITR-3, ITR-4
    tax_regime VARCHAR(10) NOT NULL, -- old, new
    filing_status VARCHAR(20) DEFAULT 'draft', -- draft, filed, verified, processed
    filing_type VARCHAR(20), -- original, revised, belated
    is_revised BOOLEAN DEFAULT FALSE,
    original_return_id UUID REFERENCES tax_returns(return_id),
    acknowledgment_number VARCHAR(50),
    filing_date DATE,
    verification_status VARCHAR(20), -- pending, verified
    verification_method VARCHAR(50), -- aadhaar_otp, netbanking, bank_account
    verification_date DATE,
    refund_amount DECIMAL(15, 2),
    tax_payable DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, assessment_year, filing_type)
);

CREATE INDEX idx_returns_user ON tax_returns(user_id);
CREATE INDEX idx_returns_ay ON tax_returns(assessment_year);
CREATE INDEX idx_returns_status ON tax_returns(filing_status);

-- Return Data (JSON blob for flexibility)
CREATE TABLE return_data (
    data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL, -- salary, house_property, capital_gains, etc.
    data JSONB NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_return_data_return ON return_data(return_id);
CREATE INDEX idx_return_data_section ON return_data(section);
CREATE INDEX idx_return_data_jsonb ON return_data USING GIN (data);
```

---

### 3. Income & Deductions

```sql
-- Salary Income
CREATE TABLE salary_income (
    salary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    employer_name VARCHAR(255),
    employer_tan VARCHAR(10),
    gross_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
    standard_deduction DECIMAL(15, 2) DEFAULT 50000,
    professional_tax DECIMAL(15, 2) DEFAULT 0,
    entertainment_allowance DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salary Components
CREATE TABLE salary_components (
    component_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_id UUID NOT NULL REFERENCES salary_income(salary_id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- basic, hra, lta, bonus, etc.
    amount DECIMAL(15, 2) NOT NULL,
    is_exempt BOOLEAN DEFAULT FALSE,
    exempt_amount DECIMAL(15, 2) DEFAULT 0
);

-- House Property Income
CREATE TABLE house_property (
    property_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    property_type VARCHAR(20) NOT NULL, -- self_occupied, let_out
    address TEXT,
    annual_rent DECIMAL(15, 2) DEFAULT 0,
    municipal_taxes DECIMAL(15, 2) DEFAULT 0,
    standard_deduction_percent INT DEFAULT 30,
    interest_on_loan DECIMAL(15, 2) DEFAULT 0,
    co_owner_share_percent INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Capital Gains
CREATE TABLE capital_gains (
    gain_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- equity, mutual_fund, property, debt
    asset_name VARCHAR(255),
    purchase_date DATE,
    sale_date DATE,
    purchase_price DECIMAL(15, 2) NOT NULL,
    sale_price DECIMAL(15, 2) NOT NULL,
    indexed_cost DECIMAL(15, 2),
    gain_type VARCHAR(10), -- LTCG, STCG
    gain_amount DECIMAL(15, 2),
    tax_rate DECIMAL(5, 2),
    exemption_claimed DECIMAL(15, 2) DEFAULT 0,
    exemption_section VARCHAR(10), -- 54, 54F, 54EC
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business/Profession Income (ITR-3/4)
CREATE TABLE business_income (
    business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    business_type VARCHAR(50), -- presumptive_44ad, presumptive_44ada, regular
    business_name VARCHAR(255),
    nature_of_business VARCHAR(255),
    turnover DECIMAL(15, 2),
    gross_profit DECIMAL(15, 2),
    net_profit DECIMAL(15, 2),
    presumptive_rate INT, -- 6 or 8 for 44AD
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Other Income
CREATE TABLE other_income (
    income_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    income_type VARCHAR(50) NOT NULL, -- interest, dividend, lottery, etc.
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deductions (Chapter VI-A)
CREATE TABLE deductions (
    deduction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    section VARCHAR(10) NOT NULL, -- 80C, 80D, 80G, etc.
    sub_section VARCHAR(10),
    description VARCHAR(255),
    claimed_amount DECIMAL(15, 2) NOT NULL,
    allowed_amount DECIMAL(15, 2),
    limit_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deductions_return ON deductions(return_id);
CREATE INDEX idx_deductions_section ON deductions(section);
```

---

### 4. TDS & Payments

```sql
-- TDS Details
CREATE TABLE tds_details (
    tds_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    deductor_name VARCHAR(255),
    deductor_tan VARCHAR(10),
    section VARCHAR(10), -- 192, 194J, 194I, etc.
    amount_paid DECIMAL(15, 2),
    tds_deducted DECIMAL(15, 2),
    date_of_deduction DATE,
    from_26as BOOLEAN DEFAULT FALSE,
    reconciliation_status VARCHAR(20), -- matched, mismatched, missing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tds_return ON tds_details(return_id);

-- Tax Payments
CREATE TABLE tax_payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    payment_type VARCHAR(20) NOT NULL, -- advance_tax, self_assessment, tds
    challan_number VARCHAR(50),
    bsr_code VARCHAR(10),
    payment_date DATE,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. Bank Accounts

```sql
-- Bank Accounts
CREATE TABLE bank_accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(255),
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    account_type VARCHAR(20), -- savings, current
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50), -- penny_drop, statement_upload
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_user ON bank_accounts(user_id);
```

---

### 6. Documents

```sql
-- Documents Metadata (files stored in S3/Blob)
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    return_id UUID REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- form16, 26as, ais, bank_statement, etc.
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_format VARCHAR(10), -- pdf, xml, csv, jpg
    storage_path TEXT NOT NULL, -- S3 key or blob path
    checksum VARCHAR(64),
    encryption_key_id VARCHAR(255), -- KMS key reference
    parse_status VARCHAR(20), -- pending, parsed, failed
    parse_quality_score DECIMAL(3, 2), -- 0.0 to 1.0
    parsed_data JSONB,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- Auto-delete after retention period
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_return ON documents(return_id);
CREATE INDEX idx_documents_type ON documents(document_type);
```

---

### 7. Validation & Errors

```sql
-- Validation Errors
CREATE TABLE validation_errors (
    error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES tax_returns(return_id) ON DELETE CASCADE,
    error_code VARCHAR(50) NOT NULL,
    error_type VARCHAR(20), -- error, warning
    field_name VARCHAR(100),
    error_message TEXT,
    suggested_fix TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_errors_return ON validation_errors(return_id);
CREATE INDEX idx_errors_resolved ON validation_errors(is_resolved);
```

---

### 8. Expert Assistance

```sql
-- Experts
CREATE TABLE experts (
    expert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    ca_membership_number VARCHAR(50),
    expertise_areas TEXT[], -- {salary, capital_gains, business, nri}
    years_of_experience INT,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_cases_handled INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, on_leave, suspended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expert Cases
CREATE TABLE expert_cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    return_id UUID REFERENCES tax_returns(return_id),
    expert_id UUID REFERENCES experts(expert_id),
    case_type VARCHAR(50) NOT NULL, -- filing, notice, query
    complexity VARCHAR(20), -- simple, medium, complex
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, review, completed, closed
    assigned_at TIMESTAMP,
    completed_at TIMESTAMP,
    sla_deadline TIMESTAMP,
    user_rating INT, -- 1 to 5
    user_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_user ON expert_cases(user_id);
CREATE INDEX idx_cases_expert ON expert_cases(expert_id);
CREATE INDEX idx_cases_status ON expert_cases(status);

-- Case Messages
CREATE TABLE case_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES expert_cases(case_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id),
    sender_type VARCHAR(10), -- user, expert
    message_text TEXT,
    attachment_url TEXT,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_case ON case_messages(case_id);
```

---

### 9. Notices & Compliance

```sql
-- Tax Notices
CREATE TABLE tax_notices (
    notice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    return_id UUID REFERENCES tax_returns(return_id),
    notice_type VARCHAR(50) NOT NULL, -- 143(1), 139(9), 245, demand
    notice_number VARCHAR(100),
    notice_date DATE,
    due_date DATE,
    description TEXT,
    amount_involved DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'received', -- received, under_review, responded, resolved
    response_text TEXT,
    response_submitted_at TIMESTAMP,
    expert_case_id UUID REFERENCES expert_cases(case_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notices_user ON tax_notices(user_id);
CREATE INDEX idx_notices_status ON tax_notices(status);
```

---

### 10. Payments & Subscriptions

```sql
-- User Subscriptions
CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- free, diy_pro, expert_basic, expert_premium
    plan_price DECIMAL(10, 2),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Payment Transactions
CREATE TABLE payment_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    subscription_id UUID REFERENCES subscriptions(subscription_id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50), -- razorpay, stripe, upi
    payment_gateway_id VARCHAR(255), -- External transaction ID
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_date TIMESTAMP,
    invoice_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user ON payment_transactions(user_id);
```

---

### 11. Notifications & Reminders

```sql
-- Notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- deadline, document_missing, refund, notice
    title VARCHAR(255),
    message TEXT,
    channel VARCHAR(20), -- email, sms, push, in_app
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_sent ON notifications(sent_at);
```

---

### 12. Audit Logs

```sql
-- Audit Trail
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL, -- login, file_return, update_profile, etc.
    resource_type VARCHAR(50), -- return, document, profile
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    changes JSONB, -- Before/after values
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

---

## MongoDB Collections

### Document Processing

```javascript
// documents_raw collection
{
  _id: ObjectId,
  documentId: UUID, // Reference to PostgreSQL
  userId: UUID,
  returnId: UUID,
  documentType: String, // form16, 26as, ais, etc.
  
  // Original file
  originalFile: {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: ISODate
  },
  
  // OCR Results
  ocrResult: {
    provider: String, // textract, google_vision, tesseract
    confidence: Number,
    text: String,
    blocks: [
      {
        text: String,
        confidence: Number,
        boundingBox: Object,
        type: String // word, line, paragraph
      }
    ],
    processedAt: ISODate
  },
  
  // Parsed Data
  parsedData: {
    pan: String,
    employerTAN: String,
    financialYear: String,
    salary: {
      gross: Number,
      taxableIncome: Number,
      tdsDeducted: Number
    },
    // ... more fields
    parserVersion: String,
    confidence: Number,
    parsedAt: ISODate
  },
  
  // Validation
  validationResults: {
    isValid: Boolean,
    errors: [
      {
        field: String,
        message: String,
        severity: String // error, warning
      }
    ],
    validatedAt: ISODate
  },
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### AI Interactions

```javascript
// ai_interactions collection
{
  _id: ObjectId,
  userId: UUID,
  sessionId: String,
  interactionType: String, // chat, optimization, validation
  
  messages: [
    {
      role: String, // user, assistant, system
      content: String,
      timestamp: ISODate
    }
  ],
  
  context: {
    returnId: UUID,
    assessmentYear: String,
    currentSection: String
  },
  
  aiMetadata: {
    model: String, // gpt-4, claude-3
    tokensUsed: Number,
    responseTime: Number,
    cost: Number
  },
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## Redis Schema

### Sessions
```
Key: session:{sessionId}
Type: Hash
TTL: 24 hours
Fields:
  - userId
  - email
  - lastActivity
  - ipAddress
```

### Rate Limiting
```
Key: ratelimit:{userId}:{endpoint}
Type: String (counter)
TTL: 1 hour
```

### Cache - User Profile
```
Key: cache:user:{userId}
Type: Hash
TTL: 1 hour
```

### Cache - Tax Computation
```
Key: cache:tax:{returnId}
Type: Hash
TTL: 30 minutes
```

### Queues (with Bull)
```
Queue: document_processing
Queue: ocr_processing
Queue: tax_computation
Queue: email_notifications
Queue: sms_notifications
```

---

## Indexes Summary

### PostgreSQL Indexes
- All foreign keys
- Email, phone, PAN (unique)
- Assessment year + user_id
- Filing status
- Document types
- JSONB fields (GIN indexes)
- Timestamp fields for filtering

### MongoDB Indexes
- `userId` + `documentType`
- `returnId`
- `createdAt` (for TTL and sorting)
- Text indexes on OCR content
- Compound indexes on frequently queried fields

---

## Data Retention Policies

| Data Type | Retention Period | Action After |
|-----------|-----------------|--------------|
| Active returns | 7 years | Archive to cold storage |
| Documents | 7 years | Auto-delete |
| Audit logs | 3 years | Archive |
| Chat history | 2 years | Delete |
| Session data | 30 days | Delete |
| Temporary uploads | 7 days | Delete if not linked to return |

---

## Security Considerations

1. **Encryption:**
   - All PII fields encrypted at application level
   - Full disk encryption at rest
   - TLS 1.3 in transit

2. **PII Masking:**
   - Aadhaar: Store only last 4 digits
   - Bank accounts: Mask middle digits
   - PAN: Never log in plain text

3. **Access Control:**
   - Row-level security (RLS) in PostgreSQL
   - Role-based access for experts
   - API-level authorization

4. **Backup:**
   - Daily automated backups
   - Point-in-time recovery enabled
   - Cross-region replication

---

## Migration Strategy

### Phase 1: Core Tables
1. Users, KYC, Bank Accounts
2. Tax Returns, Return Data
3. Documents

### Phase 2: Financial Data
1. Income tables
2. Deductions
3. TDS Details

### Phase 3: Expert & Compliance
1. Experts, Cases
2. Notices
3. Payments

### Phase 4: Operational
1. Notifications
2. Audit Logs
3. Analytics tables

---

## Next Steps

1. Review and finalize schema
2. Set up database instances (dev, staging, prod)
3. Create migration scripts (Flyway/Liquibase)
4. Set up seed data for testing
5. Configure backup and monitoring
6. Document API contracts based on schema

