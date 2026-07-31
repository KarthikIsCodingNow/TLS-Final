/**
 * PORTA-TLS IMU Noise Analysis & Rolling Window Stability Monitor
 * Version 2.1 Architectural Baseline - Task 7 Extension
 */

const ROLLING_WINDOW_SIZE = 100;

export class SensorStabilityMonitor {
  constructor(windowSize = ROLLING_WINDOW_SIZE) {
    this.windowSize = windowSize;
    this.samples = [];
  }

  /**
   * Add a new pitch orientation reading to the rolling sample buffer
   * @param {number} pitchDeg Filtered or raw pitch angle in degrees
   */
  addSample(pitchDeg) {
    if (typeof pitchDeg !== 'number' || isNaN(pitchDeg)) return;
    this.samples.push(pitchDeg);
    if (this.samples.length > this.windowSize) {
      this.samples.shift();
    }
  }

  /**
   * Compute variance and standard deviation over active window
   */
  getVarianceAndStdDev() {
    if (this.samples.length === 0) {
      return { variance: 0, stdDev: 0 };
    }

    const mean = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const variance = this.samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.samples.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      variance,
      stdDev
    };
  }

  /**
   * Classify live stability rating
   * Excellent Stability | Good Stability | Slight Movement | Heavy Movement | Unusable
   */
  getClassification() {
    const { stdDev } = this.getVarianceAndStdDev();

    if (stdDev < 0.10) {
      return {
        rating: 'Excellent Stability',
        level: 'EXCELLENT',
        color: '#00ffcc',
        stdDev: parseFloat(stdDev.toFixed(3)),
        warning: null
      };
    } else if (stdDev < 0.30) {
      return {
        rating: 'Good Stability',
        level: 'GOOD',
        color: '#00ccff',
        stdDev: parseFloat(stdDev.toFixed(3)),
        warning: null
      };
    } else if (stdDev < 0.80) {
      return {
        rating: 'Slight Movement',
        level: 'SLIGHT',
        color: '#ffcc00',
        stdDev: parseFloat(stdDev.toFixed(3)),
        warning: null
      };
    } else if (stdDev < 2.0) {
      return {
        rating: 'Heavy Movement',
        level: 'HEAVY',
        color: '#ff9900',
        stdDev: parseFloat(stdDev.toFixed(3)),
        warning: 'Hold device steady for better accuracy.'
      };
    } else {
      return {
        rating: 'Unusable',
        level: 'UNUSABLE',
        color: '#ff3333',
        stdDev: parseFloat(stdDev.toFixed(3)),
        warning: 'Hold device steady for better accuracy.'
      };
    }
  }
}

/**
 * Perform 5-second noise standard deviation analysis on pitch, roll, and yaw
 * @param {Array<{pitch: number, roll: number, yaw: number}>} samples 5s orientation array
 * @returns {object} Standard deviations sigmaPitch, sigmaRoll, sigmaYaw
 */
export function analyzeSensorNoise(samples) {
  if (!Array.isArray(samples) || samples.length === 0) {
    return { sigmaPitch: 0.05, sigmaRoll: 0.05, sigmaYaw: 0.08 };
  }

  const calcStdDev = (arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  };

  const pitchArr = samples.map(s => s.pitch || 0);
  const rollArr = samples.map(s => s.roll || 0);
  const yawArr = samples.map(s => s.yaw || s.compass || 0);

  return {
    sigmaPitch: parseFloat(calcStdDev(pitchArr).toFixed(4)),
    sigmaRoll: parseFloat(calcStdDev(rollArr).toFixed(4)),
    sigmaYaw: parseFloat(calcStdDev(yawArr).toFixed(4))
  };
}
