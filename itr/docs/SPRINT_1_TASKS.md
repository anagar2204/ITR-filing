# Sprint 1 Tasks - Week 1-2: Foundation Setup

## Sprint Goal
Set up development environment, authentication service, and basic user management

## Team Capacity
- Estimated: 80 hours
- Sprint Duration: 2 weeks

---

## User Stories

### 1. Development Environment Setup
**Priority**: P0 (Blocker)
**Story Points**: 8
**Assignee**: DevOps Lead

#### Acceptance Criteria
- [ ] Docker Compose running all infrastructure services
- [ ] PostgreSQL accessible with test connection
- [ ] MongoDB accessible with test connection
- [ ] Redis accessible with test connection
- [ ] MinIO accessible with test bucket creation
- [ ] Kong API Gateway routing requests
- [ ] All services health checks passing
- [ ] README with setup instructions
- [ ] .env.example with all required variables

#### Tasks
- [x] Create docker-compose.yml ✅
- [x] Configure PostgreSQL with init scripts ✅
- [x] Configure MongoDB with auth ✅
- [x] Set up Redis ✅
- [x] Set up MinIO S3-compatible storage ✅
- [x] Configure Kong API Gateway ✅
- [x] Set up RabbitMQ message queue ✅
- [ ] Write setup documentation
- [ ] Create health check endpoints
- [ ] Test full stack startup

---

### 2. Database Schema Setup
**Priority**: P0 (Blocker)
**Story Points**: 5
**Assignee**: Backend Lead

#### Acceptance Criteria
- [ ] PostgreSQL migrations created for core tables
- [ ] Users table with proper indexes
- [ ] KYC info table with PAN/Aadhaar fields
- [ ] Bank accounts table
- [ ] Audit logs table
- [ ] All foreign keys and constraints defined
- [ ] Seed data for testing
- [ ] Migration scripts executable via npm command

#### Tasks
- [ ] Create migration framework (Flyway/Knex)
- [ ] Write migration: 001_create_users_table
- [ ] Write migration: 002_create_kyc_info_table
- [ ] Write migration: 003_create_bank_accounts_table
- [ ] Write migration: 004_create_audit_logs_table
- [ ] Write migration: 005_create_consent_logs_table
- [ ] Create seed data script
- [ ] Document schema decisions

---

### 3. Shared Utilities Library
**Priority**: P0 (Blocker)
**Story Points**: 5
**Assignee**: Backend Developer

#### Acceptance Criteria
- [ ] Database connection modules (PostgreSQL, MongoDB, Redis)
- [ ] Logger utility (Winston/Pino)
- [ ] Error handler middleware
- [ ] Validation utilities
- [ ] Encryption/decryption utilities
- [ ] JWT token utilities
- [ ] API response formatter
- [ ] Published as internal npm package or shared folder

#### Tasks
- [ ] Set up shared folder structure
- [ ] Create DB connection factory
- [ ] Implement logger with multiple transports
- [ ] Create custom error classes
- [ ] Implement JWT sign/verify functions
- [ ] Create AES encryption utility
- [ ] Write unit tests (80%+ coverage)
- [ ] Document all utilities

---

### 4. Auth Service - User Registration
**Priority**: P0 (Critical)
**Story Points**: 8
**Assignee**: Backend Developer

#### Acceptance Criteria
- [ ] POST /api/v1/auth/register endpoint working
- [ ] Email uniqueness validated
- [ ] Password strength validated (min 8 chars, 1 uppercase, 1 number, 1 special)
- [ ] Password hashed with bcrypt (10 rounds)
- [ ] User record created in database
- [ ] Email verification token generated
- [ ] Verification email sent (mock in dev)
- [ ] Proper error responses for validation failures
- [ ] API documented in Swagger/OpenAPI

#### Tasks
- [ ] Create Express.js service skeleton
- [ ] Set up TypeScript configuration
- [ ] Implement registration route handler
- [ ] Add email validation (regex + DNS check)
- [ ] Add password validation
- [ ] Hash password with bcrypt
- [ ] Generate email verification token (JWT, 24hr expiry)
- [ ] Store user in PostgreSQL
- [ ] Queue email notification
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add API documentation

#### API Contract
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "+919876543210"
}

Response 201:
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

---

### 5. Auth Service - User Login
**Priority**: P0 (Critical)
**Story Points**: 5
**Assignee**: Backend Developer

#### Acceptance Criteria
- [ ] POST /api/v1/auth/login endpoint working
- [ ] Email and password validated
- [ ] Password verified with bcrypt
- [ ] JWT access token generated (1hr expiry)
- [ ] JWT refresh token generated (7 days expiry)
- [ ] Tokens stored in Redis with TTL
- [ ] User last login timestamp updated
- [ ] Login audit log created
- [ ] Rate limiting implemented (5 attempts per 15 min)

#### Tasks
- [ ] Implement login route handler
- [ ] Validate email format
- [ ] Fetch user from database
- [ ] Compare password hash
- [ ] Generate JWT access token
- [ ] Generate JWT refresh token
- [ ] Store session in Redis
- [ ] Update last_login_at timestamp
- [ ] Create audit log entry
- [ ] Implement rate limiting middleware
- [ ] Handle account locked scenarios
- [ ] Write tests

#### API Contract
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
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

---

### 6. Auth Service - JWT Middleware
**Priority**: P0 (Critical)
**Story Points**: 3
**Assignee**: Backend Developer

