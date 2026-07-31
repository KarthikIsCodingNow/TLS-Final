/**
 * PORTA-TLS Multi-Frame Averaging & Outlier Rejection Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Filter outliers and compute final statistics on a numerical sample buffer
 * Uses Z-score outlier rejection (defaults to 1.5 stdDev threshold)
 * @param {number[]} samples Array of raw values
 * @returns {object} { mean, variance, stdDev, count, rawMean }
 */
export function processMultiFrameAveraging(samples) {
  if (!samples || samples.length === 0) {
    return { mean: 0, variance: 0, stdDev: 0, count: 0, rawMean: 0 };
  }

  const nRaw = samples.length;
  const rawSum = samples.reduce((a, b) => a + b, 0);
  const rawMean = rawSum / nRaw;

  if (nRaw < 3) {
    // Too few samples to reject outliers safely, return simple stats
    return {
      mean: rawMean,
      variance: 0.0,
      stdDev: 0.0,
      count: nRaw,
      rawMean: rawMean
    };
  }

  // 1. Calculate raw standard deviation
  const rawSqDiffSum = samples.reduce((acc, val) => acc + Math.pow(val - rawMean, 2), 0);
  const rawStdDev = Math.sqrt(rawSqDiffSum / nRaw);

  // 2. Reject outliers beyond threshold
  const zThreshold = CONFIG.sampling.outlierThresholdZ;
  const cleanSamples = samples.filter(val => {
    if (rawStdDev === 0) return true;
    const zScore = Math.abs(val - rawMean) / rawStdDev;
    return zScore <= zThreshold;
  });

  const nClean = cleanSamples.length;
  const cleanSum = cleanSamples.reduce((a, b) => a + b, 0);
  const cleanMean = cleanSum / nClean;

  // 3. Compute final cleaned variance & standard deviation
  const cleanSqDiffSum = cleanSamples.reduce((acc, val) => acc + Math.pow(val - cleanMean, 2), 0);
  const cleanVariance = cleanSqDiffSum / nClean;
  const cleanStdDev = Math.sqrt(cleanVariance);

  Logger.info(`Averaged ${nRaw} frames. Outliers rejected: ${nRaw - nClean}. Final mean: ${cleanMean.toFixed(3)}`);

  return {
    mean: cleanMean,
    variance: cleanVariance,
    stdDev: cleanStdDev,
    count: nClean,
    rawMean: rawMean
  };
}
