/**
 * PORTA-TLS Measurement Explainability & Patent Mode Step Logger
 * Version 1.0.0 (Patent Pending)
 * Computational Complexity: O(N) where N is the number of logged parameters
 */
import { INVENTION_CONFIG } from './inventionConfig.js';
import { Logger } from '../core/logger.js';

export const EXPLAIN_ALGO_INFO = {
  version: '1.0.0',
  description: 'Traceable Explainability Engine & Patent Run Logger',
  assumptions: [
    'Decisions can be decomposed into linear contribution weights.',
    'Patent run history can fit in standard local storage budgets.'
  ],
  failureCases: [
    'Complex nested fusion layers yielding non-linear contributions, which are simplified in explanation strings.'
  ]
};

/**
 * Generates human-readable explainability logs for a fused measurement run
 * @returns {object} { summaryText, mainUncertainty }
 */
export function generateMeasurementExplanation(heightContributions, tcsResult, mriScore) {
  if (!heightContributions || heightContributions.length === 0) {
    return {
      summaryText: 'Measurement computed via baseline manual overrides.',
      mainUncertainty: 'Direct clinometer orientation sensors offline.'
    };
  }

  // Format contributions string
  const traceStr = heightContributions.map(c => `${c.weightPercent}% ${c.method.toUpperCase()}`).join(', ');
  const summaryText = `Final Height resolved via optimization: ${traceStr}. Overall Reliability Score (MRI): ${mriScore}/100.`;

  // Find main uncertainty driver
  let mainUncertainty = 'Nominal scanning limits; stable edge contours resolved.';
  if (tcsResult && tcsResult.visibilityPercent < 80) {
    mainUncertainty = `Severe target occlusion: ${tcsResult.impact}`;
  } else if (mriScore < 70) {
    mainUncertainty = 'Elevated hand shake jitter or motion blur warning.';
  }

  return {
    summaryText,
    mainUncertainty
  };
}

/**
 * Log all internal mathematical steps if Patent Mode is enabled
 */
export function logPatentStep(state, inputs, weights, outputs) {
  if (!INVENTION_CONFIG.patentMode.enabled) return;

  const runRecord = {
    timestamp: new Date().toISOString(),
    version: '2.0.0-Baseline',
    inputs: { ...inputs },
    intermediateVars: {
      calibration: { ...state.calibration },
      filteredPitch: state.sensors.filteredPitch,
      tcs: state.diagnostics.tcs
    },
    weights: [...weights],
    outputs: { ...outputs }
  };

  try {
    const rawLogs = localStorage.getItem(INVENTION_CONFIG.patentMode.storageKey);
    const logs = rawLogs ? JSON.parse(rawLogs) : [];
    
    logs.push(runRecord);
    // Limit cache size to prevent localstorage bloat
    if (logs.length > 50) logs.shift();

    localStorage.setItem(INVENTION_CONFIG.patentMode.storageKey, JSON.stringify(logs));
    Logger.info(`Patent Mode scan trace appended. Log count: ${logs.length}`);
  } catch (err) {
    Logger.error('Failed to log Patent Mode step data', err);
  }
}

/**
 * Retrieve patent mode logs list
 */
export function getPatentLogs() {
  try {
    const raw = localStorage.getItem(INVENTION_CONFIG.patentMode.storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
