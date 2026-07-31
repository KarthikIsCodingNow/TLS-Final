/**
 * PORTA-TLS Repeatability Analysis & Outlier Detection Engine
 * Version 2.1 Architectural Baseline - Task 7 Extension
 */

const MAX_HISTORY_WINDOW = 10;
const historyWindow = [];

export const RepeatabilityEngine = {
  /**
   * Add a validated measurement record to the 10-item sliding window
   * @param {object} record { height, dbh, distance, agb, co2, timestamp }
   */
  addScan(record) {
    if (!record || typeof record.dbh !== 'number') return;
    historyWindow.push(record);
    if (historyWindow.length > MAX_HISTORY_WINDOW) {
      historyWindow.shift();
    }
  },

  /**
   * Clear sliding window history
   */
  clearHistory() {
    historyWindow.length = 0;
  },

  /**
   * Get active sliding window contents
   */
  getHistory() {
    return [...historyWindow];
  },

  /**
   * Evaluate repeatability statistics over the sliding window (Requirement 14)
   */
  getRepeatabilityMetrics() {
    if (historyWindow.length < 2) {
      return {
        sampleCount: historyWindow.length,
        meanHeight: 0,
        meanDbh: 0,
        cvHeightPct: 0,
        cvDbhPct: 0,
        rating: 'Insufficient Data (Requires >= 2 scans)',
        color: '#888888'
      };
    }

    const heights = historyWindow.map(r => r.height);
    const dbhs = historyWindow.map(r => r.dbh);

    const calcMean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const calcStdDev = (arr, mean) => Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);

    const meanH = calcMean(heights);
    const stdDevH = calcStdDev(heights, meanH);
    const cvHPct = (stdDevH / (meanH || 1)) * 100;

    const meanD = calcMean(dbhs);
    const stdDevD = calcStdDev(dbhs, meanD);
    const cvDPct = (stdDevD / (meanD || 1)) * 100;

    // Combined Coefficient of Variation
    const avgCV = (cvHPct + cvDPct) / 2;

    let rating = 'Excellent Repeatability';
    let color = '#00ffcc';

    if (avgCV <= 5.0) {
      rating = 'Excellent Repeatability';
      color = '#00ffcc';
    } else if (avgCV <= 12.0) {
      rating = 'Good Repeatability';
      color = '#00ccff';
    } else {
      rating = 'Poor Repeatability';
      color = '#ff9900';
    }

    return {
      sampleCount: historyWindow.length,
      meanHeight: parseFloat(meanH.toFixed(2)),
      meanDbh: parseFloat(meanD.toFixed(1)),
      stdDevHeight: parseFloat(stdDevH.toFixed(2)),
      stdDevDbh: parseFloat(stdDevD.toFixed(1)),
      cvHeightPct: parseFloat(cvHPct.toFixed(1)),
      cvDbhPct: parseFloat(cvDPct.toFixed(1)),
      avgCvPct: parseFloat(avgCV.toFixed(1)),
      rating,
      color
    };
  },

  /**
   * Check if a candidate scan is an outlier compared to historic mean (>30% variance) (Requirement 15)
   * @param {number} newDbh New scan DBH in cm
   * @param {number} newHeight New scan height in meters
   */
  detectOutlier(newDbh, newHeight) {
    if (historyWindow.length < 3) {
      return { isOutlier: false, reason: null };
    }

    const metrics = this.getRepeatabilityMetrics();
    const meanDbh = metrics.meanDbh;
    const meanH = metrics.meanHeight;

    if (meanDbh > 0) {
      const dbhDiffPct = Math.abs((newDbh - meanDbh) / meanDbh) * 100;
      if (dbhDiffPct > 30.0) {
        return {
          isOutlier: true,
          diffPct: Math.round(dbhDiffPct),
          parameter: 'DBH',
          reason: `Scan rejected. Reason: DBH differs by ${Math.round(dbhDiffPct)}%. Possible alignment error.`
        };
      }
    }

    if (meanH > 0) {
      const hDiffPct = Math.abs((newHeight - meanH) / meanH) * 100;
      if (hDiffPct > 30.0) {
        return {
          isOutlier: true,
          diffPct: Math.round(hDiffPct),
          parameter: 'Height',
          reason: `Scan rejected. Reason: Height differs by ${Math.round(hDiffPct)}%. Possible pitch lock error.`
        };
      }
    }

    return { isOutlier: false, reason: null };
  }
};
