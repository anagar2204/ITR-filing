# Auth Service

Authentication and authorization microservice for ITR Filing Platform.

## Features

- User registration
- User login with JWT
- Token refresh
- Session management with Redis
- Rate limiting
- Password hashing with bcrypt
- Input validation
- Error handling

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token

## Environment Variables

See `.env.example`

## Testing

```bash
npm test
```
