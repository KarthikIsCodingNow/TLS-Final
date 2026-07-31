/**
 * PORTA-TLS Scientific Research Dataset Logger & Versioning Engine
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export const ALGORITHM_VERSIONS = {
  measurementEngine: 'v1.0-VALIDATED',
  confidenceEngine: 'v1.2-MULTI-VECTOR',
  calibrationEngine: 'v2.0-IMU-ZEROED',
  cvEngine: 'v2.2-CANNY-SOBEL',
  biomassEngine: 'v2.3-MULTI-MODEL'
};

const researchLogBuffer = [];

export const ScientificLogger = {
  /**
   * Log a structured research-grade measurement record (Requirements 15, 16, 17)
   */
  logScan(state, measurementData) {
    const record = {
      recordId: `RES-${Date.now()}`,
      timestamp: new Date().toISOString(),
      algorithmVersions: { ...ALGORITHM_VERSIONS },
      device: {
        model: state.calibrationData?.deviceModel || 'Generic Mobile',
        hfov: state.calibrationData?.HFOV || 60.0,
        vfov: state.calibrationData?.VFOV || 45.0,
        cameraHeight: state.calibrationData?.cameraHeight || 1.45
      },
      rawSensors: {
        pitch: state.sensors?.pitch || 0,
        roll: state.sensors?.roll || 0,
        compass: state.sensors?.compass || 0,
        lat: state.telemetry?.gps?.lat || 0,
        lon: state.telemetry?.gps?.lon || 0
      },
      measurement: { ...measurementData },
      calibration: { ...state.calibrationData }
    };

    researchLogBuffer.push(record);
    return record;
  },

  /**
   * Export scientific research dataset as JSON
   */
  exportDatasetJSON() {
    return JSON.stringify(researchLogBuffer, null, 2);
  },

  /**
   * Get all research logs
   */
  getLogs() {
    return [...researchLogBuffer];
  }
};
