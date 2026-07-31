/**
 * PORTA-TLS Diameter at Breast Height (DBH) Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Calculate trunk DBH in centimeters using perspective scaling
 * Formula: DBH = 2 * D * tan(HFOV / 2) * (S_dbh)
 * where S_dbh = right% - left%
 */
export function estimateTrunkDbh({
  distanceMeters,
  distanceError,
  distanceConfidence,
  leftPercent,
  rightPercent,
  hfovDeg,
  calibrationData = null
}) {
  const spanPercent = Math.max(0.5, rightPercent - leftPercent);
  const activeHfovDeg = calibrationData?.HFOV || hfovDeg || CONFIG.camera.defaultHfovDeg;
  const dbhCorr = calibrationData?.dbhCorrectionFactor || 1.0;

  const hfovRad = activeHfovDeg * (Math.PI / 180);
  const d = distanceMeters;

  const tanHfov2 = Math.tan(hfovRad / 2.0);
  
  // DBH in centimeters with calibration correction factor
  const rawDbhCm = 2.0 * d * tanHfov2 * (spanPercent / 100.0) * 100.0;
  const dbhCm = rawDbhCm * dbhCorr;
  
  // --- Uncertainty Propagation ---
  const sigmaD = distanceError;
  const sigmaSpan = CONFIG.uncertainty.dragPercent;
  const sigmaHfov = 1.0 * (Math.PI / 180); // 1 degree focal variance in HFOV

  // Partials
  const dDbh_dD = 2.0 * tanHfov2 * spanPercent;
  const dDbh_dSpan = 2.0 * d * tanHfov2;

  const halfHfovRad = hfovRad / 2.0;
  const sec2Hfov2 = 1.0 / Math.pow(Math.cos(halfHfovRad), 2);
  const dDbh_dHfov = 2.0 * d * spanPercent * (0.5 * sec2Hfov2);

  const varianceDbh = (dDbh_dD * dDbh_dD * sigmaD * sigmaD) +
                      (dDbh_dSpan * dDbh_dSpan * sigmaSpan * sigmaSpan) +
                      (dDbh_dHfov * dDbh_dHfov * sigmaHfov * sigmaHfov);

  const errorEstimate = Math.max(0.05, Math.sqrt(varianceDbh));

  // --- Confidence Scoring ---
  // If the tree trunk is extremely narrow on screen (e.g. < 5% width), resolution error is high
  const spanConfidence = Math.min(1.0, spanPercent / 10.0);
  const confidence = Math.max(0.05, Math.min(0.95, distanceConfidence * spanConfidence));

  return {
    dbh: parseFloat(dbhCm.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(3)),
    error: parseFloat(errorEstimate.toFixed(3))
  };
}
