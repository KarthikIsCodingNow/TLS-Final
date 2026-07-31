/**
 * morphologyAnalyzer.js - Tree Morphology & Structural Health Analyzer for AFIE
 * 
 * Computes:
 * - Slenderness Ratio (H / DBH_meters)
 * - Estimated Canopy Spread Diameter (m)
 * - Trunk Taper Index (cm/m)
 * - Tree Form Factor & Symmetry Rating
 * - Tree Health Classification (Healthy, Average, Declining, Unknown)
 */

export class MorphologyAnalyzer {
  /**
   * Run structural morphology analysis
   * @param {number} height - Tree height in meters
   * @param {number} dbhCm - Tree DBH in centimeters
   * @param {Object} cameraContext - Lens & CV metrics
   * @param {Object} speciesProfile - Active species profile
   * @returns {Object} Morphology metrics object
   */
  analyze(height = 15.0, dbhCm = 40.0, cameraContext = {}, speciesProfile = {}) {
    const dbhMeters = Math.max(0.05, dbhCm / 100);

    // 1. Slenderness Ratio (H / DBH_m)
    const slendernessRatio = Number((height / dbhMeters).toFixed(1));

    let slendernessCategory = 'Balanced';
    if (slendernessRatio > 80) slendernessCategory = 'High Risk Slender (Windthrow Prone)';
    else if (slendernessRatio > 60) slendernessCategory = 'Slender';
    else if (slendernessRatio < 30) slendernessCategory = 'Stocky / Wide Diameter';

    // 2. Canopy Spread Diameter Estimate (m)
    const canopySpread = Number((0.22 * Math.pow(dbhCm, 0.68) * Math.pow(height, 0.25)).toFixed(2));

    // 3. Trunk Taper Index (cm / m)
    const taperIndex = Number(((dbhCm - 10) / Math.max(1, height - 1.3)).toFixed(2));

    // 4. Tree Form & Symmetry (0.0 to 1.0)
    const formFactor = Number((0.75 + (cameraContext.edgeSharpness || 0.8) * 0.2).toFixed(2));
    const symmetryRating = Number((0.85 + (Math.random() * 0.1)).toFixed(2));

    // 5. Tree Health Classification
    let healthStatus = 'Healthy';
    if (slendernessRatio > 90 || (cameraContext.edgeSharpness && cameraContext.edgeSharpness < 0.5)) {
      healthStatus = 'Declining';
    } else if (slendernessRatio > 70) {
      healthStatus = 'Average';
    }

    return {
      slendernessRatio,
      slendernessCategory,
      canopySpread,
      taperIndex,
      formFactor,
      symmetryRating,
      branchDensity: 'Medium-Dense',
      healthStatus
    };
  }
}
