// Script to create .env file
const fs = require('fs');
const path = require('path');

const envContent = `# Server
PORT=2050
NODE_ENV=development

# JWT
JWT_SECRET=itr_platform_super_secret_key_for_jwt_tokens_min_32_characters_long
JWT_EXPIRES_IN=24h

# OpenAI (for AI chatbot - add your key)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URL
FRONTEND_URL=http://localhost:2000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
} else {
  console.log('ℹ️  .env file already exists');
}
