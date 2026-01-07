# Chess Backend - EC2 Deployment Guide

This guide explains how to deploy the Chess Backend NestJS application to an EC2 instance.

## Prerequisites

- An AWS EC2 instance running Ubuntu
- SSH access to the EC2 instance
- A domain name (optional, for SSL)
- GitHub repository with Actions enabled

## Step 1: Initial EC2 Setup

1. **Connect to your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Run the setup script:**
   ```bash
   chmod +x deployment/setup-ec2.sh
   ./deployment/setup-ec2.sh
   ```

   This script will:
   - Install Node.js 20.x
   - Install PM2 for process management
   - Install Nginx as a reverse proxy
   - Set up firewall rules
   - Create deployment user
   - Create necessary directories

## Step 2: Configure Nginx

1. **Upload the Nginx configuration:**
   ```bash
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/chess-backend
   ```

2. **Edit the configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/chess-backend
   ```
   
   Replace `your-domain.com` with your actual domain name.

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/chess-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Step 3: Set Up Environment Variables

**Important:** Environment variables are managed through the `.env` file, NOT through `ecosystem.config.js`. NestJS uses `@nestjs/config` to read from the `.env` file automatically.

1. **Create .env file:**
   ```bash
   sudo nano /var/www/chess-backend/.env
   ```

2. **Add your environment variables:**
   ```env
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb://your-mongodb-connection-string
   JWT_SECRET=your-strong-jwt-secret-here
   GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Set proper permissions:**
   ```bash
   sudo chown deploy:deploy /var/www/chess-backend/.env
   sudo chmod 600 /var/www/chess-backend/.env
   ```

**Note:** The `.env` file is preserved during deployments (see deployment workflow). Make sure to create it before the first deployment, or it will be created from the backup during subsequent deployments.

## Step 4: Configure GitHub Actions

1. **Add GitHub Secrets:**
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   
   Add the following secrets:
   - `EC2_SSH_PRIVATE_KEY`: Your EC2 SSH private key
   - `EC2_HOST`: Your EC2 instance IP or domain
   - `EC2_USER`: SSH user (usually `ubuntu` or `deploy`)
   - `EC2_DOMAIN`: (Optional) Your domain name for health checks

2. **The workflow will automatically deploy on:**
   - Push to `main` branch
   - Push to `production` branch
   - Manual trigger via GitHub Actions UI

## Step 5: SSL Configuration (Optional but Recommended)

1. **Install SSL certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

2. **Auto-renewal is set up automatically by certbot**

## Step 6: Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Clone the repository:**
   ```bash
   cd /var/www/chess-backend
   git clone your-repo-url .
   ```

2. **Install dependencies:**
   ```bash
   npm ci --production
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

## Useful Commands

### PM2 Management
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Stop application
pm2 stop chess-backend

# Restart application
pm2 restart chess-backend

# View logs
pm2 logs chess-backend

# View status
pm2 status

# Monitor
pm2 monit
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Application Logs
```bash
# PM2 logs
pm2 logs chess-backend

# Application logs
tail -f /var/www/chess-backend/logs/combined.log
tail -f /var/www/chess-backend/logs/error.log
```

## Troubleshooting

### Application won't start
1. Check PM2 logs: `pm2 logs chess-backend`
2. Verify environment variables: `cat /var/www/chess-backend/.env`
3. Check MongoDB connection
4. Verify port 3001 is not in use: `sudo lsof -i :3001`

### Nginx 502 Bad Gateway
1. Check if application is running: `pm2 status`
2. Verify Nginx proxy settings
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Deployment fails
1. Check GitHub Actions logs
2. Verify SSH key permissions
3. Ensure deploy user has proper permissions
4. Check disk space: `df -h`

## Security Checklist

- [ ] SSH key authentication only (disable password auth)
- [ ] Firewall configured (UFW)
- [ ] Strong JWT_SECRET in production
- [ ] MongoDB with authentication
- [ ] SSL certificate installed
- [ ] Regular system updates
- [ ] PM2 process running as non-root user
- [ ] Environment variables secured

## Monitoring

Consider setting up:
- PM2 monitoring: `pm2 install pm2-logrotate`
- Application monitoring (e.g., New Relic, Datadog)
- Server monitoring (e.g., CloudWatch)
- Log aggregation

## Backup Strategy

1. **Database backups:** Set up MongoDB backups
2. **Application backups:** PM2 saves process list automatically
3. **Configuration backups:** Backup `/etc/nginx/` and `.env` files

## Rollback Procedure

If deployment fails:

1. **Stop current application:**
   ```bash
   pm2 stop chess-backend
   ```

2. **Restore from backup:**
   ```bash
   sudo cp -r /var/www/chess-backend-backup-YYYYMMDD-HHMMSS/* /var/www/chess-backend/
   ```

3. **Restart application:**
   ```bash
   pm2 restart chess-backend
   ```

