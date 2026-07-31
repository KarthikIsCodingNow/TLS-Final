/**
 * PORTA-TLS Multi-Frame Accumulator & Outlier Frame Rejection Engine
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export class MultiFrameAccumulator {
  constructor(maxFrames = 5) {
    this.maxFrames = maxFrames;
    this.samples = [];
  }

  setMaxFrames(n) {
    this.maxFrames = n;
  }

  addFrameSample(value, confidence = 0.85) {
    if (typeof value !== 'number' || isNaN(value)) return;

    // Reject inconsistent frame if sample deviates > 2 sigma from running mean
    if (this.samples.length >= 3) {
      const mean = this.samples.reduce((a, b) => a + b.val, 0) / this.samples.length;
      const variance = this.samples.reduce((a, b) => a + Math.pow(b.val - mean, 2), 0) / this.samples.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0 && Math.abs(value - mean) > 2.0 * stdDev) {
        // Outlier frame rejected!
        return { rejected: true, reason: 'Outlier frame (>2σ)' };
      }
    }

    this.samples.push({ val: value, conf: confidence, timestamp: Date.now() });
    if (this.samples.length > this.maxFrames) {
      this.samples.shift();
    }

    return { rejected: false };
  }

  getAccumulatedResult() {
    if (this.samples.length === 0) {
      return { value: 0, stdDev: 0, confidence: 0, sampleCount: 0 };
    }

    const n = this.samples.length;
    const mean = this.samples.reduce((a, b) => a + b.val, 0) / n;
    const variance = this.samples.reduce((a, b) => a + Math.pow(b.val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const avgConf = this.samples.reduce((a, b) => a + b.conf, 0) / n;

    return {
      value: parseFloat(mean.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      confidence: parseFloat(avgConf.toFixed(2)),
      sampleCount: n
    };
  }

  reset() {
    this.samples = [];
  }
}
