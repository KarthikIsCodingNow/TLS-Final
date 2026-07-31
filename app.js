/**
 * PORTA-TLS Application Entry Point
 * Version 2.0 Architectural Baseline
 */
import { initUIManager } from './src/ui/uiManager.js';
import { Logger } from './src/core/logger.js';

// Boot application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  Logger.info('PORTA-TLS system booting up');
  try {
    initUIManager();
    Logger.info('PORTA-TLS initialized successfully');
  } catch (err) {
    console.error('PORTA-TLS boot failed:', err);
  }
});
