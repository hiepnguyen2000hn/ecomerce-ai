module.exports = {
  apps: [
    {
      name: 'levelup-fe',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3007',
      cwd: '/var/www/levelup.relipasoft.com/html/levelup/levelup_fe',
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
