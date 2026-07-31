/**
 * PORTA-TLS Self-Calibrating Camera & Local Learning Database
 * Version 1.0.0 (Patent Pending)
 * Computational Complexity: O(1) database read/update cycles
 */
import { INVENTION_CONFIG } from './inventionConfig.js';
import { Logger } from '../core/logger.js';

const STORAGE_KEY = 'portatls_learning_database';

export const CALIB_LEARN_INFO = {
  version: '1.0.0',
  description: 'Self-Calibrating Camera Model via Validation Feedback Loop',
  assumptions: [
    'User ground truth values are precise and validated.',
    'Systematic focal length biases remain consistent across typical battery temperatures.'
  ],
  failureCases: [
    'Highly erroneous manual tape measurements entered as Ground Truth (contaminating learning bounds).',
    'Camera swap or modular lens accessory changes without clearing learning history.'
  ]
};

// Initial state of calibration learning database
let learningDb = {
  samplesCount: 0,
  methodAccuracies: {
    clinometer: [],
    reference: [],
    manual: [],
    ai: [],
    segmentation: [],
    pointcloud: []
  },
  biases: {
    height: 0.0, // running average height error percentage
    dbh: 0.0     // running average DBH error percentage
  }
};

/**
 * Load learning database from localstorage
 */
export function initLearningDatabase() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      learningDb = JSON.parse(data);
      Logger.info(`Learning database loaded: ${learningDb.samplesCount} historical validations logged.`);
    }
  } catch (err) {
    Logger.error('Failed to parse learning database', err);
  }
}

/**
 * Learn calibration corrections using validation ground truth
 * @param {object} record Validation record containing ground truth and application values
 */
export function learnFromValidationRecord(state, record) {
  const cfg = INVENTION_CONFIG.selfCalibration;
  
  if (!record.groundTruth || record.groundTruth.height === 0 || record.groundTruth.dbh === 0) return;

  const hErrPct = ((record.application.height - record.groundTruth.height) / record.groundTruth.height) * 100.0;
  const dErrPct = ((record.application.dbh - record.groundTruth.dbh) / record.groundTruth.dbh) * 100.0;

  learningDb.samplesCount++;

  // Update overall bias running totals
  const alpha = cfg.learningRate;
  learningDb.biases.height = (1 - alpha) * learningDb.biases.height + alpha * hErrPct;
  learningDb.biases.dbh = (1 - alpha) * learningDb.biases.dbh + alpha * dErrPct;

  // Log method accuracies based on active scanner modes
  const activeMethod = record.expedition?.projectName ? 'ai' : 'clinometer';
  if (learningDb.methodAccuracies[activeMethod]) {
    learningDb.methodAccuracies[activeMethod].push(Math.abs(hErrPct));
    if (learningDb.methodAccuracies[activeMethod].length > 30) {
      learningDb.methodAccuracies[activeMethod].shift();
    }
  }

  // Auto adjusting optical calibration constants (HFOV / VFOV)
  if (learningDb.samplesCount >= cfg.minSamplesToLearn) {
    // If DBH is consistently overestimated, reduce HFOV scale
    const hfovBiasRad = (learningDb.biases.dbh / 100.0);
    const vfovBiasRad = (learningDb.biases.height / 100.0);
    
    // Bounds clamping to prevent unstable adjustments
    const maxAdjust = cfg.maxBiasCorrectionPercent;
    const hfovAdjust = Math.max(-maxAdjust, Math.min(maxAdjust, state.calibration.hfov * hfovBiasRad * 0.25));
    const vfovAdjust = Math.max(-maxAdjust, Math.min(maxAdjust, state.calibration.vfov * vfovBiasRad * 0.25));

    state.calibration.hfov = parseFloat((state.calibration.hfov - hfovAdjust).toFixed(3));
    state.calibration.vfov = parseFloat((state.calibration.vfov - vfovAdjust).toFixed(3));

    Logger.info(`Self-Calibration Adjustment Applied: HFOV corrected to ${state.calibration.hfov}°, VFOV to ${state.calibration.vfov}°`);
  }

  // Persist learning db
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learningDb));
  } catch (e) {
    Logger.error('Failed to save learning database', e);
  }
}

/**
 * Returns a weight multiplier (0.5 to 1.5) based on historical accuracy
 */
export function getCalibrationCorrectionFactor(methodName) {
  const accuracies = learningDb.methodAccuracies[methodName] || [];
  if (accuracies.length === 0) return 1.0; // default weight

  const avgAbsErr = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  
  // High errors yield lower correction scores, down-weighting the estimator in the future
  if (avgAbsErr > 10.0) return 0.65;
  if (avgAbsErr > 5.0) return 0.85;
  if (avgAbsErr > 2.0) return 1.15;
  
  return 1.45; // high precision estimator booster
}

export function getLearningSummary() {
  return {
    samples: learningDb.samplesCount,
    heightBiasPercent: parseFloat(learningDb.biases.height.toFixed(2)),
    dbhBiasPercent: parseFloat(learningDb.biases.dbh.toFixed(2))
  };
}
