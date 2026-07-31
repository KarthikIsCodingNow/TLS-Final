/**
 * sensorWeights.js - Dynamic Weight Calculation & Normalization Engine for AMSFE
 * 
 * Computes adaptive weight vectors w_i for active measurement sources such that sum(w_i) = 1.0.
 * Dynamic rule evaluation:
 * - AI Confidence > 95% -> Increase AI weight
 * - Poor lighting -> Reduce AI weight
 * - Weak GPS accuracy -> Reduce GPS weight
 * - Recent manual calibration -> Increase manual weight
 * - Point cloud available -> Prioritize point cloud weight
 * - Reference marker detected -> Increase reference marker weight
 */

export class SensorWeightsEngine {
  /**
   * Calculate normalized adaptive weights for an array of evaluated sensor objects
   * @param {Array<Object>} evaluatedSensors Array of objects containing { sensor, qualityScore }
   * @param {Object} envContext Environmental context
   * @returns {Object} Mapping of sensor type -> weight (summing to 1.0)
   */
  calculateWeights(evaluatedSensors = [], envContext = {}) {
    if (!evaluatedSensors.length) return {};

    const rawWeights = {};

    evaluatedSensors.forEach(({ sensor, qualityScore }) => {
      const type = sensor.type;
      const confidence = sensor.confidence || qualityScore;
      const metadata = sensor.metadata || {};

      // Base weight starts proportional to quality score squared (higher confidence scales non-linearly)
      let w = Math.pow(qualityScore, 2);

      // Condition 1: AI confidence > 95% -> Boost AI weight
      if (type === 'ai') {
        if (confidence > 0.95 || (metadata.aiProb && metadata.aiProb > 0.95)) {
          w *= 1.45;
        }
        // Poor lighting penalty
        if (envContext.lightingQuality && envContext.lightingQuality < 0.4) {
          w *= 0.55;
        }
      }

      // Condition 2: GPS weak penalty
      if (type === 'gps') {
        if (envContext.gpsAccuracyMeters && envContext.gpsAccuracyMeters > 15) {
          w *= 0.3;
        }
      }

      // Condition 3: Recent manual calibration boost
      if (type === 'manual') {
        if (metadata.recentlyCalibrated || envContext.recentlyCalibrated) {
          w *= 1.35;
        }
      }

      // Condition 4: Point cloud available & dense -> Prioritize point cloud
      if (type === 'pointcloud') {
        if (metadata.pointDensity && metadata.pointDensity > 1500) {
          w *= 1.6;
        } else {
          w *= 1.3;
        }
      }

      // Condition 5: Reference marker detected -> Increase marker weight
      if (type === 'marker') {
        if (metadata.markerDetected !== false) {
          w *= 1.4;
        } else {
          w *= 0.1;
        }
      }

      // Condition 6: Clinometer IMU stability check
      if (type === 'clinometer') {
        if (envContext.cameraStability && envContext.cameraStability > 0.9) {
          w *= 1.25;
        }
      }

      rawWeights[type] = Math.max(0.01, w);
    });

    // Normalize weights to sum strictly to 1.0
    const totalRaw = Object.values(rawWeights).reduce((sum, val) => sum + val, 0);

    const normalizedWeights = {};
    if (totalRaw > 0) {
      Object.keys(rawWeights).forEach(type => {
        normalizedWeights[type] = Number((rawWeights[type] / totalRaw).toFixed(4));
      });

      // Adjust rounding discrepancies so sum equals exactly 1.0000
      const currentSum = Object.values(normalizedWeights).reduce((sum, val) => sum + val, 0);
      const diff = Number((1.0 - currentSum).toFixed(4));
      if (diff !== 0 && Object.keys(normalizedWeights).length > 0) {
        const firstKey = Object.keys(normalizedWeights)[0];
        normalizedWeights[firstKey] = Number((normalizedWeights[firstKey] + diff).toFixed(4));
      }
    }

    return normalizedWeights;
  }
}

export const sensorWeightsEngine = new SensorWeightsEngine();
