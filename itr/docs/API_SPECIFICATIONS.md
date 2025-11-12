# API Specifications

## Base URL
```
Production: https://api.itrplatform.com/v1
Staging: https://api-staging.itrplatform.com/v1
```

## Authentication
All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <access_token>
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

## API Endpoints

### 1. Authentication API

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "phone": "+919876543210"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "emailVerified": false
  },
  "message": "Registration successful. Please verify your email."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600,
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    }
  }
}
```

### 2. User & KYC API

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+919876543210",
    "kycStatus": "pending",
    "panVerified": false
  }
}
```

#### Verify PAN
```http
POST /users/kyc/pan-verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "pan": "ABCDE1234F",
  "dateOfBirth": "1990-01-15"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "verified": true,
    "panName": "JOHN DOE",
    "dateOfBirth": "15/01/1990"
  }
}
```

### 3. Document API

#### Upload Document
```http
POST /documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary>,
  "documentType": "form16",
  "assessmentYear": "2025-26",
  "returnId": "uuid" (optional)
}

Response: 201 Created
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "fileName": "form16.pdf",
    "documentType": "form16",
    "uploadedAt": "2024-10-27T10:30:00Z",
    "parseStatus": "queued"
  }
}
```

#### Get Parse Status
```http
GET /documents/{documentId}/parse-status
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "parseStatus": "completed",
    "qualityScore": 0.95,
    "parsedData": {
      "pan": "ABCDE1234F",
      "employerTAN": "XYZC12345D",
      "financialYear": "2024-25",
      "grossSalary": 1500000,
      "tdsDeducted": 150000
    }
  }
}
```

### 4. Tax Return API

#### Create New Return
```http
POST /returns
Authorization: Bearer <token>
Content-Type: application/json

{
  "assessmentYear": "2025-26",
  "financialYear": "2024-25",
  "itrFormType": "ITR-1",
  "taxRegime": "new"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "returnId": "uuid",
    "status": "draft",
    "createdAt": "2024-10-27T10:30:00Z"
  }
}
```

#### Get Return Details
```http
GET /returns/{returnId}
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "returnId": "uuid",
    "assessmentYear": "2025-26",
    "itrFormType": "ITR-1",
    "taxRegime": "new",
    "status": "draft",
    "income": {
      "salary": 1500000,
      "houseProperty": 0,
      "capitalGains": 0,
      "otherIncome": 5000
    },
    "deductions": {
      "80C": 150000,
      "80D": 25000
    },
    "taxComputed": {
      "totalIncome": 1355000,
      "taxPayable": 110500,
      "tdsDeducted": 150000,
      "refundAmount": 39500
    }
  }
}
```

### 5. Tax Computation API

#### Calculate Tax
```http
POST /tax-compute/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnId": "uuid",
  "income": {
    "salary": 1500000,
    "houseProperty": 0,
    "otherIncome": 5000
  },
  "deductions": {
    "80C": 150000,
    "80D": 25000
  },
  "regime": "both" // old, new, or both
}

Response: 200 OK
{
  "success": true,
  "data": {
    "old": {
      "totalIncome": 1355000,
      "taxBeforeRebate": 197750,
      "rebate87A": 0,
      "taxPayable": 205860,
      "cess": 8110
    },
    "new": {
      "totalIncome": 1505000,
      "taxBeforeRebate": 110500,
      "rebate87A": 0,
      "taxPayable": 114920,
      "cess": 4420
    },
    "recommendation": "new",
    "savings": 90940
  }
}
```

### 6. Validation API

#### Validate Return
```http
POST /validation/validate-return
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnId": "uuid"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "isValid": false,
    "errors": [
      {
        "code": "MISSING_PAN",
        "type": "error",
        "field": "pan",
        "message": "PAN is required",
        "suggestedFix": "Please add your PAN in profile"
      }
    ],
    "warnings": [
      {
        "code": "TDS_MISMATCH",
        "type": "warning",
        "field": "tds",
        "message": "TDS in Form 16 doesn't match 26AS",
        "details": {
          "form16TDS": 150000,
          "26asTDS": 148000,
          "difference": 2000
        }
      }
    ]
  }
}
```

### 7. Filing API

#### Generate ITR XML
```http
POST /filing/generate-xml
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnId": "uuid"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "xmlFileId": "uuid",
    "xmlUrl": "presigned_s3_url",
    "expiresIn": 3600
  }
}
```

#### File Return
```http
POST /filing/file-return
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnId": "uuid",
  "digitalSignature": "base64_string"
}

Response: 202 Accepted
{
  "success": true,
  "data": {
    "filingJobId": "uuid",
    "status": "processing",
    "message": "Return filing in progress"
  }
}
```

#### E-Verify Return
```http
POST /filing/e-verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnId": "uuid",
  "method": "aadhaar_otp",
  "otp": "123456"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "verified": true,
    "verificationDate": "2024-10-27",
    "acknowledgmentNumber": "123456789012345"
  }
}
```

### 8. Expert Service API

#### Create Expert Case
```http
POST /expert/cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnId": "uuid",
  "caseType": "filing",
  "complexity": "medium",
  "description": "Need help with capital gains calculation"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "caseId": "uuid",
    "status": "open",
    "estimatedTAT": "24 hours",
    "createdAt": "2024-10-27T10:30:00Z"
  }
}
```

### 9. Notice API

#### Submit Notice
```http
POST /notices
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "noticeType": "143(1)",
  "noticeNumber": "ITBA/AST/S/143(1)/2024-25/1234567",
  "noticeDate": "2024-09-15",
  "dueDate": "2024-10-15",
  "noticeDocument": <binary>
}

Response: 201 Created
{
  "success": true,
  "data": {
    "noticeId": "uuid",
    "status": "received",
    "aiClassification": "143(1) - Intimation",
    "suggestedActions": [
      "Review computed income",
      "Check for arithmetic errors",
      "Respond within 30 days if you disagree"
    ]
  }
}
```

## Webhooks

### Payment Success
```json
POST {webhook_url}
{
  "event": "payment.success",
  "transactionId": "uuid",
  "userId": "uuid",
  "amount": 999,
  "timestamp": "2024-10-27T10:30:00Z"
}
```

### Document Parsed
```json
POST {webhook_url}
{
  "event": "document.parsed",
  "documentId": "uuid",
  "userId": "uuid",
  "parseStatus": "completed",
  "qualityScore": 0.95,
  "timestamp": "2024-10-27T10:30:00Z"
}
```

## Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| AUTH_001 | Invalid credentials | 401 |
| AUTH_002 | Token expired | 401 |
| AUTH_003 | Email not verified | 403 |
| USER_001 | User not found | 404 |
| KYC_001 | PAN verification failed | 400 |
| KYC_002 | Aadhaar verification failed | 400 |
| DOC_001 | Invalid file type | 400 |
| DOC_002 | File too large | 413 |
| DOC_003 | Parse failed | 500 |
| TAX_001 | Invalid ITR form selection | 400 |
| TAX_002 | Calculation error | 500 |
| FILING_001 | XML generation failed | 500 |
| FILING_002 | E-filing portal error | 502 |

## Rate Limits

| Tier | Requests/Hour | Burst |
|------|---------------|-------|
| Free | 100 | 10 |
| Pro | 1000 | 50 |
| Expert | 5000 | 100 |

## Versioning

- Current version: v1
- Version specified in URL: `/v1/...`
- Backward compatibility maintained for 2 versions
