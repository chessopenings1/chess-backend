module.exports = {
  apps: [
    {
      name: 'chess-backend',
      script: 'dist/src/main.js',
      instances: 1, // or 'max' to use all CPU cores
      exec_mode: 'cluster',
      // Environment variables are loaded from .env file via NestJS ConfigModule
      // Do not hardcode secrets here - use .env file instead
      // PM2 will pass through any env vars, but NestJS reads from .env file
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto restart
      watch: false, // Set to true for development
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '1G',
      
      // Restart policy
      min_uptime: '10s',
      max_restarts: 10,
      
      // Advanced features
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Health monitoring
      health_check_grace_period: 3000,
      
      // Source map support
      source_map_support: true,
      
      // Environment specific settings
      node_args: '--max-old-space-size=1024'
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/chess-backend.git',
      path: '/var/www/chess-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/chess-backend.git',
      path: '/var/www/chess-backend-staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    }
  }
};
