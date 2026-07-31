/**
 * confidenceEngine.js - Dynamic Sensor Quality & Confidence Calculator for AMSFE
 * 
 * Computes individual quality scores (0.0 to 1.0) for every measurement source based on:
 * - Camera Stability (IMU variance)
 * - Ambient Lighting Quality
 * - Image Edge Sharpness
 * - AI Detection Probability
 * - Bounding Box Stability
 * - Sensor Jitter (accelerometer/gyro noise)
 * - GPS Accuracy
 * - Distance Penalty (atmospheric/optics dropoff)
 * - Occlusion Factor
 * - Measurement Freshness / Age Decay
 */

export class ConfidenceEngine {
  constructor() {
    this.defaultFactorWeights = {
      stability: 0.15,
      lighting: 0.10,
      sharpness: 0.10,
      aiProb: 0.15,
      bboxStability: 0.10,
      jitter: 0.10,
      gpsAccuracy: 0.05,
      distancePenalty: 0.10,
      occlusion: 0.10,
      freshness: 0.05
    };
  }

  /**
   * Calculate a dynamic sensor quality score (0.0 to 1.0) for a given sensor reading
   * @param {Object} measurement Standardized measurement object
   * @param {Object} envContext Environmental and device telemetry context
   * @returns {number} Score between 0.0 and 1.0
   */
  calculateSensorQuality(measurement, envContext = {}) {
    if (!measurement) return 0;

    const {
      type,
      confidence: rawConfidence = 0.8,
      timestamp = Date.now(),
      metadata = {}
    } = measurement;

    const {
      cameraStability = 0.9,     // 0-1
      lightingQuality = 0.85,    // 0-1
      edgeSharpness = 0.8,       // 0-1
      sensorJitter = 0.05,       // g-force or rad/s variance
      gpsAccuracyMeters = 5,     // meters
      occlusionFactor = 0.0,     // 0 (clear) to 1 (blocked)
      distanceMeters = measurement.distance || 10
    } = envContext;

    // 1. Camera Stability Factor (1 = perfectly still, 0 = rapid motion)
    const stabilityScore = Math.max(0, Math.min(1, cameraStability));

    // 2. Ambient Lighting Factor (0.5-1.0 optimal, drops in extreme dark/glare)
    const lightingScore = Math.max(0, Math.min(1, lightingQuality));

    // 3. Edge Sharpness Factor
    const sharpnessScore = Math.max(0, Math.min(1, edgeSharpness));

    // 4. AI Probability / Bounding Box Stability (from metadata or measurement)
    const aiProbScore = Math.max(0, Math.min(1, metadata.aiProb || rawConfidence));
    const bboxStabilityScore = Math.max(0, Math.min(1, metadata.bboxStability || 0.88));

    // 5. Sensor Jitter Factor (0 jitter = 1 score, >0.5 jitter = 0 score)
    const jitterScore = Math.max(0, Math.min(1, 1 - sensorJitter * 2));

    // 6. GPS Accuracy Factor (<2m = 1.0, >20m = 0.2)
    const gpsScore = Math.max(0.1, Math.min(1, 1 - (gpsAccuracyMeters - 2) / 20));

    // 7. Distance Penalty (Optics blur / LiDAR beam divergence increases past 25m)
    let distanceScore = 1.0;
    if (distanceMeters > 15) {
      distanceScore = Math.max(0.3, 1 - (distanceMeters - 15) * 0.025);
    }

    // 8. Occlusion Score (1 - occlusion)
    const occlusionScore = Math.max(0, Math.min(1, 1 - occlusionFactor));

    // 9. Freshness / Age Decay (100% fresh for <1s, decays exponentially over 10s)
    const ageSeconds = Math.max(0, (Date.now() - timestamp) / 1000);
    const freshnessScore = Math.exp(-0.2 * ageSeconds);

    // Source-specific adjustments
    let finalQuality = 0;
    switch (type) {
      case 'manual': {
        const recencyBoost = metadata.recentlyCalibrated ? 0.1 : 0;
        finalQuality = 0.70 * rawConfidence + 0.15 * freshnessScore + 0.15 * (1 - occlusionFactor) + recencyBoost;
        break;
      }
      case 'ai': {
        finalQuality = (
          aiProbScore * 0.25 +
          bboxStabilityScore * 0.20 +
          lightingScore * 0.15 +
          sharpnessScore * 0.15 +
          stabilityScore * 0.15 +
          freshnessScore * 0.10
        );
        break;
      }
      case 'clinometer': {
        finalQuality = (
          stabilityScore * 0.35 +
          jitterScore * 0.35 +
          distanceScore * 0.15 +
          freshnessScore * 0.15
        );
        break;
      }
      case 'marker': {
        const markerDetected = metadata.markerDetected !== false;
        if (!markerDetected) return 0.1;
        finalQuality = (
          sharpnessScore * 0.30 +
          lightingScore * 0.25 +
          distanceScore * 0.25 +
          freshnessScore * 0.20
        );
        break;
      }
      case 'pointcloud': {
        const density = metadata.pointDensity || 1000;
        const densityScore = Math.min(1.0, density / 2000);
        finalQuality = (
          densityScore * 0.40 +
          distanceScore * 0.30 +
          freshnessScore * 0.20 +
          stabilityScore * 0.10
        );
        break;
      }
      case 'gps': {
        finalQuality = gpsScore * 0.7 + freshnessScore * 0.3;
        break;
      }
      default: {
        finalQuality = rawConfidence * freshnessScore;
      }
    }

    return Math.max(0.01, Math.min(0.99, Number(finalQuality.toFixed(4))));
  }
}

export const confidenceEngine = new ConfidenceEngine();
