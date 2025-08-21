#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Zara AI Companion...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created from .env.example');
  console.log('⚠️  Please edit .env.local with your local LLM settings\n');
} else {
  console.log('✅ .env.local already exists\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('🗄️  Setting up database...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Create database and run migrations
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema applied\n');
} catch (error) {
  console.error('❌ Failed to apply database schema:', error.message);
  process.exit(1);
}

// Run tests
console.log('🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Tests passed\n');
} catch (error) {
  console.error('❌ Some tests failed:', error.message);
  console.log('⚠️  This might be expected if your local LLM is not running\n');
}

console.log('🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure your local LLM (LM Studio or Ollama) is running');
console.log('2. Update .env.local with your LLM settings');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 For more information, check the docs/ folder');
console.log('🐛 For debugging, check the README.md file');
