/**
 * PORTA-TLS Historical Analytics & Trend Metrics Engine
 * Version 2.1 Architectural Baseline - Task 7 Extension
 */

const HISTORY_KEY = 'portatls_scientific_history_v2';

export const AnalyticsEngine = {
  /**
   * Log a scientific measurement record into persistent history (Requirement 16)
   */
  logMeasurement(record) {
    const history = this.getHistory();

    const fullRecord = {
      id: record.id || `TR-${Date.now().toString().slice(-4)}`,
      timestamp: record.timestamp || new Date().toISOString(),
      distance: record.distance || 0.0,
      distanceErr: record.distanceErr || 0.2,
      height: record.height || 0.0,
      heightErr: record.heightErr || 0.3,
      dbh: record.dbh || 0.0,
      dbhErr: record.dbhErr || 1.5,
      agb: record.agb || 0.0,
      agbErr: record.agbErr || 15.0,
      co2: record.co2 || 0.0,
      co2Err: record.co2Err || 27.0,
      confidenceScorePct: record.confidenceScorePct || 85,
      sensorStability: record.sensorStability || 'Good Stability',
      lightingQuality: record.lightingQuality || 'Good',
      sharpnessRating: record.sharpnessRating || 'Acceptable',
      calibrationVersion: record.calibrationVersion || '2.1.0-VALIDATED',
      hfov: record.hfov || 60.0,
      vfov: record.vfov || 45.0,
      deviceModel: record.deviceModel || 'Standard Mobile Camera'
    };

    history.push(fullRecord);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to store measurement history', e);
    }
    return fullRecord;
  },

  /**
   * Get full historical measurement array
   */
  getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Clear history
   */
  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  },

  /**
   * Extract trend chart data vectors (Requirement 17)
   */
  getTrendSeries() {
    const history = this.getHistory();
    if (history.length === 0) {
      return {
        labels: [],
        distances: [],
        heights: [],
        dbhs: [],
        confidences: [],
        heightErrors: []
      };
    }

    const labels = history.map((r, i) => r.id || `#${i+1}`);
    const distances = history.map(r => r.distance);
    const heights = history.map(r => r.height);
    const dbhs = history.map(r => r.dbh);
    const confidences = history.map(r => r.confidenceScorePct);
    const heightErrors = history.map(r => r.heightErr);

    return {
      labels,
      distances,
      heights,
      dbhs,
      confidences,
      heightErrors
    };
  }
};
