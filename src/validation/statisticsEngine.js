/**
 * PORTA-TLS Scientific Statistics & Validation Calculations
 * Version 2.0 Architectural Baseline
 */

/**
 * Calculate MAE, RMSE, MAPE, and Bias between application results and ground truth
 * @param {number[]} appValues Application measurements list
 * @param {number[]} gtValues Ground truth measurements list
 * @returns {object} Statistics summary
 */
export function calculateAccuracyMetrics(appValues, gtValues) {
  if (!appValues || !gtValues || appValues.length === 0 || appValues.length !== gtValues.length) {
    return { mae: 0, rmse: 0, mape: 0, bias: 0, count: 0, ci95: [0, 0] };
  }

  const n = appValues.length;
  let absoluteErrorSum = 0;
  let squaredErrorSum = 0;
  let absolutePercentageSum = 0;
  let biasSum = 0;
  
  const errors = [];

  for (let i = 0; i < n; i++) {
    const app = appValues[i];
    const gt = gtValues[i];
    const err = app - gt;
    
    absoluteErrorSum += Math.abs(err);
    squaredErrorSum += err * err;
    biasSum += err;
    errors.push(err);

    if (gt !== 0) {
      absolutePercentageSum += Math.abs(err / gt);
    }
  }

  const mae = absoluteErrorSum / n;
  const rmse = Math.sqrt(squaredErrorSum / n);
  const bias = biasSum / n;
  const mape = (absolutePercentageSum / n) * 100.0;

  // 95% Confidence Interval for Bias
  const errorMean = bias;
  const sqDiffSum = errors.reduce((acc, val) => acc + Math.pow(val - errorMean, 2), 0);
  const errorStdDev = n > 1 ? Math.sqrt(sqDiffSum / (n - 1)) : 0.0;
  
  const marginOfError = 1.96 * (errorStdDev / Math.sqrt(n));
  const ci95 = [bias - marginOfError, bias + marginOfError];

  return {
    mae: parseFloat(mae.toFixed(3)),
    rmse: parseFloat(rmse.toFixed(3)),
    mape: parseFloat(mape.toFixed(2)),
    bias: parseFloat(bias.toFixed(3)),
    count: n,
    ci95: [parseFloat(ci95[0].toFixed(3)), parseFloat(ci95[1].toFixed(3))],
    stdDevError: parseFloat(errorStdDev.toFixed(3))
  };
}

/**
 * Calculate repeated scan repeatability metrics (Mean, Median, StdDev, CoV)
 * @param {number[]} samples List of repeated scans of same target
 * @returns {object} Repeatability report
 */
export function calculateRepeatabilityMetrics(samples) {
  if (!samples || samples.length === 0) {
    return { mean: 0, median: 0, variance: 0, stdDev: 0, cov: 0, score: 0 };
  }

  const n = samples.length;
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = samples.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2.0;

  // Variance & StdDev
  const sqDiffSum = samples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = n > 1 ? sqDiffSum / (n - 1) : 0.0;
  const stdDev = Math.sqrt(variance);

  // Coefficient of Variation (CoV)
  const cov = mean !== 0 ? (stdDev / mean) * 100.0 : 0.0;
  
  // Repeatability Score: 1.0 - CoV (normalized, bounded at 0-1)
  const score = Math.max(0.0, Math.min(1.0, 1.0 - (cov / 100.0)));

  return {
    mean: parseFloat(mean.toFixed(3)),
    median: parseFloat(median.toFixed(3)),
    variance: parseFloat(variance.toFixed(4)),
    stdDev: parseFloat(stdDev.toFixed(3)),
    cov: parseFloat(cov.toFixed(2)),
    score: parseFloat((score * 100).toFixed(1)) // in percentage
  };
}

/**
 * Calculate Coefficient of Determination (R^2) & Pearson correlation
 */
export function calculateRegressionMetrics(appValues, gtValues) {
  if (!appValues || !gtValues || appValues.length < 2 || appValues.length !== gtValues.length) {
    return { r2: 0, r: 0, spearman: 0 };
  }

  const n = appValues.length;
  const meanGt = gtValues.reduce((a, b) => a + b, 0) / n;

  let residualSumSq = 0;
  let totalSumSq = 0;

  for (let i = 0; i < n; i++) {
    residualSumSq += Math.pow(gtValues[i] - appValues[i], 2);
    totalSumSq += Math.pow(gtValues[i] - meanGt, 2);
  }

  const r2 = totalSumSq !== 0 ? 1.0 - (residualSumSq / totalSumSq) : 0.0;

  // Pearson Correlation (r)
  const meanApp = appValues.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denApp = 0;
  let denGt = 0;

  for (let i = 0; i < n; i++) {
    const diffApp = appValues[i] - meanApp;
    const diffGt = gtValues[i] - meanGt;
    num += diffApp * diffGt;
    denApp += diffApp * diffApp;
    denGt += diffGt * diffGt;
  }

  const r = (denApp !== 0 && denGt !== 0) ? num / Math.sqrt(denApp * denGt) : 0.0;

  // Spearman Rank Correlation
  const spearman = calculateSpearmanRank(appValues, gtValues);

  return {
    r2: parseFloat(r2.toFixed(3)),
    r: parseFloat(r.toFixed(3)),
    spearman: parseFloat(spearman.toFixed(3))
  };
}

/**
 * Helper: Spearman Rank Correlation solver
 */
function calculateSpearmanRank(X, Y) {
  const n = X.length;
  const rankX = getRanks(X);
  const rankY = getRanks(Y);

  let dSqSum = 0;
  for (let i = 0; i < n; i++) {
    dSqSum += Math.pow(rankX[i] - rankY[i], 2);
  }

  return 1.0 - (6.0 * dSqSum) / (n * (n * n - 1));
}

function getRanks(arr) {
  const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  const ranks = new Array(arr.length);
  for (let i = 0; i < sorted.length; i++) {
    ranks[sorted[i].idx] = i + 1; // 1-indexed ranks
  }
  return ranks;
}

/**
 * Calculate Bland-Altman agreement parameters
 * @returns {object} { bias, stdDevDiff, upperAgreementLimit, lowerAgreementLimit }
 */
export function calculateBlandAltman(appValues, gtValues) {
  const metrics = calculateAccuracyMetrics(appValues, gtValues);
  const bias = metrics.bias;
  const stdDev = metrics.stdDevError;

  return {
    bias,
    stdDevDiff: stdDev,
    upperAgreementLimit: parseFloat((bias + 1.96 * stdDev).toFixed(3)),
    lowerAgreementLimit: parseFloat((bias - 1.96 * stdDev).toFixed(3))
  };
}
