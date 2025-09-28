# PM2 Configuration Guide

This guide explains how to use PM2 to manage your chess backend application in production.

## Prerequisites

Install PM2 globally:
```bash
npm install -g pm2
```

## Configuration Files

- `ecosystem.config.js` - PM2 configuration file
- `logs/` - Directory for application logs

## Available Scripts

### Development
```bash
npm run pm2:start          # Start with development environment
npm run pm2:logs           # View application logs
npm run pm2:monit          # Open PM2 monitoring dashboard
npm run pm2:status         # Check application status
```

### Production
```bash
npm run pm2:start:prod     # Start with production environment
npm run pm2:restart        # Restart the application
npm run pm2:reload         # Reload without downtime
npm run pm2:stop           # Stop the application
npm run pm2:delete         # Delete the application from PM2
```

### Staging
```bash
npm run pm2:start:staging  # Start with staging environment
```

## Environment Configuration

The PM2 config supports three environments:

### Development (default)
- NODE_ENV: development
- PORT: 3001
- MONGODB_URI: mongodb://localhost:27017/chess-backend
- JWT_SECRET: your-development-jwt-secret

### Production
- NODE_ENV: production
- PORT: 3001
- MONGODB_URI: mongodb://localhost:27017/chess-backend
- JWT_SECRET: your-production-jwt-secret-change-this

### Staging
- NODE_ENV: staging
- PORT: 3001
- MONGODB_URI: mongodb://localhost:27017/chess-backend-staging
- JWT_SECRET: your-staging-jwt-secret

## Key Features

### Process Management
- **Cluster Mode**: Uses all CPU cores for better performance
- **Auto Restart**: Automatically restarts on crashes
- **Memory Limit**: Restarts if memory usage exceeds 1GB
- **Health Monitoring**: Built-in health checks

### Logging
- **Combined Logs**: `logs/combined.log`
- **Output Logs**: `logs/out.log`
- **Error Logs**: `logs/error.log`
- **Timestamped**: All logs include timestamps

### Monitoring
- **Real-time Monitoring**: `pm2 monit`
- **Status Checking**: `pm2 status`
- **Log Viewing**: `pm2 logs chess-backend`

## Deployment Setup

### 1. Build the Application
```bash
npm run build
```

### 2. Start with PM2
```bash
# Development
npm run pm2:start

# Production
npm run pm2:start:prod
```

### 3. Verify Status
```bash
npm run pm2:status
```

### 4. Monitor Logs
```bash
npm run pm2:logs
```

## Production Deployment

### Using PM2 Deploy (Optional)
The config includes deployment settings for production and staging servers:

```bash
# Setup deployment (first time only)
pm2 deploy production setup

# Deploy to production
pm2 deploy production

# Deploy to staging
pm2 deploy staging
```

### Manual Deployment
1. Build the application: `npm run build`
2. Start with production config: `npm run pm2:start:prod`
3. Monitor: `npm run pm2:monit`

## Environment Variables

Update the environment variables in `ecosystem.config.js`:

```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3001,
  MONGODB_URI: 'your-production-mongodb-uri',
  JWT_SECRET: 'your-secure-production-jwt-secret',
  // Add other production environment variables
}
```

## Useful PM2 Commands

```bash
# View all processes
pm2 list

# View detailed info
pm2 show chess-backend

# View logs in real-time
pm2 logs chess-backend --lines 100

# Restart with zero downtime
pm2 reload chess-backend

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Save current process list
pm2 save

# Restore saved process list
pm2 resurrect
```

## Troubleshooting

### Application Won't Start
1. Check logs: `npm run pm2:logs`
2. Verify build: `npm run build`
3. Check environment variables
4. Verify MongoDB connection

### High Memory Usage
- The config automatically restarts at 1GB memory usage
- Monitor with: `npm run pm2:monit`
- Check for memory leaks in your code

### Port Already in Use
- Change the PORT in the environment configuration
- Or kill the process using the port: `lsof -ti:3001 | xargs kill -9`

## Security Notes

1. **Change JWT Secrets**: Update JWT_SECRET for production
2. **Secure MongoDB**: Use authentication and SSL for production MongoDB
3. **Environment Variables**: Never commit sensitive data to version control
4. **Firewall**: Configure firewall rules for your server
5. **HTTPS**: Use a reverse proxy (nginx) with SSL certificates
