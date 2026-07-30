import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { logger } from './logger';

// Setup OpenTelemetry SDK with OTLP HTTP Exporter (e.g., Jaeger)
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTLP_TRACE_ENDPOINT || 'http://localhost:4318/v1/traces',
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'swathi-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

// Initialize the SDK
export const startTracer = async () => {
  try {
    await sdk.start();
    logger.info('OpenTelemetry Tracing initialized');
  } catch (error) {
    logger.error('Error initializing OpenTelemetry', error);
  }
};

// Gracefully shutdown the SDK on process exit
export const stopTracer = async () => {
  try {
    await sdk.shutdown();
    logger.info('OpenTelemetry Tracing terminated');
  } catch (error) {
    logger.error('Error terminating OpenTelemetry', error);
  }
};
