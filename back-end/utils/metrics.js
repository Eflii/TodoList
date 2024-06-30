// metrics.js

const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Define your metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
});

const numberOfRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
});

const inProgressRequests = new client.Gauge({
  name: 'http_inprogress_requests',
  help: 'Number of in-progress HTTP requests',
});

const dbQueryDurationMicroseconds = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in ms',
});

const numberOfTodo = new client.Counter({
  name: 'number_of_todo',
  help: 'number of todo created',
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(numberOfRequests);
register.registerMetric(inProgressRequests);
register.registerMetric(dbQueryDurationMicroseconds);
register.registerMetric(numberOfTodo);

// Export the metrics and the registry
module.exports = {
  httpRequestDurationMicroseconds,
  numberOfRequests,
  inProgressRequests,
  dbQueryDurationMicroseconds,
  numberOfTodo,
  register,
};
