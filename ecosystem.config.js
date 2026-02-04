module.exports = {
  apps: [{
    name: "senddocu-backend",
    script: "server.js",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_restarts: 5,
    restart_delay: 3000,
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  }]
};
