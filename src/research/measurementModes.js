/**
 * PORTA-TLS Operating Measurement Modes & Processing Configurations
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export const MEASUREMENT_MODES = {
  'fast': {
    id: 'fast',
    name: 'Fast Mode',
    framesToAverage: 1,
    confidenceThreshold: 60,
    targetFps: 30,
    logRawTelemetry: false,
    description: 'Single-frame rapid reconnaissance scanning'
  },
  'balanced': {
    id: 'balanced',
    name: 'Balanced Mode',
    framesToAverage: 3,
    confidenceThreshold: 75,
    targetFps: 15,
    logRawTelemetry: false,
    description: '3-frame moving average field inventory'
  },
  'high_accuracy': {
    id: 'high_accuracy',
    name: 'High Accuracy Mode',
    framesToAverage: 5,
    confidenceThreshold: 85,
    targetFps: 10,
    logRawTelemetry: true,
    description: '5-frame precision measurement with 2σ outlier rejection'
  },
  'research': {
    id: 'research',
    name: 'Research Mode',
    framesToAverage: 10,
    confidenceThreshold: 90,
    targetFps: 5,
    logRawTelemetry: true,
    description: '10-frame scientific publication & patent dataset logging'
  }
};

export function getMeasurementModeConfig(modeId = 'balanced') {
  return MEASUREMENT_MODES[modeId] || MEASUREMENT_MODES['balanced'];
}
