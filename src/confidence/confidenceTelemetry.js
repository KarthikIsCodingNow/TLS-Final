/**
 * confidenceTelemetry.js - Prediction Telemetry Logger & Exporter for CEPE
 * 
 * Logs prediction cycles and handles exports containing:
 * - Confidence & Expected Error
 * - Measurement Grade & Reliability Index
 * - 17 Quality Factors
 * - 68%, 95%, 99% Confidence Intervals
 * - Sensor Breakdown & Error Attribution
 */

export class ConfidenceTelemetryEngine {
  constructor() {
    this.predictionLogs = [];
    this.maxLogs = 200;
  }

  /**
   * Log a completed CEPE evaluation cycle
   * @param {Object} record 
   */
  logCycle(record) {
    const entry = {
      id: `CEPE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: record.timestamp || Date.now(),
      confidencePct: record.confidencePct,
      grade: record.grade,
      reliabilityIndex: record.reliabilityIndex,
      dimensions: record.dimensions,
      expectedErrors: record.expectedErrors,
      percentageErrors: record.percentageErrors,
      confidenceIntervals: record.confidenceIntervals,
      qualityFactors: record.qualityFactors,
      errorContributors: record.errorContributors,
      explanations: record.explanations,
      recommendations: record.recommendations
    };

    this.predictionLogs.unshift(entry);
    if (this.predictionLogs.length > this.maxLogs) {
      this.predictionLogs.pop();
    }

    return entry;
  }

  /**
   * Retrieve recent logs
   * @param {number} limit 
   * @returns {Array<Object>}
   */
  getRecentLogs(limit = 20) {
    return this.predictionLogs.slice(0, limit);
  }

  /**
   * Export all prediction telemetry logs as CSV format string
   * @returns {string}
   */
  exportTelemetryCSV() {
    if (!this.predictionLogs.length) {
      return 'TIMESTAMP,CONFIDENCE_PCT,GRADE,RELIABILITY_INDEX,HEIGHT_M,HEIGHT_ERR,DBH_CM,DBH_ERR,BIOMASS_KG,CARBON_KG\n';
    }

    const headers = [
      'TIMESTAMP',
      'CONFIDENCE_PCT',
      'GRADE',
      'RELIABILITY_INDEX',
      'HEIGHT_M',
      'HEIGHT_ERR_95CI',
      'DBH_CM',
      'DBH_ERR_95CI',
      'BIOMASS_KG',
      'BIOMASS_ERR_95CI',
      'CARBON_KG',
      'CARBON_ERR_95CI',
      'CAMERA_STABILITY',
      'LIGHTING_QUALITY',
      'EDGE_SHARPNESS',
      'GPS_ACCURACY_M'
    ];

    const rows = this.predictionLogs.map(item => {
      const d = item.dimensions || {};
      const ci = item.confidenceIntervals || {};
      const q = item.qualityFactors || {};

      return [
        new Date(item.timestamp).toISOString(),
        item.confidencePct,
        `"${item.grade?.grade || ''}"`,
        item.reliabilityIndex,
        d.height || 0,
        ci.height?.ci95?.margin || 0,
        d.dbh || 0,
        ci.dbh?.ci95?.margin || 0,
        d.biomass || 0,
        ci.biomass?.ci95?.margin || 0,
        d.carbon || 0,
        ci.carbon?.ci95?.margin || 0,
        q.cameraStability || 0,
        q.lightingQuality || 0,
        q.edgeSharpness || 0,
        q.gpsAccuracy || 0
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Export all prediction telemetry logs as JSON string
   * @returns {string}
   */
  exportTelemetryJSON() {
    return JSON.stringify(this.predictionLogs, null, 2);
  }

  /**
   * Clear log buffer
   */
  clear() {
    this.predictionLogs = [];
  }
}

export const confidenceTelemetryEngine = new ConfidenceTelemetryEngine();
