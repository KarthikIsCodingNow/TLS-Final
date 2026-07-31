/**
 * PORTA-TLS Application Configuration
 * Version 2.0 Architectural Baseline
 */
export const CONFIG = Object.freeze({
  camera: {
    // Optical fallbacks
    defaultHfovDeg: 60,
    defaultVfovDeg: 45,
    defaultSensorWidthMm: 6.0,
    defaultSensorHeightMm: 4.5,
    defaultFocalLengthMm: 4.0,

    defaultHeight: 1.5,
    minHeight: 0.5,
    maxHeight: 3.0,
    defaultOverrideDistance: 5.0,
    idealWidth: 1280,
    idealHeight: 720
  },
  cv: {
    downsampleWidth: 320,
    luminanceCoefficients: { r: 0.3, g: 0.59, b: 0.11 },
    edgeThreshold: 15,
    edgeMultiplier: 2.5,
    edgeOpacity: 100 // out of 255
  },
  ai: {
    defaultConfidenceThreshold: 0.20, // 20%
    inferenceIntervalMs: 250, // 4 FPS for mobile performance
    targetFloraClasses: ['potted plant', 'vase', 'broccoli', 'bed', 'umbrella'],
    iouTrackingThreshold: 0.20, // Minimum overlap IoU to continue tracking
    minScorePct: 10,
    maxScorePct: 90
  },
  lidar: {
    maxPoints: 2000,
    simulationQty: 500,
    trunkRatio: 0.4,
    foliageRatio: 0.6,
    spinSpeed: 0.012,
    renderScale: 25,
    cameraDistance: 8,
    projectionFov: 260,
    breastHeightMin: 1.15, // meters
    breastHeightMax: 1.45, // meters
    defaultScanHeight: 6.0
  },
  gps: {
    mockLatitude: 41.21318,
    mockLongitude: -124.00462,
    enableHighAccuracy: true
  },
  calibration: {
    defaultLeftPercent: 35,
    defaultRightPercent: 65,
    defaultTopPercent: 15,
    defaultBasePercent: 85,
    dragGrabRangePx: 25,
    maxHistoryUndo: 15
  },
  performance: {
    frameRateSamplingMs: 1000
  },

  // Scientific Uncertainty / Standard Deviations
  uncertainty: {
    anglePitchRad: 1.0 * Math.PI / 180,       // 1.0 degree in radians
    angleSlopeRad: 1.0 * Math.PI / 180,       // 1.0 degree in radians
    cameraHeightMeters: 0.05,                 // 5 cm
    dragPercent: 1.0,                         // 1.0% caliper drag uncertainty
    referenceMarkerMeters: 0.005,             // 0.5 cm
    manualDistanceMeters: 0.1,                // 10 cm
    focalLengthPercent: 0.02                  // 2% focal length uncertainty
  },

  // Sensor Filters
  filters: {
    movingAverageSize: 10,
    medianSize: 9,
    lowPassAlpha: 0.15,
    kalman: {
      processNoiseQ: 0.001,
      measurementNoiseR: 0.1,
      initialErrorP: 1.0
    }
  },

  // Multi-frame Sampling
  sampling: {
    defaultFrameCount: 30,
    outlierThresholdZ: 1.5 // Reject values beyond 1.5 standard deviations
  }
});
