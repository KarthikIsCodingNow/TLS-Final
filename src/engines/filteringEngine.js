/**
 * PORTA-TLS Sensor Filtering Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Moving Average filter implementation
 */
export class MovingAverageFilter {
  constructor(size = CONFIG.filters.movingAverageSize) {
    this.size = size;
    this.buffer = [];
  }

  filter(val) {
    this.buffer.push(val);
    if (this.buffer.length > this.size) {
      this.buffer.shift();
    }
    const sum = this.buffer.reduce((acc, curr) => acc + curr, 0);
    return sum / this.buffer.length;
  }

  reset() {
    this.buffer = [];
  }
}

/**
 * Median filter to eliminate single-point impulse noise/spikes
 */
export class MedianFilter {
  constructor(size = CONFIG.filters.medianSize) {
    this.size = size;
    this.buffer = [];
  }

  filter(val) {
    this.buffer.push(val);
    if (this.buffer.length > this.size) {
      this.buffer.shift();
    }
    
    // Sort slice to find median
    const sorted = [...this.buffer].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 !== 0) {
      return sorted[mid];
    }
    return (sorted[mid - 1] + sorted[mid]) / 2.0;
  }

  reset() {
    this.buffer = [];
  }
}

/**
 * First-order exponential low-pass filter
 */
export class LowPassFilter {
  constructor(alpha = CONFIG.filters.lowPassAlpha) {
    this.alpha = alpha;
    this.prevVal = null;
  }

  filter(val) {
    if (this.prevVal === null) {
      this.prevVal = val;
      return val;
    }
    const smoothed = this.alpha * val + (1 - this.alpha) * this.prevVal;
    this.prevVal = smoothed;
    return smoothed;
  }

  reset() {
    this.prevVal = null;
  }
}

/**
 * 1D Kalman Filter for sensor state estimation
 */
export class KalmanFilter1D {
  constructor(
    q = CONFIG.filters.kalman.processNoiseQ,
    r = CONFIG.filters.kalman.measurementNoiseR,
    p = CONFIG.filters.kalman.initialErrorP
  ) {
    this.q = q; // Process noise covariance
    this.r = r; // Measurement noise covariance
    this.p = p; // Estimation error covariance
    this.x = null; // Filtered value state
  }

  filter(val) {
    if (this.x === null) {
      this.x = val;
      return val;
    }

    // Time Update (predict)
    const xMinus = this.x;
    const pMinus = this.p + this.q;

    // Measurement Update (correct)
    const k = pMinus / (pMinus + this.r); // Kalman Gain
    this.x = xMinus + k * (val - xMinus);
    this.p = (1 - k) * pMinus;

    return this.x;
  }

  reset() {
    this.x = null;
    this.p = CONFIG.filters.kalman.initialErrorP;
  }
}
