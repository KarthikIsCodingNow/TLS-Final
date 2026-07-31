/**
 * PORTA-TLS Measurement Consensus Engine
 * Task 11: Multi-estimator agreement solver and consensus optimization.
 */

export class ConsensusEngine {
  constructor() {
    this.name = 'ConsensusEngine';
    this.version = 'v1.1.0-proprietary';
  }

  /**
   * Compute consensus values across multiple estimation methods
   */
  computeConsensus(estimatorResults = {}) {
    const methods = Object.keys(estimatorResults);
    if (methods.length === 0) {
      return {
        consensusHeight: 0,
        consensusDbh: 0,
        consensusDistance: 0,
        consensusConfidence: 0,
        disagreementIndex: 0
      };
    }

    let totalWeight = 0;
    let weightedHeightSum = 0;
    let weightedDbhSum = 0;
    let weightedDistanceSum = 0;
    let confidenceSum = 0;

    const heightValues = [];
    const dbhValues = [];

    methods.forEach(key => {
      const est = estimatorResults[key];
      const w = Math.pow(est.confidence, 2); // quadratic weight penalty on weak estimators
      totalWeight += w;
      weightedHeightSum += est.height * w;
      weightedDbhSum += est.dbh * w;
      weightedDistanceSum += est.distance * w;
      confidenceSum += est.confidence;

      heightValues.push(est.height);
      dbhValues.push(est.dbh);
    });

    const consensusHeight = totalWeight > 0 ? weightedHeightSum / totalWeight : 0;
    const consensusDbh = totalWeight > 0 ? weightedDbhSum / totalWeight : 0;
    const consensusDistance = totalWeight > 0 ? weightedDistanceSum / totalWeight : 0;

    // Disagreement Index (Standard Deviation ratio)
    const avgHeight = heightValues.reduce((a, b) => a + b, 0) / heightValues.length;
    const heightVariance = heightValues.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / heightValues.length;
    const heightStdDev = Math.sqrt(heightVariance);
    const disagreementIndex = Math.min(1.0, heightStdDev / Math.max(1, avgHeight));

    const meanConfidence = confidenceSum / methods.length;
    const consensusConfidence = Math.max(0.1, Math.min(0.99, meanConfidence * (1.0 - disagreementIndex * 0.5)));

    return {
      consensusHeight: Number(consensusHeight.toFixed(2)),
      consensusDbh: Number(consensusDbh.toFixed(1)),
      consensusDistance: Number(consensusDistance.toFixed(2)),
      consensusConfidence: Number(consensusConfidence.toFixed(4)),
      disagreementIndex: Number(disagreementIndex.toFixed(4)),
      estimatorCount: methods.length
    };
  }
}
