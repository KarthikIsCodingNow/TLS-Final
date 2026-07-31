/**
 * PORTA-TLS Centralized Error Handling System
 * Version 2.0 Architectural Baseline
 */
import { Logger } from './logger.js';

class CentralizedErrorHandler {
  constructor() {
    this.uiNotifier = null;
  }

  /**
   * Register a UI notification callback
   */
  registerNotifier(callback) {
    this.uiNotifier = callback;
  }

  /**
   * Handle an error systematically
   * @param {Error|string} error The error object or message
   * @param {string} context Descriptive category context (e.g., 'camera', 'gps', 'lidar')
   */
  handle(error, context = 'system') {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';

    // Standard log format
    Logger.error(`Error in [${context}]: ${message}`, stack);

    // Call UI notifier if registered
    if (this.uiNotifier) {
      try {
        this.uiNotifier(message, context);
      } catch (notifierErr) {
        Logger.error('Failed to notify UI of error:', notifierErr.message);
      }
    } else {
      // Fallback alert if UI listener is not configured
      Logger.warn(`Unhandled UI Error notification [${context}]: ${message}`);
    }
  }
}

export const ErrorHandler = new CentralizedErrorHandler();
