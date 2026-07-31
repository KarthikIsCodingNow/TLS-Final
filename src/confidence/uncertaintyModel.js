/**
 * uncertaintyModel.js - Gaussian Confidence Intervals & Uncertainty Model for CEPE
 * 
 * Computes 68% (+/- 1.0 sigma), 95% (+/- 1.96 sigma), and 99% (+/- 2.58 sigma)
 * confidence intervals for Height, Distance, DBH, Biomass, and Carbon.
 */

export class UncertaintyModelEngine {
  /**
   * Compute 68%, 95%, and 99% confidence intervals for a set of dimensions and expected errors
   * @param {Object} dimensions { height, distance, dbh, biomass, carbon }
   * @param {Object} expectedErrors { height, distance, dbh, biomass, carbon }
   * @returns {Object} Mapping of dimension -> { val, ci68, ci95, ci99 }
   */
  calculateConfidenceIntervals(dimensions = {}, expectedErrors = {}) {
    const metrics = ['height', 'distance', 'dbh', 'biomass', 'carbon'];
    const intervals = {};

    metrics.forEach(m => {
      const val = dimensions[m] || 0;
      const sigma = expectedErrors[m] || 0.1;

      const ci68Margin = Number((1.0 * sigma).toFixed(2));
      const ci95Margin = Number((1.96 * sigma).toFixed(2));
      const ci99Margin = Number((2.58 * sigma).toFixed(2));

      intervals[m] = {
        value: val,
        sigma,
        ci68: {
          margin: ci68Margin,
          lower: Number(Math.max(0, val - ci68Margin).toFixed(2)),
          upper: Number((val + ci68Margin).toFixed(2)),
          label: `±${ci68Margin}`
        },
        ci95: {
          margin: ci95Margin,
          lower: Number(Math.max(0, val - ci95Margin).toFixed(2)),
          upper: Number((val + ci95Margin).toFixed(2)),
          label: `±${ci95Margin}`
        },
        ci99: {
          margin: ci99Margin,
          lower: Number(Math.max(0, val - ci99Margin).toFixed(2)),
          upper: Number((val + ci99Margin).toFixed(2)),
          label: `±${ci99Margin}`
        }
      };
    });

    return intervals;
  }
}

export const uncertaintyModelEngine = new UncertaintyModelEngine();
