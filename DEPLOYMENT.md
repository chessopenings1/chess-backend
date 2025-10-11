# AWS CodeDeploy Deployment Configuration

This document describes the AWS CodeDeploy setup for the Chess Backend application.

## Files Overview

### 1. appspec.yml
AWS CodeDeploy configuration file that defines:
- **Deployment destination**: `/var/www/chess-backend`
- **Lifecycle hooks**: Scripts to run during deployment
- **File permissions**: Runs as `ubuntu` user

### 2. buildspec.yml
AWS CodeBuild configuration file that:
- **Runtime**: Node.js 20
- **Build process**: `npm ci` → `npm run build`
- **Artifacts**: Excludes node_modules and git files

### 3. Deployment Scripts

Located in `scripts/` directory:

#### `before_install.sh`
- Stops existing PM2 processes
- Cleans up old application files
- Preserves node_modules for faster deployment

#### `after_install.sh`
- Installs production dependencies (`npm ci --production`)
- Creates logs directory
- Sets proper file permissions

#### `application_start.sh`
- Loads environment variables from .env
- Starts application with PM2
- Saves PM2 process list
- Displays application status

#### `application_stop.sh`
- Gracefully stops the application
- Used during deployment updates

## Deployment Flow

```
1. CodeBuild Phase:
   ├─ Install Node.js 20
   ├─ Run npm ci
   ├─ Run npm run build
   └─ Create artifacts (excluding node_modules)

2. CodeDeploy Phase:
   ├─ ApplicationStop (stop existing app)
   ├─ BeforeInstall (cleanup)
   ├─ Install (copy files)
   ├─ AfterInstall (install dependencies)
   └─ ApplicationStart (start with PM2)
```

## Prerequisites

### EC2 Instance Requirements:
- Ubuntu/Linux OS
- Node.js 20+ installed
- PM2 installed globally (`npm install -g pm2`)
- CodeDeploy agent installed
- `/var/www/chess-backend` directory with proper permissions

### Environment Variables:
Create a `.env` file on the EC2 instance at `/var/www/chess-backend/.env`:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-production-jwt-secret
```

## Manual Deployment Testing

Test deployment scripts locally:

```bash
# Test before install
./scripts/before_install.sh

# Test after install
./scripts/after_install.sh

# Test application start
./scripts/application_start.sh

# Test application stop
./scripts/application_stop.sh
```

## CodeDeploy Application Setup

1. **Create CodeDeploy Application**
2. **Create Deployment Group**
3. **Configure EC2 instance tags**
4. **Set up IAM roles**:
   - CodeDeploy service role
   - EC2 instance role with S3 access

## Troubleshooting

### Check deployment logs:
```bash
# CodeDeploy agent logs
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Application logs
pm2 logs chess-backend

# Deployment script logs
sudo tail -f /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log
```

### Common issues:

1. **Permission denied**: Ensure scripts are executable (`chmod +x scripts/*.sh`)
2. **PM2 not found**: Install PM2 globally on EC2 instance
3. **Port already in use**: Check if old process is still running
4. **MongoDB connection**: Verify MONGODB_URI in .env file

## Rollback

To rollback to a previous deployment:
```bash
aws deploy create-deployment \
  --application-name chess-backend \
  --deployment-group-name production \
  --deployment-config-name CodeDeployDefault.OneAtATime \
  --description "Rollback deployment" \
  --s3-location bucket=your-bucket,key=previous-version.zip,bundleType=zip
```

## Monitoring

- **PM2 Status**: `pm2 status`
- **Application Health**: `curl http://localhost:3001`
- **Logs**: `pm2 logs chess-backend`
- **Restart**: `pm2 restart chess-backend`

