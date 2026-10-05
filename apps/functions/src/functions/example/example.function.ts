/**
 * Example Cloud Function - Replace with your actual business logic
 * 
 * This is a minimal example showing the structure for Cloud Functions.
 * Replace this with your actual function implementations.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

/**
 * Example HTTP function
 */
export const exampleFunction = onRequest(
  {
    cors: true,
  },
  async (request, response) => {
    try {
      logger.info('Example function called');
      
      const result = {
        message: 'Hello from example function!',
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.path
      };
      
      response.status(200).json(result);
    } catch (error) {
      logger.error('Error in example function:', error);
      response.status(500).json({
        error: 'Internal server error',
        message: 'An error occurred processing your request'
      });
    }
  }
);
