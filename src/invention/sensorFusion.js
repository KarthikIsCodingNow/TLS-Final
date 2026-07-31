/**
 * PORTA-TLS Adaptive Sensor Fusion, MRI, and TCS Algorithms
 * Version 1.0.0 (Patent Pending)
 * Computational Complexity: O(1) mathematical evaluations
 */
import { INVENTION_CONFIG } from './inventionConfig.js';

export const FUSION_ALGO_INFO = {
  version: '1.0.0',
  description: 'Multi-Sensor Reliability Index & Tree Visibility Estimation Model',
  assumptions: [
    'Motion blur indices represent standard camera translation noise.',
    'Vertical tree segmentation profile outlines represent complete structural visibility bounds.'
  ],
  failureCases: [
    'Dense undergrowth mimicking tree trunk edges, skewing visibility completeness ratios.',
    'Optical occlusion by solid opaque structures (walls, equipment) misclassified as leaf canopy.'
  ]
};

/**
 * Calculates the overall Measurement Reliability Index (MRI) on a scale of 0-100
 */
export function calculateMeasurementReliabilityIndex(qualityResult, pitchStdDev, finalConfidence, isCalibrated = true) {
  const cfg = INVENTION_CONFIG.sensorFusion;

  // 1. Frame Quality Component (0 - 1.0)
  const frameQualityScore = qualityResult ? qualityResult.score : 0.50;

  // 2. Sensor Jitter Component (0 - 1.0)
  // Low stddev yields high stability score
  const stabilityScore = Math.max(0.0, 1.0 - (pitchStdDev / 5.0));

  // 3. Vision Confidence Component (0 - 1.0)
  const visionScore = finalConfidence || 0.60;

  // Weighted composite sum
  let mri = 100.0 * (
    cfg.weightFrameQuality * frameQualityScore +
    cfg.weightSensorStability * stabilityScore +
    cfg.weightVisionConfidence * visionScore
  );

  // Apply calibration status penalty
  if (!isCalibrated) {
    mri *= 0.85;
  }

  return Math.round(Math.max(0.0, Math.min(100.0, mri)));
}

/**
 * Calculates the Tree Completeness Score (TCS) visibility percentage
 */
export function calculateTreeCompletenessScore(cvResult) {
  if (!cvResult || !cvResult.success) {
    return { visibilityPercent: 50, confidence: 0.30, impact: 'Incomplete scan, unable to resolve contours.' };
  }

  let baseOccluded = false;
  let canopyOccluded = false;

  const h = cvResult.canvasHeight || 640;

  // If base flare height is near viewport edge, base might be hidden
  const baseFraction = cvResult.autoBase.baseY / h;
  if (baseFraction > 0.94) {
    baseOccluded = true;
  }

  // If canopy green occlusion index is high or canopy height is near top viewport
  const topFraction = cvResult.autoTop.topY / h;
  if (topFraction < 0.08 || cvResult.autoTop.occlusionIndex > 0.70) {
    canopyOccluded = true;
  }

  let visible = 100;
  let impact = 'Nominal scanning range. Full trunk profile resolved.';

  if (baseOccluded && canopyOccluded) {
    visible = 60;
    impact = 'Base flare and canopy crown occluded. DBH variance elevated (+12%).';
  } else if (baseOccluded) {
    visible = 85;
    impact = 'Base root flare hidden. Direct soil level reference missing.';
  } else if (canopyOccluded) {
    visible = 75;
    impact = 'Canopy crown cropped. Vertical top height estimate extrapolation required.';
  }

  return {
    visibilityPercent: visible,
    confidence: parseFloat(cvResult.segment.confidence.toFixed(3)),
    impact
  };
}
