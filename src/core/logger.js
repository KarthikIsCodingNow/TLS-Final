/**
 * PORTA-TLS Developer Logging System
 * Version 2.0 Architectural Baseline
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3
};

class DeveloperLogger {
  constructor() {
    this.enabled = true;
    this.currentLevel = LogLevel.DEBUG;
  }

  setEnabled(isEnabled) {
    this.enabled = !!isEnabled;
  }

  setLevel(levelName) {
    if (LogLevel[levelName] !== undefined) {
      this.currentLevel = LogLevel[levelName];
    }
  }

  debug(message, ...args) {
    this._log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }

  info(message, ...args) {
    this._log(LogLevel.INFO, 'INFO', message, ...args);
  }

  warn(message, ...args) {
    this._log(LogLevel.WARNING, 'WARN', message, ...args);
  }

  error(message, ...args) {
    this._log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  _log(level, label, message, ...args) {
    if (!this.enabled || level < this.currentLevel) return;
    
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.mmm
    const logStr = `[PORTA-TLS][${timestamp}][${label}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logStr, ...args);
        break;
      case LogLevel.INFO:
        console.info(logStr, ...args);
        break;
      case LogLevel.WARNING:
        console.warn(logStr, ...args);
        break;
      case LogLevel.ERROR:
        console.error(logStr, ...args);
        break;
    }
  }
}

export const Logger = new DeveloperLogger();
