/**
 * PORTA-TLS Automatic Camera Guidance Coaching
 * Version 2.0 Architectural Baseline
 */

/**
 * Generate active coaching guidance instructions for the operator
 * @param {object} state App global state
 * @param {object} qualityResult Result from evaluateFrameQuality
 * @returns {string[]} List of action instructions
 */
export function generateGuidanceAlerts(state, qualityResult) {
  const alerts = [];

  // 1. Verify Sensor tilt and stability
  const pitchStdDev = state.diagnostics.intermediateCalculations?.pitchStdDev || 0.0;
  if (pitchStdDev > 2.0) {
    alerts.push('HOLD STEADY - Camera shaking');
  }

  const pitch = Math.abs(state.sensors.filteredPitch);
  if (pitch > 35.0) {
    alerts.push('CAMERA TILTED - Keep camera vertical');
  }

  // 2. Distance guidelines
  const dist = state.measurement.live.distance;
  if (dist > 18.0) {
    alerts.push('MOVE CLOSER - Target distance > 18m');
  } else if (dist < 1.5 && dist > 0.1) {
    alerts.push('MOVE FARTHER - Target distance < 1.5m');
  }

  // 3. Caliper target margins on screen
  const span = state.calibration.right - state.calibration.left;
  if (span < 3.5) {
    alerts.push('TREE TOO SMALL - Increase zoom or move closer');
  }

  const isEdgeBoundary = (state.calibration.left < 2 || state.calibration.right > 98);
  if (isEdgeBoundary) {
    alerts.push('TREE PARTIALLY VISIBLE - Center the trunk');
  }

  // 4. Lighting & Environment Quality checks
  if (qualityResult && qualityResult.score < 0.6) {
    qualityResult.issues.forEach(issue => {
      alerts.push(issue.toUpperCase());
    });
  }

  // 5. Reference checks
  if (state.measurement.mode === 'reference') {
    alerts.push('REFERENCE OBJECT MISSING - Align guides with marker');
  }

  // 6. Clinometer lock alignment alerts
  if (state.measurement.mode === 'clinometer') {
    if (state.measurement.clinometer.baseAngle === null) {
      alerts.push('AIM LOWER - Lock the tree base');
    } else if (state.measurement.clinometer.topAngle === null) {
      alerts.push('AIM HIGHER - Lock the tree canopy');
    }
  }

  return alerts;
}
