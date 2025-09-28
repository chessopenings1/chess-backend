module.exports = {
  apps: [
    {
      name: 'chess-backend',
      script: 'dist/main.js',
      instances: 1, // or 'max' to use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        MONGODB_URI: 'mongodb+srv://chessopenings1_db_user:1Q1f3QFtbtu5vEth@chess-dev.hr41aeu.mongodb.net/?retryWrites=true&w=majority&appName=Chess-dev',
        JWT_SECRET: 'chessopeningssecret'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGODB_URI: 'mongodb://localhost:27017/chess-backend',
        JWT_SECRET: 'your-production-jwt-secret-change-this'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        MONGODB_URI: 'mongodb://localhost:27017/chess-backend-staging',
        JWT_SECRET: 'your-staging-jwt-secret'
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
