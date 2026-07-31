/**
 * measurementGrade.js - Measurement Grade & Reliability Index Engine for CEPE
 * 
 * Implements:
 * - Grade A+ (>= 97%), Grade A (92-96%), Grade B (85-91%), Grade C (75-84%), Grade D (< 75%)
 * - Reliability Index (0–100): Standalone metric evaluating sensor agreement,
 *   environmental stability, tracking stability, and historical repeatability.
 */

export class MeasurementGradeEngine {
  /**
   * Determine measurement letter grade from confidence percentage (0-100)
   * @param {number} confidencePct 
   * @returns {Object} { grade, label, color }
   */
  calculateGrade(confidencePct) {
    const conf = Math.max(0, Math.min(100, confidencePct));

    if (conf >= 97.0) {
      return { grade: 'Grade A+', label: 'Research & Legal Patent Grade', color: '#00f2fe' };
    } else if (conf >= 92.0) {
      return { grade: 'Grade A', label: 'Commercial Inventory Grade', color: '#38ef7d' };
    } else if (conf >= 85.0) {
      return { grade: 'Grade B', label: 'Standard Field Survey Grade', color: '#ffb703' };
    } else if (conf >= 75.0) {
      return { grade: 'Grade C', label: 'Screening / Rapid Estimate', color: '#fb8500' };
    } else {
      return { grade: 'Grade D', label: 'Poor / Low Confidence Scan', color: '#ff0055' };
    }
  }

  /**
   * Calculate standalone Reliability Index (0–100)
   * Independent of raw confidence score, measuring stability & sensor consensus.
   * @param {Object} factors 17-factor quality map
   * @param {Object} amsfeOutput AMSFE output containing sensor breakdown and rejected count
   * @returns {number} Score between 0.0 and 100.0
   */
  calculateReliabilityIndex(factors = {}, amsfeOutput = {}) {
    const {
      cameraStability = 0.9,
      edgeSharpness = 0.8,
      frameConsistency = 0.85,
      deviceOrientationStability = 0.9,
      gpsAccuracy = 0.8,
      distanceReliability = 0.9
    } = factors;

    const rejectedCount = (amsfeOutput.rejectedMeasurements || []).length;
    const rejectionPenalty = rejectedCount * 8.0; // 8% penalty per rejected outlier

    // Weighted component scores
    const stabilityPart = (cameraStability * 0.35 + deviceOrientationStability * 0.35 + frameConsistency * 0.30) * 40;
    const environmentPart = (edgeSharpness * 0.50 + distanceReliability * 0.50) * 30;
    const sensorPart = (gpsAccuracy * 0.50 + (amsfeOutput.activeSensorCount ? Math.min(1.0, amsfeOutput.activeSensorCount / 5) : 0.8) * 0.50) * 30;

    const rawReliability = (stabilityPart + environmentPart + sensorPart) - rejectionPenalty;
    return Number(Math.max(10.0, Math.min(99.9, rawReliability)).toFixed(1));
  }
}

export const measurementGradeEngine = new MeasurementGradeEngine();
