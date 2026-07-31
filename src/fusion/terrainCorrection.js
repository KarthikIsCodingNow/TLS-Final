/**
 * PORTA-TLS Terrain Slope & Elevation Correction Engine
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

/**
 * Apply ground slope correction to sloped standoff distance and tree height (Requirement 2)
 * @param {number} slopeDistance Standoff distance measured along slope (meters)
 * @param {number} baseAngleDeg Clinometer base angle to tree root (degrees)
 * @param {number} topAngleDeg Clinometer top angle to tree tip (degrees)
 * @param {number} slopeAngleDeg Ground slope incline/decline angle (degrees)
 * @param {number} cameraHeight Height of phone camera above ground (meters)
 */
export function applyTerrainCorrection(slopeDistance, baseAngleDeg, topAngleDeg, slopeAngleDeg, cameraHeight = 1.45) {
  const slopeRad = (slopeAngleDeg * Math.PI) / 180.0;
  const baseRad = (baseAngleDeg * Math.PI) / 180.0;
  const topRad = (topAngleDeg * Math.PI) / 180.0;

  // 1. Corrected Horizontal Distance
  const correctedDistance = slopeDistance * Math.cos(slopeRad);

  // 2. Corrected Height Elevation
  const baseHeightDiff = correctedDistance * Math.tan(baseRad);
  const topHeightDiff = correctedDistance * Math.tan(topRad);
  const correctedHeight = (topHeightDiff - baseHeightDiff) + (correctedDistance * Math.tan(slopeRad));

  const isCorrectionApplied = Math.abs(slopeAngleDeg) > 0.5;

  return {
    groundSlopeDeg: parseFloat(slopeAngleDeg.toFixed(1)),
    slopeDistance: parseFloat(slopeDistance.toFixed(2)),
    correctedDistance: parseFloat(correctedDistance.toFixed(2)),
    correctedHeight: parseFloat(Math.abs(correctedHeight).toFixed(2)),
    isCorrectionApplied,
    statusText: isCorrectionApplied ? `Correction Applied (${slopeAngleDeg.toFixed(1)}° Slope)` : 'Level Ground (No Correction)'
  };
}
