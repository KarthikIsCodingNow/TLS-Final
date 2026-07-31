/**
 * PORTA-TLS Proprietary Confidence Fusion Engine
 * Task 11: Combines 8 quality vectors into Global Measurement Confidence.
 */

export class ConfidenceFusionEngine {
  constructor() {
    this.name = 'ConfidenceFusionEngine';
    this.version = 'v2.5.0-proprietary';
  }

  /**
   * Fuse quality factors into Global Measurement Confidence
   */
  fuseQualityVectors(qualityVectors = {}, weights = {}) {
    const {
      sensorQuality = 0.90,
      imageQuality = 0.85,
      detectionQuality = 0.88,
      calibrationQuality = 0.92,
      environmentalQuality = 0.80,
      historicalConsistency = 0.94,
      repeatability = 0.91,
      measurementStability = 0.89
    } = qualityVectors;

    const defaultWeights = {
      wSens: 0.15,
      wImg: 0.15,
      wDet: 0.15,
      wCal: 0.15,
      wEnv: 0.10,
      wHist: 0.10,
      wRep: 0.10,
      wStab: 0.10
    };

    const activeWeights = { ...defaultWeights, ...weights };
    const weightSum = Object.values(activeWeights).reduce((a, b) => a + b, 0);

    const globalConfidence = (
      sensorQuality * activeWeights.wSens +
      imageQuality * activeWeights.wImg +
      detectionQuality * activeWeights.wDet +
      calibrationQuality * activeWeights.wCal +
      environmentalQuality * activeWeights.wEnv +
      historicalConsistency * activeWeights.wHist +
      repeatability * activeWeights.wRep +
      measurementStability * activeWeights.wStab
    ) / Math.max(0.01, weightSum);

    return {
      globalConfidence: Number(Math.max(0, Math.min(1, globalConfidence)).toFixed(4)),
      vectors: {
        sensorQuality,
        imageQuality,
        detectionQuality,
        calibrationQuality,
        environmentalQuality,
        historicalConsistency,
        repeatability,
        measurementStability
      },
      weights: activeWeights,
      fusionFormula: 'C_global = sum(w_i * Q_i) / sum(w_i)'
    };
  }
}
