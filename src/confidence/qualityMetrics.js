/**
 * qualityMetrics.js - 17-Factor Quality Metrics Evaluator for CEPE
 * 
 * Computes 17 independent quality scores (0.0 to 1.0) stored individually:
 * 1. Camera Stability
 * 2. Lighting Quality
 * 3. Edge Sharpness
 * 4. AI Detection Confidence
 * 5. Bounding Box Stability
 * 6. Manual Calibration Accuracy
 * 7. Reference Marker Quality
 * 8. GPS Accuracy
 * 9. Distance Reliability
 * 10. Sensor Drift
 * 11. Point Cloud Density
 * 12. Frame Consistency
 * 13. Tree Visibility / Coverage
 * 14. Occlusion
 * 15. Image Noise
 * 16. Motion Blur
 * 17. Device Orientation Stability
 */

export class QualityMetricsEngine {
  /**
   * Evaluate all 17 quality factors from runtime telemetry and AMSFE outputs
   * @param {Object} amsfeOutput Result from AMSFE.fuseMeasurements()
   * @param {Object} telemetry Extra device & sensor telemetry context
   * @returns {Object} Mapping of factor -> 0.0 to 1.0 score
   */
  evaluateQualityFactors(amsfeOutput = {}, telemetry = {}) {
    const {
      confidence: amsfeConf = 0.95,
      sensorBreakdown = {},
      activeSensorCount = 4,
      rejectedMeasurements = []
    } = amsfeOutput;

    const {
      cameraStability = 0.92,
      lightingQuality = 0.85,
      edgeSharpness = 0.80,
      sensorJitter = 0.04,
      gpsAccuracyMeters = 4.5,
      occlusionFactor = 0.0,
      imageNoise = 0.05,
      motionBlur = 0.02,
      pointCloudDensity = 1200,
      treeFrameCoverage = 0.65,
      recentlyCalibrated = true,
      markerDetected = true,
      aiConfidence = 0.94,
      bboxStability = 0.90,
      frameVariance = 0.02,
      sensorDriftRate = 0.01,
      pitchNoise = 0.05
    } = telemetry;

    // 1. Camera Stability
    const fCameraStability = Math.max(0.01, Math.min(1.0, cameraStability));

    // 2. Lighting Quality
    const fLightingQuality = Math.max(0.01, Math.min(1.0, lightingQuality));

    // 3. Edge Sharpness
    const fEdgeSharpness = Math.max(0.01, Math.min(1.0, edgeSharpness));

    // 4. AI Detection Confidence
    const fAiConfidence = Math.max(0.01, Math.min(1.0, aiConfidence));

    // 5. Bounding Box Stability
    const fBboxStability = Math.max(0.01, Math.min(1.0, bboxStability));

    // 6. Manual Calibration Accuracy
    const fManualCalibAccuracy = recentlyCalibrated ? 0.95 : 0.70;

    // 7. Reference Marker Quality
    const fReferenceMarkerQuality = markerDetected ? 0.94 : 0.30;

    // 8. GPS Accuracy (2m = 1.0, >20m = 0.2)
    const fGpsAccuracy = Math.max(0.10, Math.min(1.0, 1 - (gpsAccuracyMeters - 2) / 20));

    // 9. Distance Reliability
    const distanceM = amsfeOutput.distance || 8.0;
    const fDistanceReliability = distanceM <= 15 ? 1.0 : Math.max(0.30, 1 - (distanceM - 15) * 0.03);

    // 10. Sensor Drift (1.0 = no drift)
    const fSensorDrift = Math.max(0.01, Math.min(1.0, 1 - sensorDriftRate * 10));

    // 11. Point Cloud Density (2000 pts/m^2 = 1.0)
    const fPointCloudDensity = Math.min(1.0, Math.max(0.1, pointCloudDensity / 2000));

    // 12. Frame Consistency
    const fFrameConsistency = Math.max(0.01, Math.min(1.0, 1 - frameVariance * 5));

    // 13. Tree Visibility / Coverage
    const fTreeVisibility = Math.max(0.10, Math.min(1.0, treeFrameCoverage));

    // 14. Occlusion (1.0 = clear, 0.0 = blocked)
    const fOcclusion = Math.max(0.01, Math.min(1.0, 1 - occlusionFactor));

    // 15. Image Noise
    const fImageNoise = Math.max(0.01, Math.min(1.0, 1 - imageNoise * 3));

    // 16. Motion Blur
    const fMotionBlur = Math.max(0.01, Math.min(1.0, 1 - motionBlur * 5));

    // 17. Device Orientation Stability
    const fDeviceOrientationStability = Math.max(0.01, Math.min(1.0, 1 - pitchNoise * 4));

    const factors = {
      cameraStability: Number(fCameraStability.toFixed(4)),
      lightingQuality: Number(fLightingQuality.toFixed(4)),
      edgeSharpness: Number(fEdgeSharpness.toFixed(4)),
      aiConfidence: Number(fAiConfidence.toFixed(4)),
      bboxStability: Number(fBboxStability.toFixed(4)),
      manualCalibAccuracy: Number(fManualCalibAccuracy.toFixed(4)),
      referenceMarkerQuality: Number(fReferenceMarkerQuality.toFixed(4)),
      gpsAccuracy: Number(fGpsAccuracy.toFixed(4)),
      distanceReliability: Number(fDistanceReliability.toFixed(4)),
      sensorDrift: Number(fSensorDrift.toFixed(4)),
      pointCloudDensity: Number(fPointCloudDensity.toFixed(4)),
      frameConsistency: Number(fFrameConsistency.toFixed(4)),
      treeVisibility: Number(fTreeVisibility.toFixed(4)),
      occlusion: Number(fOcclusion.toFixed(4)),
      imageNoise: Number(fImageNoise.toFixed(4)),
      motionBlur: Number(fMotionBlur.toFixed(4)),
      deviceOrientationStability: Number(fDeviceOrientationStability.toFixed(4))
    };

    return factors;
  }

  /**
   * Classify a 0.0-1.0 factor score into text rating: Excellent, Good, Average, Poor
   * @param {number} score 
   * @returns {string}
   */
  classifyScore(score) {
    if (score >= 0.90) return 'Excellent';
    if (score >= 0.80) return 'Good';
    if (score >= 0.65) return 'Average';
    return 'Poor';
  }
}

export const qualityMetricsEngine = new QualityMetricsEngine();