#### Acceptance Criteria
- [ ] Middleware extracts JWT from Authorization header
- [ ] Token signature verified
- [ ] Token expiry checked
- [ ] User ID extracted and attached to req.user
- [ ] Invalid token returns 401 Unauthorized
- [ ] Expired token returns 401 with specific error code
- [ ] Session validated in Redis
- [ ] Reusable across all services

#### Tasks
- [ ] Create authentication middleware
- [ ] Extract token from header
- [ ] Verify JWT signature
- [ ] Check expiry
- [ ] Validate session in Redis
- [ ] Attach user to request object
- [ ] Handle errors gracefully
- [ ] Write unit tests
- [ ] Document usage

---

### 7. User Service - Get Profile
**Priority**: P1 (High)
**Story Points**: 3
**Assignee**: Backend Developer

#### Acceptance Criteria
- [ ] GET /api/v1/users/profile endpoint working
- [ ] Requires authentication (JWT middleware)
- [ ] Returns user profile data
- [ ] PAN and Aadhaar masked in response
- [ ] KYC status included
- [ ] Bank account count included
- [ ] Cached in Redis (5 min TTL)

#### Tasks
- [ ] Create user service skeleton
- [ ] Implement get profile route
- [ ] Fetch user from PostgreSQL
- [ ] Fetch KYC info (left join)
- [ ] Count bank accounts
- [ ] Mask sensitive data
- [ ] Cache in Redis
- [ ] Write tests
- [ ] Document API

---

### 8. User Service - Update Profile
**Priority**: P1 (High)
**Story Points**: 3
**Assignee**: Backend Developer

#### Acceptance Criteria
- [ ] PUT /api/v1/users/profile endpoint working
- [ ] Requires authentication
- [ ] Allows updating: fullName, phone, dateOfBirth, gender
- [ ] Email cannot be changed (security)
- [ ] Input validation implemented
- [ ] Database transaction used
- [ ] Audit log created
- [ ] Cache invalidated on update

#### Tasks
- [ ] Implement update profile route
- [ ] Validate input fields
- [ ] Check for duplicate phone numbers
- [ ] Update user record in transaction
- [ ] Create audit log entry
- [ ] Invalidate Redis cache
- [ ] Return updated profile
- [ ] Write tests

---

### 9. CI/CD Pipeline Setup
**Priority**: P1 (High)
**Story Points**: 5
**Assignee**: DevOps Lead

#### Acceptance Criteria
- [ ] GitHub Actions workflow created
- [ ] Runs on every push to main/develop
- [ ] Linting executed
- [ ] Tests executed
- [ ] Coverage report generated
- [ ] Build succeeds
- [ ] Notifications on failure

#### Tasks
- [ ] Create .github/workflows/ci.yml
- [ ] Configure Node.js environment
- [ ] Add linting step (ESLint)
- [ ] Add testing step (Jest)
- [ ] Add coverage reporting
- [ ] Configure branch protection rules
- [ ] Set up Slack/email notifications
- [ ] Document CI/CD process

---

### 10. API Documentation
**Priority**: P2 (Medium)
**Story Points**: 2
**Assignee**: Backend Developer

#### Acceptance Criteria
- [ ] Swagger/OpenAPI spec created
- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Authentication described
- [ ] Error codes documented
- [ ] Hosted at /api-docs endpoint
- [ ] Automatically updated from code

#### Tasks
- [ ] Install swagger-jsdoc and swagger-ui-express
- [ ] Create OpenAPI base spec
- [ ] Add JSDoc comments to routes
- [ ] Generate spec from comments
- [ ] Set up /api-docs endpoint
- [ ] Test documentation UI
- [ ] Add to README

---

## Definition of Done (DoD)

For each user story to be considered "Done":

✅ **Code Complete**
- Code written and reviewed
- Follows project coding standards
- No linting errors

✅ **Tested**
- Unit tests written (min 80% coverage)
- Integration tests written
- All tests passing
- Manual testing completed

✅ **Documented**
- API endpoints documented
- Code comments added
- README updated if needed

✅ **Reviewed**
- Code review completed
- Feedback addressed
- Approved by tech lead

✅ **Deployed**
- Merged to develop branch
- Deployed to dev environment
- Smoke tests passed

---

## Sprint Schedule

### Week 1
**Day 1-2**: Environment setup, database schema
**Day 3-4**: Shared utilities, auth service skeleton
**Day 5**: User registration endpoint

### Week 2
**Day 1-2**: Login endpoint, JWT middleware
**Day 3**: User service (profile endpoints)
**Day 4**: Testing and bug fixes
**Day 5**: Documentation, CI/CD, sprint review

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database schema changes | Medium | High | Review schema thoroughly before implementation |
| JWT secret management | Low | Critical | Use secure secrets manager, never commit to git |
| Rate limiting complexity | Medium | Medium | Use proven libraries (express-rate-limit) |
| Team member availability | Medium | Medium | Cross-train team members, pair programming |

---

## Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or dependencies?

---

## Sprint Review Checklist

- [ ] All P0 stories completed
- [ ] Demo prepared for stakeholders
- [ ] Known issues documented
- [ ] Sprint metrics calculated (velocity, burndown)
- [ ] Retrospective scheduled

---

## Next Sprint Preview

Sprint 2 will focus on:
- Email verification flow
- Password reset flow
- PAN verification integration
- Aadhaar e-KYC integration
- Bank account management

Ready to start building! 🚀
