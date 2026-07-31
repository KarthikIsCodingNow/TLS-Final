/**
 * PORTA-TLS Distance Estimation Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Distance Engine 1: Clinometer with Ground Slope Correction
 * Formula: D_slope = H_cam / (cos(alpha) * (tan(alpha) - tan(theta_base)))
 */
export function estimateClinometerDistance({
  cameraHeight,
  baseAngleDeg,
  slopeAngleDeg,
  pitchSensorStdDev = 0.0,
  calibrationData = null
}) {
  if (baseAngleDeg === null || baseAngleDeg === undefined) {
    return {
      distance: CONFIG.camera.defaultOverrideDistance,
      confidence: 0.05,
      error: 2.0,
      method: 'clinometer'
    };
  }

  // Apply calibration pitch bias and distance correction factor if present
  const pitchBias = calibrationData?.pitchBias || 0.0;
  const distCorr = calibrationData?.distanceCorrectionFactor || 1.0;
  const hCam = calibrationData?.cameraHeight || cameraHeight || CONFIG.camera.defaultHeight;

  const correctedBaseDeg = baseAngleDeg - pitchBias;
  const baseRad = correctedBaseDeg * (Math.PI / 180);
  const slopeRad = (slopeAngleDeg || 0.0) * (Math.PI / 180);

  const tanBase = Math.tan(baseRad);
  const tanSlope = Math.tan(slopeRad);
  const denominator = tanSlope - tanBase;

  // Protect against division by zero or negative distances (looking upwards at ground)
  if (denominator <= 0.01) {
    return {
      distance: CONFIG.camera.defaultOverrideDistance,
      confidence: 0.05,
      error: 5.0,
      method: 'clinometer'
    };
  }

  const cosSlope = Math.cos(slopeRad);
  const rawDistanceSlope = hCam / (cosSlope * denominator);
  const distanceSlope = rawDistanceSlope * distCorr;

  // --- Uncertainty Propagation (First-order Delta Method) ---
  const sigmaH = CONFIG.uncertainty.cameraHeightMeters;
  const sigmaBase = CONFIG.uncertainty.anglePitchRad + (pitchSensorStdDev * Math.PI / 180);
  const sigmaSlope = CONFIG.uncertainty.angleSlopeRad;

  // Partial derivatives
  const dD_dhCam = 1.0 / (cosSlope * denominator);
  const dD_dBase = (hCam * (1.0 / Math.pow(Math.cos(baseRad), 2))) / (cosSlope * Math.pow(denominator, 2));
  
  // dD/dSlope derivative
  const sec2Slope = 1.0 / Math.pow(Math.cos(slopeRad), 2);
  const dD_dSlope = -hCam * (sec2Slope * cosSlope - Math.sin(slopeRad) * denominator) / (Math.pow(cosSlope, 2) * Math.pow(denominator, 2));

  const varianceD = (dD_dhCam * dD_dhCam * sigmaH * sigmaH) +
                    (dD_dBase * dD_dBase * sigmaBase * sigmaBase) +
                    (dD_dSlope * dD_dSlope * sigmaSlope * sigmaSlope);
  
  const errorEstimate = Math.max(0.01, Math.sqrt(varianceD));

  // --- Confidence Scoring ---
  // Lower confidence if base angle is too close to horizontal, or if sensor noise is high
  const angleWeight = 1.0 - Math.exp(-4.0 * Math.abs(baseRad));
  const noiseWeight = Math.max(0.1, 1.0 - (pitchSensorStdDev / 2.0));
  const confidence = Math.max(0.05, Math.min(0.95, 0.90 * angleWeight * noiseWeight));

  return {
    distance: distanceSlope,
    confidence: parseFloat(confidence.toFixed(3)),
    error: parseFloat(errorEstimate.toFixed(3)),
    method: 'clinometer'
  };
}

/**
 * Distance Engine 2: Reference Marker Scaling
 * Formula: D_ref = H_ref / (2 * tan(VFOV / 2) * (S_ref / 100))
 */
