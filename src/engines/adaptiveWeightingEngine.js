/**
 * PORTA-TLS Adaptive Weighting Engine
 * Task 11: Continuously adapts weights based on environmental, sensor, and AI conditions.
 */

export class AdaptiveWeightingEngine {
  constructor() {
    this.name = 'AdaptiveWeightingEngine';
    this.version = 'v1.0.0-proprietary';
  }

  /**
   * Compute dynamic weights based on runtime environment & telemetry
   */
  computeAdaptiveWeights(telemetry = {}) {
    const {
      lightingLux = 450,
      calibrationAgeDays = 2,
      aiStabilityScore = 0.85,
      sensorNoiseLevel = 0.05,
      isPointcloudAvailable = false
    } = telemetry;

    let wSens = 0.15;
    let wImg = 0.15;
    let wDet = 0.15;
    let wCal = 0.15;
    let wEnv = 0.10;
    let wHist = 0.10;
    let wRep = 0.10;
    let wStab = 0.10;

    // Rule 1: Poor lighting reduce image contribution, shift to sensor & calibration
    if (lightingLux < 150) {
      wImg *= 0.5;
      wSens += 0.05;
      wCal += 0.05;
    }

    // Rule 2: Excellent fresh calibration (< 7 days) boost calibration weight
    if (calibrationAgeDays < 7) {
      wCal += 0.08;
    } else if (calibrationAgeDays > 60) {
      wCal *= 0.6;
    }

    // Rule 3: Low AI stability favor geometry & sensor stability
    if (aiStabilityScore < 0.60) {
      wDet *= 0.5;
      wStab += 0.05;
      wRep += 0.05;
    }

    // Rule 4: High sensor noise reduce sensor weight
    if (sensorNoiseLevel > 0.20) {
      wSens *= 0.5;
      wHist += 0.05;
    }

    // Rule 5: Point cloud available boost physical stability
    if (isPointcloudAvailable) {
      wStab += 0.05;
    }

    // Normalize weights so sum = 1.0
    const total = wSens + wImg + wDet + wCal + wEnv + wHist + wRep + wStab;

    return {
      wSens: Number((wSens / total).toFixed(4)),
      wImg: Number((wImg / total).toFixed(4)),
      wDet: Number((wDet / total).toFixed(4)),
      wCal: Number((wCal / total).toFixed(4)),
      wEnv: Number((wEnv / total).toFixed(4)),
      wHist: Number((wHist / total).toFixed(4)),
      wRep: Number((wRep / total).toFixed(4)),
      wStab: Number((wStab / total).toFixed(4)),
      adaptationReason: `Adapted for Lux=${lightingLux}, CalAge=${calibrationAgeDays}d, AIStab=${aiStabilityScore}`
    };
  }
}
