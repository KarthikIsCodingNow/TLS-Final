/**
 * PORTA-TLS Invention Suite Configuration System
 * Version 2.0 Architectural Baseline
 */

export const INVENTION_CONFIG = {
  // Adaptive Hybrid Measurement Engine (AHME) Configuration
  ahme: {
    regularizationConstant: 1e-5,
    minimumConfidenceThreshold: 0.15,
    methodWeights: {
      clinometer: 1.0,
      reference: 1.2,
      manual: 0.5,
      ai: 1.5,
      segmentation: 1.4,
      pointcloud: 1.8
    }
  },

  // Self-Calibrating Camera Model Configuration
  selfCalibration: {
    learningRate: 0.05,
    maxBiasCorrectionPercent: 15.0, // cap learning adjustment to prevent runaways
    minSamplesToLearn: 3
  },

  // Sensor Fusion Weights (Total sum = 1.0)
  sensorFusion: {
    weightFrameQuality: 0.35,
    weightSensorStability: 0.30,
    weightVisionConfidence: 0.35
  },

  // Self-Diagnostic Alert Thresholds
  diagnostics: {
    maxAllowedSensorStdDevDeg: 2.5, // alerts on camera shake / hand jitter
    calibrationDriftThresholdPercent: 8.0, // alerts if calib deviates from baseline
    minIlluminationLuxEquivalent: 40.0,
    maxIlluminationLuxEquivalent: 220.0
  },

  // Patent mode state
  patentMode: {
    enabled: false,
    storageKey: 'portatls_patent_runs'
  }
};