export function estimateReferenceMarkerDistance({
  markerHeightCm,
  markerSpanPercent,
  vfovDeg
}) {
  if (!markerSpanPercent || markerSpanPercent <= 0.5) {
    return {
      distance: CONFIG.camera.defaultOverrideDistance,
      confidence: 0.05,
      error: 3.0,
      method: 'reference_marker'
    };
  }

  const hRef = markerHeightCm / 100.0; // convert cm to meters
  const vfovRad = vfovDeg * (Math.PI / 180);
  const spanFraction = markerSpanPercent / 100.0;

  const tanVfov2 = Math.tan(vfovRad / 2.0);
  const distance = hRef / (2.0 * tanVfov2 * spanFraction);

  // --- Uncertainty Propagation ---
  const sigmaHRef = CONFIG.uncertainty.referenceMarkerMeters;
  const sigmaSpan = CONFIG.uncertainty.dragPercent / 100.0;
  const sigmaVfov = 1.0 * (Math.PI / 180); // 1 degree focal variance

  // Partials
  const dD_dhRef = 1.0 / (2.0 * tanVfov2 * spanFraction);
  const dD_dSpan = -hRef / (2.0 * tanVfov2 * Math.pow(spanFraction, 2));
  
  const sec2Vfov2 = 1.0 / Math.pow(Math.cos(vfovRad / 2.0), 2);
  const dD_dVfov = -hRef * (0.5 * sec2Vfov2) / (2.0 * Math.pow(tanVfov2, 2) * spanFraction);

  const varianceD = (dD_dhRef * dD_dhRef * sigmaHRef * sigmaHRef) +
                    (dD_dSpan * dD_dSpan * sigmaSpan * sigmaSpan) +
                    (dD_dVfov * dD_dVfov * sigmaVfov * sigmaVfov);

  const errorEstimate = Math.max(0.01, Math.sqrt(varianceD));

  // --- Confidence Scoring ---
  // Higher span percent yields higher pixel resolution and confidence
  const spanConfidence = Math.min(1.0, markerSpanPercent / 20.0);
  const confidence = Math.max(0.05, 0.90 * spanConfidence);

  return {
    distance: distance,
    confidence: parseFloat(confidence.toFixed(3)),
    error: parseFloat(errorEstimate.toFixed(3)),
    method: 'reference_marker'
  };
}

/**
 * Distance Engine 3: Known Object Scaling
 * Formula: D_obj = H_obj / (2 * tan(VFOV / 2) * (S_obj / 100))
 */
export function estimateKnownObjectDistance({
  objectHeightMeters,
  objectSpanPercent,
  vfovDeg,
  aiScore = 0.5
}) {
  if (!objectSpanPercent || objectSpanPercent <= 0.5) {
    return {
      distance: CONFIG.camera.defaultOverrideDistance,
      confidence: 0.05,
      error: 3.0,
      method: 'known_object'
    };
  }

  const hObj = objectHeightMeters;
  const vfovRad = vfovDeg * (Math.PI / 180);
  const spanFraction = objectSpanPercent / 100.0;

  const tanVfov2 = Math.tan(vfovRad / 2.0);
  const distance = hObj / (2.0 * tanVfov2 * spanFraction);

  // --- Uncertainty Propagation ---
  const sigmaHObj = 0.1; // 10 cm estimation error for known targets
  const sigmaSpan = 2.0 / 100.0; // larger bbox edge error
  const sigmaVfov = 1.0 * (Math.PI / 180);

  const dD_dhObj = 1.0 / (2.0 * tanVfov2 * spanFraction);
  const dD_dSpan = -hObj / (2.0 * tanVfov2 * Math.pow(spanFraction, 2));
  
  const sec2Vfov2 = 1.0 / Math.pow(Math.cos(vfovRad / 2.0), 2);
  const dD_dVfov = -hObj * (0.5 * sec2Vfov2) / (2.0 * Math.pow(tanVfov2, 2) * spanFraction);

  const varianceD = (dD_dhObj * dD_dhObj * sigmaHObj * sigmaHObj) +
                    (dD_dSpan * dD_dSpan * sigmaSpan * sigmaSpan) +
                    (dD_dVfov * dD_dVfov * sigmaVfov * sigmaVfov);

  const errorEstimate = Math.max(0.01, Math.sqrt(varianceD));

  // --- Confidence Scoring ---
  // Influenced directly by model recognition certainty
  const confidence = Math.max(0.05, 0.85 * aiScore * Math.min(1.0, objectSpanPercent / 30.0));

  return {
    distance: distance,
    confidence: parseFloat(confidence.toFixed(3)),
    error: parseFloat(errorEstimate.toFixed(3)),
    method: 'known_object'
  };
}

/**
 * Distance Engine 4: Stereo Disparity (Future Placeholder)
 */
export function estimateStereoDistance() {
  return {
    distance: 0.0,
    confidence: 0.0,
    error: 0.0,
    method: 'stereo'
  };
}

/**
 * Distance Engine 5: Manual Measurement
 */
export function estimateManualDistance(manualDistanceValue) {
  const dist = parseFloat(manualDistanceValue) || CONFIG.camera.defaultOverrideDistance;
  return {
    distance: dist,
    confidence: 0.95, // high confidence as it's entered explicitly
    error: CONFIG.uncertainty.manualDistanceMeters,
    method: 'manual'
  };
}
