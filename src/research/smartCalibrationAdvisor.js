/**
 * PORTA-TLS Smart Calibration Health Advisor
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export function evaluateCalibrationHealth(state) {
  const cal = state.calibrationData || {};
  let healthScore = 100;
  const reasons = [];

  // Check calibration age (> 30 days)
  if (cal.calibrationDate) {
    const ageDays = (Date.now() - new Date(cal.calibrationDate).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > 30) {
      healthScore -= 25;
      reasons.push('Calibration profile > 30 days old');
    }
  } else {
    healthScore -= 30;
    reasons.push('Uncalibrated factory defaults in use');
  }

  // Check IMU noise standard dev
  if (cal.sensorNoise && cal.sensorNoise.sigmaPitch > 0.40) {
    healthScore -= 20;
    reasons.push('IMU sensor noise exceeds 0.40° limit');
  }

  const needsRecalibration = healthScore < 70;

  return {
    needsRecalibration,
    healthScore: Math.max(0, healthScore),
    reasons,
    recommendation: needsRecalibration ? `Recalibration Recommended: ${reasons.join('; ')}` : 'Calibration Health Optimal'
  };
}
