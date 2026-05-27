// backend/setup.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up NTC Complaint System Backend...\n');

// Create .env file
const envContent = `PORT=5000
NODE_ENV=development

# Database Configuration (Choose one)
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ntc_sahatyri
DB_USER=root
DB_PASSWORD=root123


JWT_SECRET=your_secret_key_here
`;

fs.writeFileSync('.env', envContent);
console.log('✅ Created .env file');

// Install dependencies
console.log('📦 Installing dependencies...');
execSync('npm install express cors dotenv mysql2 sequelize', { stdio: 'inherit' });
console.log('✅ Dependencies installed');

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Create MySQL database: CREATE DATABASE ntc_sahayatri;');
console.log('2. Run: npm run dev');
console.log('3. Test: http://localhost:5000/api/health');