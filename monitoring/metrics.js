const client = require("prom-client");

// collect default Node.js metrics
client.collectDefaultMetrics();

/**
 * HTTP request duration
 */
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

/**
 * Login attempts counter
 */
const loginAttemptsTotal = new client.Counter({
  name: "login_attempts_total",
  help: "Total number of login attempts",
  labelNames: ["result"], // success | failure
});

/**
 * DB pool gauges (optional but ready)
 */
const dbPoolSize = new client.Gauge({
  name: "db_pool_total",
  help: "Total DB pool connections",
});

const dbPoolIdle = new client.Gauge({
  name: "db_pool_idle",
  help: "Idle DB pool connections",
});

const dbPoolWaiting = new client.Gauge({
  name: "db_pool_waiting",
  help: "Waiting DB pool connections",
});

module.exports = {
  client,
  httpRequestDuration,
  loginAttemptsTotal,
  dbPoolSize,
  dbPoolIdle,
  dbPoolWaiting,
};
