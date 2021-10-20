module.exports = {
  apps: [
    // Preprod
    {
      name: 'PACA-API-DEV',
      script: 'server.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        COMMON_VARIABLE: 'true',
        NODE_ENV: 'development'
      },
      exec_mode: 'cluster',
      instances: 1
    },
    {
      name: 'PACA-API',
      script: 'server.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        COMMON_VARIABLE: 'true',
        NODE_ENV: 'production'
      },
      exec_mode: 'cluster',
      instances: 1
    }
  ]
};
