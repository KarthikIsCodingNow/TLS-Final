/**
 * repeatabilityEngine.js - Repeatability, Measurement Drift & Convergence Analysis for CMME
 * 
 * Computes:
 * - Repeatability Score (0-100)
 * - Reproducibility & Consistency Index (0-100)
 * - Linear Measurement Drift Slopes (Height, DBH, Distance, Confidence, Sensor Drift)
 * - Early Convergence Detection (hault collection if variation < threshold)
 */

export class RepeatabilityEngine {
  /**
   * Run repeatability and drift analysis across accepted frames
   * @param {Array<Object>} acceptedFrames - Valid frames array
   * @param {Object} stats - Stats object from StatisticalAnalysis
   * @returns {Object} { repeatabilityScore, consistencyIndex, drift, convergence }
   */
  evaluate(acceptedFrames, stats) {
    if (!acceptedFrames || acceptedFrames.length === 0) {
      return {
        repeatabilityScore: 0,
        consistencyIndex: 0,
        drift: { heightSlope: 0, dbhSlope: 0, distanceSlope: 0, confidenceSlope: 0, status: 'Stable' },
        convergence: { hasConverged: false, frameReached: 0, cvPct: 0 }
      };
    }

    const N = acceptedFrames.length;

    // 1. Repeatability Score (0 - 100) based on Height & DBH CV %
    const heightCv = stats.height?.cvPct || 0;
    const dbhCv = stats.dbh?.cvPct || 0;
    const avgCv = (heightCv + dbhCv) / 2;

    // Higher CV = Lower Repeatability
    const repeatabilityScore = Math.max(0, Math.min(100, Number((100 * Math.exp(-0.15 * avgCv)).toFixed(1))));

    // 2. Consistency Index (0 - 100)
    const avgReliability = acceptedFrames.reduce((acc, f) => acc + (f.cepe?.reliabilityIndex || 80), 0) / N;
    const consistencyIndex = Math.max(0, Math.min(100, Number((0.50 * repeatabilityScore + 0.50 * avgReliability).toFixed(1))));

    // 3. Measurement Drift Analysis (Linear Regression Slopes across frame indices)
    const frameIndices = acceptedFrames.map((_, i) => i + 1);
    const heightValues = acceptedFrames.map(f => f.dimensions.height);
    const dbhValues = acceptedFrames.map(f => f.dimensions.dbh);
    const distanceValues = acceptedFrames.map(f => f.dimensions.distance);
    const confidenceValues = acceptedFrames.map(f => f.cepe.confidencePct);

    const heightSlope = this.computeSlope(frameIndices, heightValues);
    const dbhSlope = this.computeSlope(frameIndices, dbhValues);
    const distanceSlope = this.computeSlope(frameIndices, distanceValues);
    const confidenceSlope = this.computeSlope(frameIndices, confidenceValues);

    let driftStatus = 'Stable';
    if (Math.abs(heightSlope) > 0.05 || Math.abs(dbhSlope) > 0.3) {
      driftStatus = heightSlope > 0 ? 'Upward Drift' : 'Downward Drift';
    }

    const drift = {
      heightSlope: Number(heightSlope.toFixed(4)),
      dbhSlope: Number(dbhSlope.toFixed(4)),
      distanceSlope: Number(distanceSlope.toFixed(4)),
      confidenceSlope: Number(confidenceSlope.toFixed(4)),
      status: driftStatus
    };

    // 4. Convergence Analysis (Early Stopping Check)
    const convergence = this.checkConvergence(acceptedFrames, N);

    return {
      repeatabilityScore,
      consistencyIndex,
      drift,
      convergence
    };
  }

  /**
   * Evaluate whether measurement series has converged for early stopping
   * Threshold: Last 4 frames Height CV < 0.8% (0.008)
   */
  checkConvergence(frames, totalCount) {
    if (totalCount < 5) {
      return { hasConverged: false, frameReached: totalCount, cvPct: 100, message: 'Collecting frames...' };
    }

    // Look at last 4 frames
    const recent = frames.slice(-4);
    const recentHeights = recent.map(f => f.dimensions.height);
    const mean = recentHeights.reduce((a, b) => a + b, 0) / recentHeights.length;
    const stdDev = Math.sqrt(recentHeights.reduce((acc, h) => acc + Math.pow(h - mean, 2), 0) / recentHeights.length);
    const cvPct = mean > 0 ? (stdDev / mean) * 100 : 100;

    // Early convergence condition: CV < 0.8% across 4 frames
    const hasConverged = cvPct < 0.8;

    return {
      hasConverged,
      frameReached: totalCount,
      cvPct: Number(cvPct.toFixed(2)),
      message: hasConverged 
        ? `Consensus Converged at Frame ${totalCount} (CV=${cvPct.toFixed(2)}% < 0.8% threshold)` 
        : `Collection active (CV=${cvPct.toFixed(2)}%)`
    };
  }

  /**
   * Helper: Calculate linear regression slope y = m*x + b
   */
  computeSlope(X, Y) {
    const n = X.length;
    if (n < 2) return 0;

    const sumX = X.reduce((a, b) => a + b, 0);
    const sumY = Y.reduce((a, b) => a + b, 0);
    const sumXY = X.reduce((acc, x, i) => acc + x * Y[i], 0);
    const sumXX = X.reduce((acc, x) => acc + x * x, 0);

    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) return 0;

    return (n * sumXY - sumX * sumY) / denom;
  }
}
