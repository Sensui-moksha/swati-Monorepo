import { Server } from 'http';
import mongoose from 'mongoose';
import { logger } from './logger';
import { stopTracer } from './tracer';
import { activePdfStreams } from './metrics';

/**
 * Handles graceful shutdown of the Node.js process, ensuring that active 
 * requests and streams are completed or safely aborted before exiting.
 */
export const setupGracefulShutdown = (server: Server) => {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);

    // In a load-balanced environment, this allows the LB to stop sending traffic 
    // to this instance while it finishes serving existing requests.
    server.close(async (err) => {
      if (err) {
        logger.error('Error during server closure', err);
        process.exit(1);
      }
      
      logger.info('HTTP server closed.');

      // Check for active streams
      const streamCount = (await activePdfStreams.get()).values[0]?.value || 0;
      if (streamCount > 0) {
        logger.warn(`Waiting for ${streamCount} active PDF streams to drain...`);
        // In a real system, you'd wait on an EventEmitter or use a timeout
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Disconnect Databases
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed.');
      }

      // Flush telemetry
      await stopTracer();

      logger.info('Graceful shutdown completed. Exiting process.');
      process.exit(0);
    });

    // Hard kill after 30 seconds if streams don't drain
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
