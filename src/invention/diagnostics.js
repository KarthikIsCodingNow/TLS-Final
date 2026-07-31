/**
 * PORTA-TLS Self-Diagnostic Engine & Dynamic Errors
 * Version 1.0.0 (Patent Pending)
 * Computational Complexity: O(1) mathematical evaluations
 */
import { INVENTION_CONFIG } from './inventionConfig.js';
import { Logger } from '../core/logger.js';

export const DIAG_ALGO_INFO = {
  version: '1.0.0',
  description: 'Self-Diagnostic Drift Detector & Dynamic Error Propagator',
  assumptions: [
    'Dynamic variance scales linearly with distance in clinometer ranging mode.',
    'Pitch sensor jitter follows normal zero-mean Gaussian distribution profiles.'
  ],
  failureCases: [
    'Faulty hardware returning static NaN accelerometer angles (locking diagnostic sweeps).',
    'Severely degraded lenses that render constant low local contrast scores (false glare warnings).'
  ]
};

/**
 * Runs active diagnostics check on internal telemetry
 */
export function runSelfDiagnostics(state, qualityResult, pitchStdDev) {
  const cfg = INVENTION_CONFIG.diagnostics;
  const reports = [];

  // 1. Check Sensor Drift / Hand Jitter
  if (pitchStdDev > cfg.maxAllowedSensorStdDevDeg) {
    reports.push({
      system: 'IMU Sensor Stabilizer',
      status: 'JITTER WARNING',
      issue: 'Excessive device shake or hand vibration detected.',
      action: 'Hold the device steady or mount on a baseline survey pole.'
    });
  } else {
    reports.push({
      system: 'IMU Sensor Stabilizer',
      status: 'STABLE',
      issue: 'Minimal sensor jitter detected.',
      action: 'None required.'
    });
  }

  // 2. Check Calibration Drift
  const defaultHfov = 60.0;
  const calibDrift = Math.abs(state.calibration.hfov - defaultHfov);
  const driftPct = (calibDrift / defaultHfov) * 100.0;

  if (driftPct > cfg.calibrationDriftThresholdPercent) {
    reports.push({
      system: 'Optics Calibration',
      status: 'DRIFT WARNING',
      issue: `HFOV has shifted by ${driftPct.toFixed(1)}% from base specifications.`,
      action: 'Clear learning history or run a manual target calibration sweep.'
    });
  } else {
    reports.push({
      system: 'Optics Calibration',
      status: 'CALIBRATED',
      issue: 'HFOV drift within nominal tolerances.',
      action: 'None required.'
    });
  }

  // 3. Check Lighting/Camera Exposure Problems
  if (qualityResult) {
    const lux = qualityResult.brightness;
    if (lux < cfg.minIlluminationLuxEquivalent) {
      reports.push({
        system: 'Camera Feed',
        status: 'UNDEREXPOSED',
        issue: 'Low ambient illumination. Frame contours details lost.',
        action: 'Relocate target to a brighter plot or toggle auxiliary flashlight.'
      });
    } else if (lux > cfg.maxIlluminationLuxEquivalent) {
      reports.push({
        system: 'Camera Feed',
        status: 'GLARE / OVEREXPOSED',
        issue: 'Direct solar flare or intense specular reflection.',
        action: 'Shield camera lens or adjust standing angle relative to sun.'
      });
    } else {
      reports.push({
        system: 'Camera Feed',
        status: 'OPTIMAL',
        issue: 'Dynamic contrast and luminance ranges within index limits.',
        action: 'None required.'
      });
    }
  }

  return reports;
}

/**
 * Replace static error calculations with dynamic error propagation based on current parameters
 * @returns {object} { heightError, dbhError } standard deviations
 */
export function calculateDynamicErrors({ distance, height, pitchStdDev, hfovDeg, spanPercent }) {
  // Height dynamic error propagation:
  // H = d * (tan(theta_top) - tan(theta_base))
  // Variance propagation accounts for distance and angle uncertainties:
  const distError = 0.05 + (distance * 0.015); // scales with range
  const angleErrorRad = (pitchStdDev || 0.3) * (Math.PI / 180.0);
  
  // Height uncertainty estimate
  const heightErr = Math.sqrt(
    Math.pow((height / Math.max(0.1, distance)) * distError, 2) +
    Math.pow(distance * (1 / Math.max(0.1, Math.cos(angleErrorRad))), 2) * angleErrorRad * angleErrorRad
  );

  // DBH dynamic uncertainty:
  // DBH = 2 * d * tan(HFOV/2) * (spanPercent / 100)
  const hfovRad = hfovDeg * (Math.PI / 180.0);
  const dbh = 2.0 * distance * Math.tan(hfovRad / 2.0) * (spanPercent / 100.0) * 100.0;
  
  const dbhErr = Math.sqrt(
    Math.pow((dbh / Math.max(0.1, distance)) * distError, 2) +
    Math.pow(dbh * 0.05, 2) // accounts for segment pixel edge snapping variance
  );

  return {
    heightError: parseFloat(Math.max(0.05, heightErr).toFixed(3)),
    dbhError: parseFloat(Math.max(0.2, dbhErr).toFixed(2))
  };
}
