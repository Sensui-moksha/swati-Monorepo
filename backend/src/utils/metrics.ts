import client from 'prom-client';

// Create a Registry which registers the metrics
export const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'swathi-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom business metrics
export const activePdfStreams = new client.Gauge({
  name: 'swathi_active_pdf_streams',
  help: 'Number of concurrent active PDF chunk streaming sessions'
});
register.registerMetric(activePdfStreams);

export const pdfChunksDelivered = new client.Counter({
  name: 'swathi_pdf_chunks_delivered_total',
  help: 'Total number of PDF byte chunks successfully delivered to clients'
});
register.registerMetric(pdfChunksDelivered);

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);
