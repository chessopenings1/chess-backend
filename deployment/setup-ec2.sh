#!/bin/bash

# Chess Backend - EC2 Setup Script
# This script sets up an EC2 instance for hosting the chess-backend NestJS application
# Run this script on your EC2 instance after initial connection

set -e

echo "🚀 Starting Chess Backend EC2 setup..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js and npm installation
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js version: $node_version"
echo "✅ npm version: $npm_version"

# Install PM2 globally for process management
echo "⚙️  Installing PM2..."
sudo npm install -g pm2

# Install build essentials (needed for native modules)
echo "🔧 Installing build essentials..."
sudo apt install -y build-essential

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/chess-backend
sudo chown -R $USER:$USER /var/www/chess-backend
sudo chmod -R 755 /var/www/chess-backend

# Create logs directory
echo "📁 Creating logs directory..."
sudo mkdir -p /var/www/chess-backend/logs
sudo chown -R $USER:$USER /var/www/chess-backend/logs
sudo chmod -R 755 /var/www/chess-backend/logs

# Backup default Nginx config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Install Certbot for SSL (optional)
echo "🔒 Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw allow 3001/tcp  # Allow backend port (if not using Nginx reverse proxy)
sudo ufw --force enable

# Create deployment user (optional but recommended)
echo "👤 Creating deployment user..."
if ! id -u deploy > /dev/null 2>&1; then
    sudo useradd -m -s /bin/bash deploy
    sudo usermod -aG sudo deploy
    echo "✅ Created 'deploy' user"
else
    echo "⚠️  'deploy' user already exists"
fi

# Set up SSH directory for deployment user
sudo mkdir -p /home/deploy/.ssh
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# Set up application directory permissions for deploy user
sudo chown -R deploy:deploy /var/www/chess-backend
sudo chmod -R 755 /var/www/chess-backend

# Create .env file template
echo "📝 Creating .env file template..."
sudo -u deploy tee /var/www/chess-backend/.env.example > /dev/null <<EOF
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chess-backend
JWT_SECRET=your-production-jwt-secret-change-this
GOOGLE_CLIENT_ID=your-google-client-id
EOF

echo ""
echo "✅ EC2 setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Add your GitHub Actions SSH public key to /home/deploy/.ssh/authorized_keys"
echo "2. Upload the nginx.conf file from deployment/nginx.conf to /etc/nginx/sites-available/chess-backend"
echo "3. Run: sudo ln -s /etc/nginx/sites-available/chess-backend /etc/nginx/sites-enabled/"
echo "4. Run: sudo nginx -t"
echo "5. Run: sudo systemctl reload nginx"
echo "6. Set up MongoDB (if using local MongoDB) or configure MongoDB connection string"
echo "7. Create /var/www/chess-backend/.env with your production environment variables"
echo "8. Configure SSL with: sudo certbot --nginx -d your-domain.com"
echo "9. Test your deployment"
echo ""
echo "🔑 Security recommendations:"
echo "- Disable password authentication in SSH (/etc/ssh/sshd_config)"
echo "- Use SSH keys only"
echo "- Keep your system updated: sudo apt update && sudo apt upgrade"
echo "- Set up monitoring and logs"
echo "- Use strong JWT_SECRET in production"
echo "- Configure MongoDB with authentication"
echo ""
echo "📚 Useful commands:"
echo "- PM2 start: pm2 start ecosystem.config.js --env production"
echo "- PM2 logs: pm2 logs chess-backend"
echo "- PM2 status: pm2 status"
echo "- PM2 restart: pm2 restart chess-backend"
