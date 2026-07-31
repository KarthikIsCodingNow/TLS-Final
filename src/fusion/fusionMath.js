/**
 * fusionMath.js - Statistical Fusion, Outlier Rejection & Uncertainty Engine for AMSFE
 * 
 * Implements:
 * - Median Absolute Deviation (MAD) & Modified Z-Score Outlier Filtering
 * - Weighted Parameter Fusion (Height, DBH, Distance)
 * - Variance & Uncertainty Estimation
 * - Allometric Biomass & Carbon Sequestration recalculation from fused metrics
 */

export class FusionMathEngine {
  /**
   * Calculate median of an array of numbers
   * @param {Array<number>} values 
   * @returns {number}
   */
  calculateMedian(values) {
    if (!values || !values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate Median Absolute Deviation (MAD)
   * MAD = median(|x_i - median(x)|)
   * @param {Array<number>} values 
   * @param {number} median 
   * @returns {number}
   */
  calculateMAD(values, median) {
    if (!values || values.length <= 1) return 0;
    const med = median !== undefined ? median : this.calculateMedian(values);
    const absoluteDeviations = values.map(v => Math.abs(v - med));
    return this.calculateMedian(absoluteDeviations);
  }

  /**
   * Detect outliers across sensor measurements for a specific metric (e.g., height, dbh, distance)
   * Uses Modified Z-Score: M_i = (0.6745 * |x_i - median|) / MAD
   * Threshold M_i > 3.5 flags an outlier.
   * 
   * @param {Array<Object>} validSensors Array of { sensor, qualityScore }
   * @param {string} field 'height', 'dbh', or 'distance'
   * @param {number} zThreshold Cutoff threshold (default 3.5)
   * @returns {Object} { accepted: [], rejected: [] }
   */
  detectOutliers(validSensors, field = 'height', zThreshold = 3.5) {
    const itemsWithValue = validSensors.filter(s => s.sensor && typeof s.sensor[field] === 'number' && s.sensor[field] > 0);

    if (itemsWithValue.length <= 2) {
      // Not enough sample points for statistical MAD, return all accepted
      return { accepted: validSensors, rejected: [] };
    }

    const values = itemsWithValue.map(s => s.sensor[field]);
    const median = this.calculateMedian(values);
    const mad = this.calculateMAD(values, median);

    const accepted = [];
    const rejected = [];

    validSensors.forEach(item => {
      const val = item.sensor ? item.sensor[field] : null;
      if (typeof val !== 'number' || val <= 0) {
        accepted.push(item);
        return;
      }

      let modZ = 0;
      if (mad > 1e-6) {
        modZ = (0.6745 * Math.abs(val - median)) / mad;
      } else {
        // If MAD is zero (all values identical except outliers), use relative delta from median
        modZ = median > 0 ? (Math.abs(val - median) / median) * 10 : 0;
      }

      if (modZ > zThreshold) {
        rejected.push({
          sensor: item.sensor,
          type: item.sensor.type,
          field,
          value: val,
          median,
          modifiedZScore: Number(modZ.toFixed(2)),
          reason: `Outlier detected in ${field} (Value: ${val}, Median: ${median.toFixed(2)}, Z-Score: ${modZ.toFixed(2)})`
        });
      } else {
        accepted.push(item);
      }
    });

    return { accepted, rejected };
  }

  /**
   * Compute weighted fused value for a specific metric
   * @param {Array<Object>} sensors 
   * @param {Object} weights Mapping of type -> normalized weight
   * @param {string} field 'height', 'dbh', 'distance'
   * @returns {number}
   */
  computeWeightedValue(sensors, weights, field) {
    let sumWeightedValue = 0;
    let sumWeight = 0;

    sensors.forEach(item => {
      const type = item.sensor.type;
      const w = weights[type] || 0;
      const val = item.sensor[field];

      if (typeof val === 'number' && val > 0 && w > 0) {
        sumWeightedValue += val * w;
        sumWeight += w;
      }
    });

    return sumWeight > 0 ? Number((sumWeightedValue / sumWeight).toFixed(3)) : 0;
  }

  /**
   * Calculate overall fused confidence & uncertainty
   * @param {Array<Object>} sensors 
   * @param {Object} weights 
   * @returns {Object} { fusedConfidence, uncertainty }
   */
  computeConfidenceAndUncertainty(sensors, weights) {
    if (!sensors.length) return { fusedConfidence: 0.5, uncertainty: 0.5 };

    let sumWeightedQuality = 0;
    let sumWeight = 0;
    let varianceSum = 0;

    sensors.forEach(item => {
      const type = item.sensor.type;
      const w = weights[type] || 0;
      const q = item.qualityScore || 0.8;

      if (w > 0) {
        sumWeightedQuality += q * w;
        sumWeight += w;

        // Individual variance sigma^2 = (1 - q)^2
        const sigmaSq = Math.pow(1 - q, 2);
        varianceSum += Math.pow(w, 2) * sigmaSq;
      }
    });

    const fusedConfidence = sumWeight > 0 ? Number((sumWeightedQuality / sumWeight).toFixed(4)) : 0.5;
    
    // Overall uncertainty is standard error sqrt(sum(w_i^2 * sigma_i^2))
    const uncertainty = Number(Math.sqrt(varianceSum).toFixed(4));

    return { fusedConfidence, uncertainty };
  }

  /**
   * Estimate Biomass (kg) and Carbon (kg) from fused DBH (cm) and Height (m)
   * Uses Chave et al. (2014) pantropical model as baseline
   * @param {number} dbhCm 
   * @param {number} heightM 
   * @param {number} woodDensity Wood density in g/cm^3 (default 0.6)
   * @returns {Object} { biomassKg, carbonKg }
   */
  calculateBiomassAndCarbon(dbhCm, heightM, woodDensity = 0.6) {
    if (!dbhCm || !heightM || dbhCm <= 0 || heightM <= 0) {
      return { biomassKg: 0, carbonKg: 0 };
    }

    // AGB = 0.0673 * (woodDensity * DBH^2 * Height)^0.976
    const term = woodDensity * Math.pow(dbhCm, 2) * heightM;
    const biomassKg = Number((0.0673 * Math.pow(term, 0.976)).toFixed(2));
    const carbonKg = Number((biomassKg * 0.47).toFixed(2));

    return { biomassKg, carbonKg };
  }
}

export const fusionMathEngine = new FusionMathEngine();
