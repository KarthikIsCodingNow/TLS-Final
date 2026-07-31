/**
 * statisticalAnalysis.js - Comprehensive Statistical Analysis Engine for CMME
 * 
 * Computes:
 * - Mean, Median, Mode, Weighted Mean
 * - Standard Deviation, Variance, Coefficient of Variation (CV %)
 * - Standard Error (SE) and 95% Confidence Intervals (± 1.96 SE)
 * Across Height, Distance, DBH, Biomass, and Carbon dimensions.
 */

export class StatisticalAnalysis {
  /**
   * Run complete statistical suite across valid frames
   * @param {Array<Object>} acceptedFrames - Array of valid/accepted frame objects
   * @returns {Object} { height, distance, dbh, biomass, carbon } statistics objects
   */
  analyze(acceptedFrames) {
    if (!acceptedFrames || acceptedFrames.length === 0) {
      return this.getEmptyStats();
    }

    // Weights per frame: CEPE Confidence % * Reliability Index
    const frameWeights = acceptedFrames.map(f => {
      const c = (f.cepe?.confidencePct || 80) / 100;
      const r = (f.cepe?.reliabilityIndex || 80) / 100;
      return Math.max(0.01, c * r);
    });

    return {
      height: this.computeDimensionStats(acceptedFrames.map(f => f.dimensions.height), frameWeights),
      distance: this.computeDimensionStats(acceptedFrames.map(f => f.dimensions.distance), frameWeights),
      dbh: this.computeDimensionStats(acceptedFrames.map(f => f.dimensions.dbh), frameWeights),
      biomass: this.computeDimensionStats(acceptedFrames.map(f => f.dimensions.biomass), frameWeights),
      carbon: this.computeDimensionStats(acceptedFrames.map(f => f.dimensions.carbon), frameWeights),
      sampleCount: acceptedFrames.length
    };
  }

  /**
   * Compute complete statistical summary for a single metric vector
   * @param {Array<number>} values 
   * @param {Array<number>} weights 
   */
  computeDimensionStats(values, weights = []) {
    const N = values.length;
    if (N === 0) {
      return {
        mean: 0, median: 0, mode: 0, weightedMean: 0,
        stdDev: 0, variance: 0, cvPct: 0, stdError: 0,
        ci95: { margin: 0, lower: 0, upper: 0, label: '±0.00' },
        min: 0, max: 0, range: 0
      };
    }

    // 1. Mean
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / N;

    // 2. Median & Min/Max
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[N - 1];
    const range = max - min;

    let median;
    const mid = Math.floor(N / 2);
    if (N % 2 !== 0) {
      median = sorted[mid];
    } else {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    }

    // 3. Mode (Histogram Binning)
    const mode = this.computeMode(sorted);

    // 4. Weighted Mean
    let weightedMean = mean;
    if (weights && weights.length === N) {
      const weightSum = weights.reduce((acc, w) => acc + w, 0);
      if (weightSum > 0) {
        weightedMean = values.reduce((acc, v, i) => acc + v * weights[i], 0) / weightSum;
      }
    }

    // 5. Variance & Standard Deviation
    const varSum = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    const variance = N > 1 ? varSum / (N - 1) : 0;
    const stdDev = Math.sqrt(variance);

    // 6. Coefficient of Variation (CV %)
    const cvPct = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

    // 7. Standard Error (SE)
    const stdError = Math.sqrt(N) > 0 ? stdDev / Math.sqrt(N) : 0;

    // 8. 95% Confidence Interval
    const ciMargin = 1.96 * stdError;
    const ci95 = {
      margin: Number(ciMargin.toFixed(3)),
      lower: Number((weightedMean - ciMargin).toFixed(3)),
      upper: Number((weightedMean + ciMargin).toFixed(3)),
      label: `±${ciMargin.toFixed(2)}`
    };

    return {
      mean: Number(mean.toFixed(3)),
      median: Number(median.toFixed(3)),
      mode: Number(mode.toFixed(3)),
      weightedMean: Number(weightedMean.toFixed(3)),
      stdDev: Number(stdDev.toFixed(3)),
      variance: Number(variance.toFixed(4)),
      cvPct: Number(cvPct.toFixed(2)),
      stdError: Number(stdError.toFixed(4)),
      ci95,
      min: Number(min.toFixed(3)),
      max: Number(max.toFixed(3)),
      range: Number(range.toFixed(3))
    };
  }

  /**
   * Helper: Kernel density mode estimator using rounded bins
   */
  computeMode(sortedValues) {
    if (sortedValues.length === 0) return 0;
    const frequency = {};
    let maxFreq = 0;
    let modeVal = sortedValues[0];

    sortedValues.forEach(val => {
      const bin = (Math.round(val * 100) / 100).toFixed(2);
      frequency[bin] = (frequency[bin] || 0) + 1;
      if (frequency[bin] > maxFreq) {
        maxFreq = frequency[bin];
        modeVal = parseFloat(bin);
      }
    });

    return modeVal;
  }

  /**
   * Return empty stats fallback structure
   */
  getEmptyStats() {
    const emptyDim = {
      mean: 0, median: 0, mode: 0, weightedMean: 0,
      stdDev: 0, variance: 0, cvPct: 0, stdError: 0,
      ci95: { margin: 0, lower: 0, upper: 0, label: '±0.00' },
      min: 0, max: 0, range: 0
    };
    return {
      height: { ...emptyDim },
      distance: { ...emptyDim },
      dbh: { ...emptyDim },
      biomass: { ...emptyDim },
      carbon: { ...emptyDim },
      sampleCount: 0
    };
  }
}
