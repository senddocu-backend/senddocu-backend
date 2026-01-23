module.exports = {
  apps: [
    {
      name: "senddocu-backend",
      script: "server.js",
      cwd: "/var/www/senddocu/backend",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        JWT_SECRET: "senddocu_super_secret_key_change_later"
      }
    }
  ]
};
