/**
 * PORTA-TLS Adaptive Hybrid Measurement Engine (AHME)
 * Version 1.0.0 (Patent Pending)
 * Computational Complexity: O(M) where M is the number of active estimators
 */
import { INVENTION_CONFIG } from './inventionConfig.js';
import { getCalibrationCorrectionFactor } from './selfCalibration.js';

export const AHME_INFO = {
  version: '1.0.0',
  description: 'Multi-Objective Minimum-Variance Measurement Fusion Optimizer',
  assumptions: [
    'Independent error profiles between sensor tilt, target distance, and pixel segmentation models.',
    'Estimator variances can be approximated by real-time standard deviation metrics.'
  ],
  failureCases: [
    'Correlated sensor bias (e.g. device calibration corrupted combined with severe slope offsets).',
    'Low lighting environments where all vision-based estimators report confidence < 0.10.'
  ]
};

/**
 * Executes dynamic weighted fusion on available height measurements
 * @param {object} inputs List of individual estimates { clinometer, reference, manual, ai, segmentation, pointcloud }
 * @returns {object} Fused output { value, confidence, error, contributions }
 */
export function fuseMeasurements(inputs) {
  const cfg = INVENTION_CONFIG.ahme;
  const methods = Object.keys(inputs);
  
  let totalWeight = 0.0;
  const weightedValues = [];
  const contributions = [];

  // 1. Calculate optimization weights for each estimator
  methods.forEach(key => {
    const est = inputs[key];
    if (!est || est.confidence < cfg.minimumConfidenceThreshold) return;

    const val = est.value;
    const confidence = est.confidence;
    
    // Variance standard deviation squared (plus regularization to prevent zero divisions)
    const variance = est.error * est.error;
    
    // Historical device bias scaling factor (1.0 default, updated via selfCalibration.js)
    const calibrationScore = getCalibrationCorrectionFactor(key);
    
    // Config priority factor
    const multiplier = cfg.methodWeights[key] || 1.0;

    // Minimum-variance optimization formula weight
    const weight = (confidence * calibrationScore * multiplier) / (variance + cfg.regularizationConstant);
    
    weightedValues.push({ key, val, weight, confidence, error: est.error });
    totalWeight += weight;
  });

  // 2. Normalization and final sum fusions
  if (totalWeight === 0.0) {
    // Fallback to simple mean if all confidence scores are zero
    return {
      value: inputs.clinometer ? inputs.clinometer.value : 0.0,
      confidence: 0.10,
      error: 1.0,
      contributions: [{ method: 'clinometer (fallback)', weightPercent: 100 }]
    };
  }

  let fusedValue = 0.0;
  let fusedConfidence = 0.0;
  let fusedVariance = 0.0;

  weightedValues.forEach(item => {
    const normalizedWeight = item.weight / totalWeight;
    fusedValue += normalizedWeight * item.val;
    fusedConfidence += normalizedWeight * item.confidence;
    fusedVariance += normalizedWeight * normalizedWeight * (item.error * item.error);

    contributions.push({
      method: item.key,
      weightPercent: Math.round(normalizedWeight * 100.0)
    });
  });

  return {
    value: parseFloat(fusedValue.toFixed(3)),
    confidence: parseFloat(fusedConfidence.toFixed(3)),
    error: parseFloat(Math.sqrt(fusedVariance).toFixed(3)),
    contributions: contributions.sort((a, b) => b.weightPercent - a.weightPercent)
  };
}
