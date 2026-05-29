module.exports = {
  apps: [
    {
      name: 'levelup-fe',
      script: 'node_modules/.bin/next',
      args: 'start -p 3007',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
    },
  ],
};
