/**
 * PORTA-TLS Multi-Vector Confidence Scoring & Reliability Engine
 * Version 2.1 Architectural Baseline - Task 7 Extension
 */

/**
 * Classify Distance Reliability based on Clinometer Base Angle theta_base (Requirement 9)
 * @param {number} baseAngleDeg Absolute base angle in degrees
 */
export function classifyDistanceReliability(baseAngleDeg) {
  const absAngle = Math.abs(baseAngleDeg || 0);

  if (absAngle > 25.0) {
    return {
      classification: 'Excellent',
      score: 1.0,
      color: '#00ffcc',
      warning: null,
      isValid: true
    };
  } else if (absAngle >= 15.0) {
    return {
      classification: 'Good',
      score: 0.85,
      color: '#00ccff',
      warning: null,
      isValid: true
    };
  } else if (absAngle >= 8.0) {
    return {
      classification: 'Moderate',
      score: 0.65,
      color: '#ffcc00',
      warning: null,
      isValid: true
    };
  } else if (absAngle >= 5.0) {
    return {
      classification: 'Poor',
      score: 0.40,
      color: '#ff9900',
      warning: 'Shallow base angle. Move closer to tree for better accuracy.',
      isValid: true
    };
  } else {
    return {
      classification: 'Invalid',
      score: 0.0,
      color: '#ff3333',
      warning: 'Base angle too shallow (<5°). Move closer to the tree.',
      isValid: false
    };
  }
}

/**
 * Determine locking Angle Quality Color Indicator (Requirement 10)
 * @param {number} baseAngleDeg Base angle in degrees
 * @param {number} topAngleDeg Top angle in degrees
 */
export function getAngleQualityIndicator(baseAngleDeg, topAngleDeg) {
  const absBase = Math.abs(baseAngleDeg || 0);
  const absTop = Math.abs(topAngleDeg || 0);

  if (absBase >= 15.0 && absTop <= 75.0) {
    return { status: 'Green', color: '#00ffcc', label: 'Optimal Angle Geometry' };
  } else if (absBase >= 8.0 && absTop <= 82.0) {
    return { status: 'Yellow', color: '#ffcc00', label: 'Sub-optimal Angle Geometry' };
  } else {
    return { status: 'Red', color: '#ff3333', label: 'Poor Angle Geometry - High Variance' };
  }
}

/**
 * Compute overall 0-100% Confidence Score using 6 weighted vectors (Requirement 6)
 * Weights:
 * - 25% Camera Stability
 * - 20% Lighting Quality
 * - 20% AI Confidence
 * - 15% Sensor Stability
 * - 10% Distance Quality
 * - 10% Calibration Quality
 */
export function calculateSystemConfidenceScore({
  cameraStabilityScore = 0.90, // 0.0 - 1.0
  lightingScore = 0.85,        // 0.0 - 1.0
  aiConfidence = 0.85,         // 0.0 - 1.0
  sensorStabilityScore = 0.95, // 0.0 - 1.0
  distanceQualityScore = 0.90, // 0.0 - 1.0
  calibrationQualityScore = 0.95 // 0.0 - 1.0
}) {
  const scoreFactor = 
    0.25 * cameraStabilityScore +
    0.20 * lightingScore +
    0.20 * aiConfidence +
    0.15 * sensorStabilityScore +
    0.10 * distanceQualityScore +
    0.10 * calibrationQualityScore;

  const scorePct = Math.round(Math.max(0, Math.min(100, scoreFactor * 100)));

  let rating = 'Excellent';
  let color = '#00ffcc';

  if (scorePct >= 85) {
    rating = 'Excellent';
    color = '#00ffcc';
  } else if (scorePct >= 70) {
    rating = 'Good';
    color = '#00ccff';
  } else if (scorePct >= 50) {
    rating = 'Fair';
    color = '#ffcc00';
  } else {
    rating = 'Poor';
    color = '#ff3333';
  }

  return {
    scorePct,
    rating,
    color,
    breakdown: {
      cameraStability: Math.round(cameraStabilityScore * 100),
      lighting: Math.round(lightingScore * 100),
      aiConfidence: Math.round(aiConfidence * 100),
      sensorStability: Math.round(sensorStabilityScore * 100),
      distanceQuality: Math.round(distanceQualityScore * 100),
      calibrationQuality: Math.round(calibrationQualityScore * 100)
    }
  };
}
