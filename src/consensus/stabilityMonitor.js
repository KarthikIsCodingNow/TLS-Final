/**
 * stabilityMonitor.js - Live Multi-Frame Stability Monitor for CMME
 * 
 * Tracks temporal stability across collected frames:
 * - Camera Orientation Pitch/Roll Variance
 * - Frame-to-Frame Distance/Height Delta Jitter
 * - Sensor Agreement Score
 * - Environmental Stability Index
 */

export class StabilityMonitor {
  /**
   * Analyze stability across consecutive frame sequence
   * @param {Array<Object>} frames 
   * @returns {Object} { cameraStability, measurementStability, sensorAgreement, environmentalStability, overallStabilityScore }
   */
  evaluateStability(frames) {
    if (!frames || frames.length < 2) {
      return {
        cameraStability: 100,
        measurementStability: 100,
        sensorAgreement: 100,
        environmentalStability: 100,
        overallStabilityScore: 100,
        status: 'Optimal'
      };
    }

    // 1. Camera Stability (from IMU stability / pitch noise factors)
    const stabilityFactors = frames.map(f => f.cepe?.factors?.cameraStability?.score || 0.85);
    const avgCamFactor = stabilityFactors.reduce((a, b) => a + b, 0) / frames.length;
    const cameraStability = Math.round(avgCamFactor * 100);

    // 2. Measurement Stability (Inter-frame variance of Height & Distance)
    const heights = frames.map(f => f.dimensions.height);
    const meanH = heights.reduce((a, b) => a + b, 0) / heights.length;
    const varH = heights.reduce((acc, h) => acc + Math.pow(h - meanH, 2), 0) / heights.length;
    const stdH = Math.sqrt(varH);
    const cvH = meanH > 0 ? stdH / meanH : 0;
    const measurementStability = Math.max(0, Math.min(100, Math.round((1 - cvH * 5) * 100)));

    // 3. Sensor Agreement (Cross-sensor variance within AMSFE per frame)
    const sensorAgreements = frames.map(f => {
      const weights = Object.values(f.amsfe?.weights || {});
      const maxW = Math.max(...weights, 0.2);
      const minW = Math.min(...weights, 0.05);
      return (1 - (maxW - minW)) * 100;
    });
    const avgSensorAgreement = sensorAgreements.reduce((a, b) => a + b, 0) / frames.length;
    const sensorAgreement = Math.max(0, Math.min(100, Math.round(avgSensorAgreement)));

    // 4. Environmental Stability
    const envLighting = frames.map(f => f.envContext?.lightingQuality || 0.85);
    const avgLighting = envLighting.reduce((a, b) => a + b, 0) / frames.length;
    const environmentalStability = Math.round(avgLighting * 100);

    // Overall Composite Stability Score (0 - 100)
    const overallStabilityScore = Math.round(
      0.30 * cameraStability +
      0.35 * measurementStability +
      0.20 * sensorAgreement +
      0.15 * environmentalStability
    );

    let status = 'Optimal';
    if (overallStabilityScore < 70) status = 'Unstable';
    else if (overallStabilityScore < 85) status = 'Moderate Jitter';

    return {
      cameraStability,
      measurementStability,
      sensorAgreement,
      environmentalStability,
      overallStabilityScore,
      status
    };
  }
}
