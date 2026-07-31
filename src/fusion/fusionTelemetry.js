/**
 * fusionTelemetry.js - Real-Time Telemetry & Diagnostic Logger for AMSFE
 * 
 * Logs detailed calculation metrics for every fusion cycle:
 * - Sensor sources & input values
 * - Dynamic quality breakdown
 * - Computed weights
 * - Calculation latency & duration (ms)
 * - Rejected sensors and justification
 * - System timestamp
 */

export class FusionTelemetryEngine {
  constructor() {
    this.logs = [];
    this.maxLogs = 200;
  }

  /**
   * Log a completed fusion cycle
   * @param {Object} telemetryData 
   */
  logCycle(telemetryData) {
    const entry = {
      id: `AMSFE-TEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: telemetryData.timestamp || Date.now(),
      latencyMs: telemetryData.latencyMs || 0,
      activeSensorTypes: telemetryData.activeSensorTypes || [],
      qualityBreakdown: telemetryData.qualityBreakdown || {},
      weights: telemetryData.weights || {},
      rejectedCount: (telemetryData.rejectedMeasurements || []).length,
      rejectedMeasurements: telemetryData.rejectedMeasurements || [],
      fusedResult: {
        height: telemetryData.height,
        dbh: telemetryData.dbh,
        distance: telemetryData.distance,
        confidence: telemetryData.confidence,
        uncertainty: telemetryData.uncertainty
      }
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    return entry;
  }

  /**
   * Retrieve recent telemetry logs
   * @param {number} limit 
   * @returns {Array<Object>}
   */
  getRecentLogs(limit = 20) {
    return this.logs.slice(0, limit);
  }

  /**
   * Export all logged telemetry as JSON string
   * @returns {string}
   */
  exportTelemetryJSON() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear telemetry history
   */
  clear() {
    this.logs = [];
  }
}

export const fusionTelemetryEngine = new FusionTelemetryEngine();
