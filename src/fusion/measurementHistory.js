/**
 * measurementHistory.js - Rolling Measurement Store & Time-Series History for AMSFE
 * 
 * Maintains a rolling ring-buffer of the last 50 fusion cycles.
 * Exposes dataset extractors for plotting Height, DBH, Confidence, and Weight trajectories.
 */

export class MeasurementHistoryEngine {
  constructor(capacity = 50) {
    this.capacity = capacity;
    this.history = [];
  }

  /**
   * Add a fused output object to the rolling history
   * @param {Object} fusedOutput Standardized output object from AMSFE
   */
  recordCycle(fusedOutput) {
    if (!fusedOutput) return;

    const record = {
      timestamp: fusedOutput.timestamp || Date.now(),
      height: fusedOutput.height || 0,
      dbh: fusedOutput.dbh || 0,
      distance: fusedOutput.distance || 0,
      biomass: fusedOutput.biomass || 0,
      carbon: fusedOutput.carbon || 0,
      confidence: fusedOutput.confidence || 0,
      uncertainty: fusedOutput.uncertainty || 0,
      weights: { ...fusedOutput.weights },
      sensorBreakdown: { ...fusedOutput.sensorBreakdown },
      rejectedCount: (fusedOutput.rejectedMeasurements || []).length
    };

    this.history.push(record);
    if (this.history.length > this.capacity) {
      this.history.shift();
    }

    return record;
  }

  /**
   * Retrieve the complete rolling history array (up to last 50 items)
   * @returns {Array<Object>}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Extract plot dataset for Height trajectory
   * @returns {Array<{ x: number, y: number }>}
   */
  getHeightTrajectory() {
    return this.history.map((item, idx) => ({
      x: idx + 1,
      timestamp: item.timestamp,
      y: item.height
    }));
  }

  /**
   * Extract plot dataset for DBH trajectory
   * @returns {Array<{ x: number, y: number }>}
   */
  getDbhTrajectory() {
    return this.history.map((item, idx) => ({
      x: idx + 1,
      timestamp: item.timestamp,
      y: item.dbh
    }));
  }

  /**
   * Extract plot dataset for Confidence trajectory
   * @returns {Array<{ x: number, y: number }>}
   */
  getConfidenceTrajectory() {
    return this.history.map((item, idx) => ({
      x: idx + 1,
      timestamp: item.timestamp,
      y: item.confidence * 100
    }));
  }

  /**
   * Extract plot dataset for Sensor Weight trajectories
   * @returns {Object<string, Array<{ x: number, y: number }>>}
   */
  getWeightTrajectories() {
    const trajectories = {};
    this.history.forEach((item, idx) => {
      Object.entries(item.weights).forEach(([type, w]) => {
        if (!trajectories[type]) trajectories[type] = [];
        trajectories[type].push({
          x: idx + 1,
          timestamp: item.timestamp,
          y: Number((w * 100).toFixed(1))
        });
      });
    });
    return trajectories;
  }

  /**
   * Clear history
   */
  clear() {
    this.history = [];
  }
}

export const measurementHistoryEngine = new MeasurementHistoryEngine(50);
