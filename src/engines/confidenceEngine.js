/**
 * PORTA-TLS Confidence Estimation Engine
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';

/**
 * Compute the comprehensive confidence index of a tree measurement
 */
export function calculateMeasurementConfidence({
  algorithm,
  pitchAngleDeg,
  distanceConfidence,
  heightConfidence,
  dbhConfidence,
  sensorStdDevDeg = 0.0,
  trackingConsistency = 1.0,
  hasManualAdjustments = false,
  lightingScore = 1.0 // 1.0 = optimal, lower is poor contrast/brightness
}) {
  // 1. Core baseline confidence is the geometric mean of the components
  let baseConf = Math.sqrt(distanceConfidence * heightConfidence * dbhConfidence);

  // 2. Adjust for sensor stability
  // Standard deviation above 1.5 degrees reduces confidence
  let sensorModifier = 1.0;
  if (sensorStdDevDeg > 1.5) {
    sensorModifier = Math.max(0.4, 1.0 - (sensorStdDevDeg - 1.5) * 0.2);
  }

  // 3. Adjust for tracking stability (only applies to AI tracking mode)
  let trackingModifier = 1.0;
  if (algorithm === 'automatic') {
    trackingModifier = Math.max(0.5, trackingConsistency);
  }

  // 4. Adjust for lighting conditions
  let lightingModifier = Math.max(0.6, lightingScore);

  // 5. Adjust for user manual confirmation/override
  // Manual corrections by a trained researcher increase confidence (act as validation)
  let userModifier = 1.0;
  if (hasManualAdjustments) {
    userModifier = 1.08; // 8% boost for verified calipers
  }

  // Final score
  let finalConfidence = baseConf * sensorModifier * trackingModifier * lightingModifier * userModifier;

  // Bound between 5% and 99%
  finalConfidence = Math.max(0.05, Math.min(0.99, finalConfidence));
  
  return parseFloat(finalConfidence.toFixed(3));
}

/**
 * Estimate lighting contrast score on viewfinder canvas for tracking quality
 * Returns value between 0.3 (poor contrast) and 1.0 (optimal)
 */
export function estimateLightingScore(ctx, canvas, leftPercent, rightPercent, topPercent, basePercent) {
  if (!ctx || !canvas) return 1.0;

  try {
    const w = canvas.width;
    const h = canvas.height;
    
    // Crop coordinates
    const sx = Math.max(0, Math.floor(w * (leftPercent / 100)));
    const sy = Math.max(0, Math.floor(h * (topPercent / 100)));
    const sw = Math.max(5, Math.floor(w * ((rightPercent - leftPercent) / 100)));
    const sh = Math.max(5, Math.floor(h * ((basePercent - topPercent) / 100)));

    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const data = imgData.data;

    let minL = 255;
    let maxL = 0;
    let sumL = 0;

    for (let i = 0; i < data.length; i += 40) { // sample pixels for performance
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; // luminance
      
      sumL += l;
      if (l < minL) minL = l;
      if (l > maxL) maxL = l;
    }

    const count = data.length / 40;
    const avgL = sumL / count;

    // Contrast ratio
    const contrast = maxL - minL;
    
    // If contrast is very low (e.g. flat color or dark scene), tracking is poor
    let score = 1.0;
    if (contrast < 40) {
      score = 0.5; // low contrast
    } else if (avgL < 30 || avgL > 220) {
      score = 0.6; // too dark or overexposed
    } else {
      score = 0.8 + 0.2 * (contrast / 255.0);
    }
    
    return parseFloat(score.toFixed(2));
  } catch (err) {
    // cross-origin security fallbacks
    return 1.0;
  }
}
