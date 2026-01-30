module.exports = {
  apps: [
    {
      name: "senddocu-backend",
      script: "server.js",
      cwd: "/var/www/senddocu/backend",

      // 🔴 KEY CHANGE
      exec_mode: "cluster",
      instances: "max",   // uses all CPU cores

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        JWT_SECRET: "senddocu_super_secret_key_change_later"
      },

      // Stability guards
      listen_timeout: 8000,
      kill_timeout: 8000,
      max_restarts: 10,
      restart_delay: 2000
    }
  ]
};
