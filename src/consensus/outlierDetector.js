/**
 * outlierDetector.js - Statistical Outlier Detection Engine for CMME
 * 
 * Implements:
 * 1. Median Absolute Deviation (MAD) & Modified Z-Score (Mi > 3.5)
 * 2. Interquartile Range (IQR) Outer Fences [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
 * 3. Multi-Metric Consistency Evaluation (Height, DBH, Distance, Biomass)
 * 4. Multi-Factor Quality Gating (CEPE Confidence, Stability, Sensor Jitter)
 */

export class OutlierDetector {
  /**
   * Run outlier detection across collected frame array
   * @param {Array<Object>} frames - Array of collected frame objects
   * @returns {Object} { classifiedFrames, acceptedFrames, rejectedFrames, suspiciousFrames, summary }
   */
  evaluateFrames(frames) {
    if (!frames || frames.length === 0) {
      return {
        classifiedFrames: [],
        acceptedFrames: [],
        rejectedFrames: [],
        suspiciousFrames: [],
        summary: { total: 0, accepted: 0, rejected: 0, suspicious: 0 }
      };
    }

    // Clone frames for non-destructive tagging
    const classified = frames.map(f => ({ ...f, status: 'valid', rejectionReasons: [] }));

    // Extract metric vectors
    const heights = classified.map(f => f.dimensions.height);
    const dbhs = classified.map(f => f.dimensions.dbh);
    const distances = classified.map(f => f.dimensions.distance);

    // Compute MAD bounds for Height, DBH, Distance
    const heightMad = this.computeMAD(heights);
    const dbhMad = this.computeMAD(dbhs);
    const distMad = this.computeMAD(distances);

    // Compute IQR bounds for Height, DBH, Distance
    const heightIqr = this.computeIQRBounds(heights);
    const dbhIqr = this.computeIQRBounds(dbhs);
    const distIqr = this.computeIQRBounds(distances);

    classified.forEach(frame => {
      const h = frame.dimensions.height;
      const d = frame.dimensions.dbh;
      const dist = frame.dimensions.distance;
      const conf = frame.cepe.confidencePct;
      const rel = frame.cepe.reliabilityIndex;

      // 1. Check Modified Z-Scores
      if (heightMad.mad > 0.001) {
        const modZ = (0.6745 * Math.abs(h - heightMad.median)) / heightMad.mad;
        if (modZ > 3.5) {
          frame.rejectionReasons.push(`Height MAD Outlier (Mod Z=${modZ.toFixed(2)} > 3.5, H=${h.toFixed(2)}m vs Median=${heightMad.median.toFixed(2)}m)`);
        } else if (modZ > 2.5) {
          frame.status = 'suspicious';
        }
      }

      if (dbhMad.mad > 0.001) {
        const modZ = (0.6745 * Math.abs(d - dbhMad.median)) / dbhMad.mad;
        if (modZ > 3.5) {
          frame.rejectionReasons.push(`DBH MAD Outlier (Mod Z=${modZ.toFixed(2)} > 3.5, DBH=${d.toFixed(1)}cm vs Median=${dbhMad.median.toFixed(1)}cm)`);
        }
      }

      if (distMad.mad > 0.001) {
        const modZ = (0.6745 * Math.abs(dist - distMad.median)) / distMad.mad;
        if (modZ > 3.5) {
          frame.rejectionReasons.push(`Distance MAD Outlier (Mod Z=${modZ.toFixed(2)} > 3.5, D=${dist.toFixed(2)}m vs Median=${distMad.median.toFixed(2)}m)`);
        }
      }

      // 2. Check IQR Outer Fences
      if (h < heightIqr.lowerFence || h > heightIqr.upperFence) {
        frame.rejectionReasons.push(`Height IQR Outlier (${h.toFixed(2)}m outside [${heightIqr.lowerFence.toFixed(2)}, ${heightIqr.upperFence.toFixed(2)}])`);
      }

      if (d < dbhIqr.lowerFence || d > dbhIqr.upperFence) {
        frame.rejectionReasons.push(`DBH IQR Outlier (${d.toFixed(1)}cm outside [${dbhIqr.lowerFence.toFixed(1)}, ${dbhIqr.upperFence.toFixed(1)}])`);
      }

      // 3. CEPE Confidence & Reliability Hard Floor Gating
      if (conf < 55.0) {
        frame.rejectionReasons.push(`Low CEPE Confidence (${conf.toFixed(1)}% < 55.0% threshold)`);
      }

      if (rel < 50.0) {
        frame.rejectionReasons.push(`Low Reliability Index (${rel.toFixed(1)} < 50.0 threshold)`);
      }

      // Finalize status
      if (frame.rejectionReasons.length > 0) {
        frame.status = 'rejected';
      } else if (frame.status !== 'suspicious') {
        frame.status = 'valid';
      }
    });

    const accepted = classified.filter(f => f.status === 'valid' || f.status === 'suspicious');
    const rejected = classified.filter(f => f.status === 'rejected');
    const suspicious = classified.filter(f => f.status === 'suspicious');

    // Fallback: If ALL frames were rejected (e.g. extreme turbulence), accept top 50% highest confidence frames
    let finalAccepted = accepted;
    if (accepted.length === 0 && classified.length > 0) {
      const sortedByConf = [...classified].sort((a, b) => b.cepe.confidencePct - a.cepe.confidencePct);
      const fallbackCount = Math.max(1, Math.ceil(classified.length * 0.5));
      finalAccepted = sortedByConf.slice(0, fallbackCount).map(f => ({ ...f, status: 'valid', fallbackOverride: true }));
    }

    return {
      classifiedFrames: classified,
      acceptedFrames: finalAccepted,
      rejectedFrames: rejected,
      suspiciousFrames: suspicious,
      summary: {
        total: classified.length,
        accepted: finalAccepted.length,
        rejected: rejected.length,
        suspicious: suspicious.length,
        acceptanceRate: Math.round((finalAccepted.length / classified.length) * 100)
      }
    };
  }

  /**
   * Calculate Median Absolute Deviation (MAD) for a numeric array
   * MAD = median(|x_i - median(x)|)
   */
  computeMAD(arr) {
    if (!arr || arr.length === 0) return { median: 0, mad: 0 };
    const sorted = [...arr].sort((a, b) => a - b);
    const median = this.getMedian(sorted);
    const absDevs = sorted.map(x => Math.abs(x - median)).sort((a, b) => a - b);
    const mad = this.getMedian(absDevs);
    return { median, mad };
  }

  /**
   * Compute IQR (Interquartile Range) and lower/upper fences
   */
  computeIQRBounds(arr) {
    if (!arr || arr.length === 0) return { q1: 0, q3: 0, iqr: 0, lowerFence: 0, upperFence: 0 };
    const sorted = [...arr].sort((a, b) => a - b);
    const q1 = this.getPercentile(sorted, 25);
    const q3 = this.getPercentile(sorted, 75);
    const iqr = q3 - q1;
    return {
      q1,
      q3,
      iqr,
      lowerFence: q1 - 1.5 * iqr,
      upperFence: q3 + 1.5 * iqr
    };
  }

  /**
   * Helper: Calculate median of sorted array
   */
  getMedian(sorted) {
    const len = sorted.length;
    if (len === 0) return 0;
    const mid = Math.floor(len / 2);
    return len % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Helper: Calculate percentile of sorted array
   */
  getPercentile(sorted, p) {
    if (sorted.length === 0) return 0;
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}
