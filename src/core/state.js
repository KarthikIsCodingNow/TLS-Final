/**
 * PORTA-TLS Structured Application State
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from './config.js';

export const state = {
  // UI and routing configurations
  ui: {
    currentTab: 'dashboard', // dashboard | scanner | automatic | inventory | calibration
    activeView: 'camera',    // camera | lidar
    modal: {
      active: false,
      treeId: null
    },
    charts: {
      species: null
    }
  },

  // Camera settings and file fallbacks
  camera: {
    stream: null,
    active: false,
    facingMode: 'environment',
    imageLoaded: false,
    uploadedImage: null
  },

  // Sensor state: pitch angles, tilts
  sensors: {
    pitch: 0,               // raw pitch
    filteredPitch: 0,       // filtered pitch based on active filter
    status: 'INACTIVE'
  },

  // Calibration bounds (percentage coords for calipers)
  calibration: {
    left: CONFIG.calibration.defaultLeftPercent,
    right: CONFIG.calibration.defaultRightPercent,
    top: CONFIG.calibration.defaultTopPercent,
    base: CONFIG.calibration.defaultBasePercent,

    // Dynamic Camera Optics Calibrations
    hfov: CONFIG.camera.defaultHfovDeg,
    vfov: CONFIG.camera.defaultVfovDeg,
    sensorWidth: CONFIG.camera.defaultSensorWidthMm,
    sensorHeight: CONFIG.camera.defaultSensorHeightMm,
    focalLength: CONFIG.camera.defaultFocalLengthMm,
    cameraHeight: CONFIG.camera.defaultHeight
  },

  // Scientific Calibration Engine Parameters (Task 7)
  calibrationData: {
    HFOV: CONFIG.camera.defaultHfovDeg,
    VFOV: CONFIG.camera.defaultVfovDeg,
    cameraHeight: CONFIG.camera.defaultHeight,
    pitchBias: 0.0,
    rollBias: 0.0,
    compassBias: 0.0,
    distanceCorrectionFactor: 1.0,
    heightCorrectionFactor: 1.0,
    dbhCorrectionFactor: 1.0,
    temperature: 20.0,
    deviceModel: "Standard Mobile Camera",
    calibrationVersion: "2.1.0-VALIDATED",
    calibrationDate: new Date().toISOString(),
    calibratedBy: "Field Calibration Protocol",
    sensorNoise: {
      sigmaPitch: 0.05,
      sigmaRoll: 0.05,
      sigmaYaw: 0.08
    }
  },

  // Measurement modes, heights, and DBHs
  measurement: {
    mode: 'clinometer', // clinometer | manual | reference
    slopeAngle: 0.0,    // terrain slope angle in degrees
    clinometer: {
      baseAngle: null,
      topAngle: null,
      cameraHeight: CONFIG.camera.defaultHeight,
      distance: CONFIG.camera.defaultOverrideDistance,
      height: 0.0,
      useOverrideDistance: false,
      overrideDistance: CONFIG.camera.defaultOverrideDistance
    },
    manual: {
      distance: CONFIG.camera.defaultOverrideDistance
    },
    reference: {
      markerHeightCm: 29.7,
      estimatedDistance: CONFIG.camera.defaultOverrideDistance
    },
    
    // Live results with uncertainty ranges
    live: {
      distance: 0.0,
      distanceError: 0.0,
      distanceConfidence: 0.0,
      distanceMethod: 'clinometer',

      height: 0.0,
      heightError: 0.0,
      heightConfidence: 0.0,
      heightMethod: 'clinometer',

      dbh: 0.0,
      dbhError: 0.0,
      dbhConfidence: 0.0,

      agb: 0.0,
      agbError: 0.0,
      agbConfidence: 0.0,

      co2: 0.0,
      co2Error: 0.0
    }
  },

  // Current tree selection details (forms)
  tree: {
    tagId: '',
    species: 'Pine',
    customDensity: 0.50
  },

  // Loaded tree collection registry
  registry: {
    trees: []
  },

  // LiDAR and point cloud rendering variables
  pointCloud: {
    spin: true,
    noise: false,
    points: [],
    rotationAngle: 0,
    isCustomScan: false
  },

  // Device permissions and status caches
  device: {
    cameraPermission: 'unknown',
    gpsPermission: 'unknown',
    orientationPermission: 'unknown'
  },

  // AI recognition and object tracking (COCO-SSD)
  ai: {
    active: false,
    stream: null,
    modelLoading: false,
    modelLoaded: false,
    cocoModel: null,
    predictions: [],
    targetClass: 'trees', // trees | all
    confidenceThreshold: CONFIG.ai.defaultConfidenceThreshold,
    useOverrideDistance: true,
    overrideDistance: CONFIG.camera.defaultOverrideDistance,
    cameraHeight: CONFIG.camera.defaultHeight,
    height: 0.0,
    dbh: 0.0,
    isTracking: true,
    facingMode: 'environment',
    edgeDetectionEnabled: true,
    selectedPrediction: null
  },

  // Settings & Toggles
  settings: {
    edgeDetectionEnabled: true,
    researchModeEnabled: false,
    activePitchFilter: 'kalman' // raw | moving_average | low_pass | median | kalman
  },

  // GPS Coordinates and Telemetry
  telemetry: {
    gps: {
      lat: null,
      lon: null,
      accuracy: null,
      status: 'LOCATING...'
    }
  },

  // Multi-frame Sampling State
  sampling: {
    isSampling: false,
    frameCount: CONFIG.sampling.defaultFrameCount,
    samplesCaptured: 0,
    distanceSamples: [],
    heightSamples: [],
    dbhSamples: []
  },

  // Live Diagnostics telemetry values
  diagnostics: {
    fpsCamera: 0,
    fpsInference: 0,
    fpsRender: 0,
    activeAlgorithm: 'Clinometer',
    intermediateCalculations: {}
  },

  // History stack for caliper coordinates undo
  history: {
    calibrationHistory: [],
    // Rolling 30 measurements log
    measurements: []
  }
};
