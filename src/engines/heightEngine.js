/**
 * PORTA-TLS Height Triangulation Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Height Engine 1: Clinometer height with Ground Slope Correction
 * Formula: H = H_cam + D_slope * cos(alpha) * (tan(theta_top) - tan(alpha))
 */
export function calculateClinometerHeight({
  cameraHeight,
  baseAngleDeg,
  topAngleDeg,
  slopeAngleDeg,
  livePitchDeg,
  distanceSlope,
  distanceError = 0.1,
  pitchSensorStdDev = 0.0,
  calibrationData = null
}) {
  const pitchBias = calibrationData?.pitchBias || 0.0;
  const heightCorr = calibrationData?.heightCorrectionFactor || 1.0;
  const hCam = calibrationData?.cameraHeight || cameraHeight || CONFIG.camera.defaultHeight;

  const slopeRad = (slopeAngleDeg || 0.0) * (Math.PI / 180);
  const dSlope = distanceSlope;

  // Resolve active top angle (locked value or live tilt) with pitch bias offset
  const rawTopDeg = (topAngleDeg !== null && topAngleDeg !== undefined) ? topAngleDeg : livePitchDeg;
  const correctedTopDeg = rawTopDeg - pitchBias;
  const topRad = correctedTopDeg * (Math.PI / 180);

  const cosSlope = Math.cos(slopeRad);
  const tanTop = Math.tan(topRad);
  const tanSlope = Math.tan(slopeRad);

  let rawHeight = hCam + dSlope * cosSlope * (tanTop - tanSlope);
  let height = Math.max(0.1, rawHeight * heightCorr);

  // --- Uncertainty Propagation (Delta Method) ---
  const sigmaH = CONFIG.uncertainty.cameraHeightMeters;
  const sigmaD = distanceError;
  const sigmaTop = CONFIG.uncertainty.anglePitchRad + (pitchSensorStdDev * Math.PI / 180);
  const sigmaSlope = CONFIG.uncertainty.angleSlopeRad;

  // Partials
  const dH_dhCam = 1.0;
  const dH_dD = cosSlope * (tanTop - tanSlope);
  
  const sec2Top = 1.0 / Math.pow(Math.cos(topRad), 2);
  const dH_dTop = dSlope * cosSlope * sec2Top;

  // dH/dSlope
  const sec2Slope = 1.0 / Math.pow(Math.cos(slopeRad), 2);
  const dH_dSlope = -dSlope * (Math.sin(slopeRad) * (tanTop - tanSlope) + cosSlope * sec2Slope);

  const varianceH = (dH_dhCam * dH_dhCam * sigmaH * sigmaH) +
                    (dH_dD * dH_dD * sigmaD * sigmaD) +
                    (dH_dTop * dH_dTop * sigmaTop * sigmaTop) +
                    (dH_dSlope * dH_dSlope * sigmaSlope * sigmaSlope);

  const errorEstimate = Math.max(0.01, Math.sqrt(varianceH));

  // --- Confidence Scoring ---
  // Influenced by distance confidence and angular tilt
  const distanceConfidence = 1.0 - Math.min(0.9, errorEstimate / height);
  const angleConfidence = Math.cos(topRad); // lower confidence if looking extremely high up
  const confidence = Math.max(0.05, Math.min(0.95, distanceConfidence * angleConfidence));

  return {
    height: height,
    confidence: parseFloat(confidence.toFixed(3)),
    error: parseFloat(errorEstimate.toFixed(3)),
    method: 'clinometer'
  };
}

/**
 * Height Engine 2: Reference Marker Scaling
 * Formula: H = H_ref * (S_tree / S_ref)
 */
export function calculateReferenceMarkerHeight({
  markerHeightCm,
  markerSpanPercent,
  treeSpanPercent,
  distanceError = 0.1
}) {
  if (!markerSpanPercent || markerSpanPercent <= 0.5) {
    return {
      height: 0.1,
      confidence: 0.05,
      error: 1.0,
      method: 'reference_marker'
    };
  }

  const hRef = markerHeightCm / 100.0; // convert cm to meters
  const sTree = treeSpanPercent;
  const sRef = markerSpanPercent;

  let height = hRef * (sTree / sRef);
  height = Math.max(0.1, height);

  // --- Uncertainty Propagation ---
  const sigmaHRef = CONFIG.uncertainty.referenceMarkerMeters;
  const sigmaDrag = CONFIG.uncertainty.dragPercent;

  const dH_dhRef = sTree / sRef;
  const dH_dsTree = hRef / sRef;
  const dH_dsRef = -hRef * sTree / Math.pow(sRef, 2);

  const varianceH = (dH_dhRef * dH_dhRef * sigmaHRef * sigmaHRef) +
                    (dH_dsTree * dH_dsTree * sigmaDrag * sigmaDrag) +
                    (dH_dsRef * dH_dsRef * sigmaDrag * sigmaDrag);

  const errorEstimate = Math.max(0.01, Math.sqrt(varianceH));

  // --- Confidence Scoring ---
  const confidence = Math.max(0.05, Math.min(0.92, (sRef / sTree) * 0.90));

  return {
    height: height,
    confidence: parseFloat(confidence.toFixed(3)),
    error: parseFloat(errorEstimate.toFixed(3)),
    method: 'reference_marker'
  };
}

/**
 * Height Engine 3: Known Object Scaling
 */
export function calculateKnownObjectHeight({
  objectHeightMeters,
  objectSpanPercent,
  treeSpanPercent,
  aiScore = 0.5
}) {
  if (!objectSpanPercent || objectSpanPercent <= 0.5) {
    return {
      height: 0.1,
      confidence: 0.05,
      error: 1.5,
      method: 'known_object'
    };
  }

  const hObj = objectHeightMeters;
  const sTree = treeSpanPercent;
  const sObj = objectSpanPercent;

  let height = hObj * (sTree / sObj);
  height = Math.max(0.1, height);

  // --- Uncertainty Propagation ---
  const sigmaHObj = 0.1; // 10 cm estimation uncertainty
  const sigmaDrag = 2.0; // 2% caliper edge noise

  const dH_dhObj = sTree / sObj;
  const dH_dsTree = hObj / sObj;
  const dH_dsObj = -hObj * sTree / Math.pow(sObj, 2);

  const varianceH = (dH_dhObj * dH_dhObj * sigmaHObj * sigmaHObj) +
                    (dH_dsTree * dH_dsTree * sigmaDrag * sigmaDrag) +
                    (dH_dsObj * dH_dsObj * sigmaDrag * sigmaDrag);

  const errorEstimate = Math.max(0.01, Math.sqrt(varianceH));

  // --- Confidence Scoring ---
  const confidence = Math.max(0.05, Math.min(0.88, (sObj / sTree) * aiScore * 0.85));

  return {
    height: height,
    confidence: parseFloat(confidence.toFixed(3)),
    error: parseFloat(errorEstimate.toFixed(3)),
    method: 'known_object'
  };
}

/**
 * Height Engine 4: Stereo Disparity (Future Placeholder)
 */
export function calculateStereoHeight() {
  return {
    height: 0.0,
    confidence: 0.0,
    error: 0.0,
    method: 'stereo'
  };
}
