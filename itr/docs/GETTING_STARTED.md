# Getting Started - ITR Filing Platform

## Prerequisites

### Required Software
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **Python**: 3.11 or higher ([Download](https://python.org/))
- **Docker**: 20.x or higher ([Download](https://docker.com/))
- **Docker Compose**: 2.x or higher
- **Git**: Latest version

### Recommended Tools
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Docker
  - Python
  - PostgreSQL
- **Postman** or **Insomnia** for API testing
- **DBeaver** or **pgAdmin** for database management

---

## Quick Start (10 minutes)

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd itr_filling
```

### Step 2: Copy Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and update any necessary values (default values work for local development).

### Step 3: Start Infrastructure Services
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- MinIO (port 9000, 9001)
- Kong API Gateway (port 8000, 8001)
- RabbitMQ (port 5672, 15672)

**Verify services are running:**
```bash
docker-compose ps
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Set Up Database
```bash
# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### Step 6: Start Development Servers
```bash
npm run dev
```

This starts:
- Backend services (various ports)
- Web frontend (http://localhost:3000)

---

## Detailed Setup

### Backend Services Setup

Each microservice needs to be set up individually:

```bash
# Auth Service
cd backend/services/auth-service
npm install
cp .env.example .env
npm run dev

# User Service
cd backend/services/user-service
npm install
cp .env.example .env
npm run dev

# Repeat for other services...
```

### Frontend Web Setup

```bash
cd frontend/web
npm install
cp .env.local.example .env.local
npm run dev
```

Access at: http://localhost:3000

### AI Services Setup (Python)

```bash
cd ai-services/parsing-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

---

## Access Points

### Applications
- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Infrastructure
- **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin)
- **RabbitMQ Management**: http://localhost:15672 (admin / admin)
- **Kong Admin API**: http://localhost:8001

### Databases
- **PostgreSQL**: localhost:5432 (itr_user / itr_password_dev)
- **MongoDB**: localhost:27017 (admin / admin_password_dev)
- **Redis**: localhost:6379

---

## Project Structure Overview

```
itr_filling/
├── backend/
│   ├── services/
│   │   ├── auth-service/        # Authentication & authorization
│   │   ├── user-service/        # User management & KYC
│   │   ├── document-service/    # Document upload & storage
│   │   ├── parsing-service/     # Document parsing (Python)
│   │   ├── tax-compute-service/ # Tax calculations
│   │   ├── validation-service/  # Return validation
│   │   ├── filing-service/      # ITR filing & e-verification
│   │   ├── payment-service/     # Payments & subscriptions
│   │   ├── notification-service/# Notifications
│   │   ├── expert-service/      # Expert assistance
│   │   └── notice-service/      # Notice management
│   ├── shared/                  # Shared utilities
│   │   ├── database/           # DB clients & migrations
│   │   ├── utils/              # Common utilities
│   │   ├── types/              # TypeScript types
│   │   └── middleware/         # Shared middleware
│   └── api-gateway/            # Kong configuration
│
├── frontend/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/           # Next.js 14 app directory
│   │   │   ├── components/    # React components
│   │   │   ├── lib/          # Utilities
│   │   │   ├── hooks/        # Custom hooks
│   │   │   └── styles/       # Tailwind CSS
│   │   └── public/           # Static assets
│   │
│   └── mobile/                # React Native app
│       ├── src/
│       ├── android/
│       └── ios/
│
├── ai-services/               # Python AI/ML services
│   ├── ocr-service/          # OCR processing
│   ├── parser-service/       # Document parsing
│   ├── optimizer-service/    # Tax optimization
│   └── chatbot-service/      # Conversational AI
│
├── infrastructure/            # Infrastructure as Code
│   ├── terraform/            # AWS/Azure resources
│   ├── kubernetes/           # K8s manifests
│   └── docker/              # Dockerfiles
│
├── docs/                     # Documentation
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── DATABASE_SCHEMA.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── API_SPECIFICATIONS.md
│   └── GETTING_STARTED.md (this file)
│
├── scripts/                  # Utility scripts
│   ├── setup.sh             # Initial setup
│   ├── deploy.sh            # Deployment
│   └── test-data.sql        # Test data
│
└── tests/                    # Integration tests
    ├── e2e/
    └── load/
```

---

## Development Workflow

### 1. Create a New Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write code
- Write tests
- Update documentation

### 3. Test Locally
```bash
npm test
npm run lint
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

We follow [Conventional Commits](https://conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

---

## Common Tasks

### Reset Database
```bash
docker-compose down -v
docker-compose up -d postgres mongodb
npm run db:migrate
npm run db:seed
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres

# Backend service
cd backend/services/auth-service
npm run logs
```

### Run Tests
```bash
# All tests
npm test

# Specific service
cd backend/services/auth-service
npm test

# E2E tests
cd tests/e2e
npm test

# With coverage
npm test -- --coverage
```

### Build for Production
```bash
npm run build
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

### Docker Services Not Starting
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild images
docker-compose up -d --build

# Check logs
docker-compose logs
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U itr_user -d itr_platform

# Test MongoDB connection
mongosh "mongodb://admin:admin_password_dev@localhost:27017"
```

### Cannot Install Dependencies
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **Review Documentation**:
   - Read [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
   - Study [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
   - Understand [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

2. **Set Up Your IDE**:
   - Install recommended extensions
   - Configure linting and formatting
   - Set up debugging

3. **Start with Phase 1 Tasks**:
   - Begin with Week 1: Auth Service
   - Follow the roadmap sequentially
   - Update documentation as you go

4. **Join Team Communication**:
   - Set up Slack/Teams
   - Schedule daily standups
   - Use project management tool (Jira/Linear)

---

## Resources

### Documentation
- [Node.js Docs](https://nodejs.org/docs/)
- [TypeScript Docs](https://typescriptlang.org/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

### Indian Tax Resources
- [Income Tax Portal](https://eportal.incometax.gov.in/)
- [ITR Forms & Instructions](https://incometaxindia.gov.in/forms/)
- [Tax Slabs FY 2024-25](https://incometaxindia.gov.in/Pages/tax-slabs.aspx)

### Tools
- [Postman](https://postman.com/)
- [DBeaver](https://dbeaver.io/)
- [Redis Commander](https://joeferner.github.io/redis-commander/)

---

## Support

For questions or issues:
1. Check existing documentation
2. Search GitHub issues
3. Ask in team Slack/Teams channel
4. Create a GitHub issue with details

---

Happy Coding! 🚀
