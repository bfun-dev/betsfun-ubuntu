#!/bin/bash

# Bets.Fun Namecheap Deployment Script
# Run this script to prepare your app for Namecheap hosting

echo "🚀 Preparing Bets.Fun for Namecheap deployment..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

# Create deployment directory
echo "📁 Creating deployment package..."
mkdir -p namecheap-deploy

# Copy essential files
cp -r dist/ namecheap-deploy/
cp package.json namecheap-deploy/
cp server.js namecheap-deploy/
cp .env.example namecheap-deploy/

# Copy database exports for migration
cp database_export_*.sql namecheap-deploy/ 2>/dev/null || true

# Create deployment instructions
cat > namecheap-deploy/DEPLOY.txt << 'EOF'
BETS.FUN NAMECHEAP DEPLOYMENT INSTRUCTIONS
========================================

1. UPLOAD FILES:
   - Upload all files in this folder to your Namecheap hosting directory
   - Ensure node_modules are installed: npm install

2. ENVIRONMENT SETUP:
   - Rename .env.example to .env
   - Fill in your actual values in .env file
   - Set DATABASE_URL to your Neon PostgreSQL connection string

3. DATABASE MIGRATION:
   - Import the database_export_*.sql files to your database in this order:
     a) database_export_schema.sql
     b) database_export_users_fixed.sql
     c) database_export_badges.sql
     d) database_export_data.sql
     e) database_export_wallets.sql
     f) database_export_bets.sql
     g) database_export_user_badges.sql

4. START APPLICATION:
   - Run: node server.js
   - Or use Namecheap's Node.js app manager

5. VERIFY DEPLOYMENT:
   - Visit your domain
   - Check that login works
   - Test wallet functionality
   - Verify admin panel access

Your app should now be running on Namecheap!
EOF

# Create a simple health check script
cat > namecheap-deploy/health-check.js << 'EOF'
// Simple health check for Namecheap deployment
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/stats',
  method: 'GET'
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Bets.Fun is running correctly');
  } else {
    console.log('❌ Application health check failed');
  }
});

req.on('error', (e) => {
  console.log('❌ Cannot connect to application:', e.message);
});

req.end();
EOF

echo "✅ Deployment package created in ./namecheap-deploy/"
echo ""
echo "📋 Next steps:"
echo "1. Upload the entire 'namecheap-deploy' folder to your Namecheap hosting"
echo "2. Install dependencies: npm install"
echo "3. Configure your .env file with real values"
echo "4. Import database using the SQL files"
echo "5. Start with: node server.js"
echo ""
echo "📖 See DEPLOY.txt in the package for detailed instructions"