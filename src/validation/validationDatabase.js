/**
 * PORTA-TLS Validation Database & Expedition Module
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';

// Persistent localStorage keys
const STORAGE_VAL_KEYS = {
  RECORDS: 'portatls_validation_records',
  EXPEDITION: 'portatls_current_expeditions'
};

/**
 * Initialize validation database state
 */
export function initValidationDatabase(state) {
  state.validation = state.validation || {
    records: [],
    activeExpedition: null,
    validationModeEnabled: false,
    ablation: {
      disableFiltering: false,
      disableSegmentation: false,
      disableConfidence: false,
      disableMultiFrame: false,
      disableCalibration: false
    }
  };

  try {
    const recordsStr = localStorage.getItem(STORAGE_VAL_KEYS.RECORDS);
    state.validation.records = recordsStr ? JSON.parse(recordsStr) : [];
    
    const expStr = localStorage.getItem(STORAGE_VAL_KEYS.EXPEDITION);
    state.validation.activeExpedition = expStr ? JSON.parse(expStr) : null;
    
    Logger.info(`Validation Database loaded: ${state.validation.records.length} records. Active Expedition: ${state.validation.activeExpedition ? 'YES' : 'NO'}`);
  } catch (err) {
    Logger.error('Failed to load validation database from localStorage', err);
    state.validation.records = [];
    state.validation.activeExpedition = null;
  }
}

/**
 * Save records list to localStorage
 */
export function saveValidationDatabase(state) {
  try {
    localStorage.setItem(STORAGE_VAL_KEYS.RECORDS, JSON.stringify(state.validation.records));
    if (state.validation.activeExpedition) {
      localStorage.setItem(STORAGE_VAL_KEYS.EXPEDITION, JSON.stringify(state.validation.activeExpedition));
    } else {
      localStorage.removeItem(STORAGE_VAL_KEYS.EXPEDITION);
    }
  } catch (err) {
    Logger.error('Failed to persist validation database', err);
  }
}

/**
 * Start a new field test expedition
 */
export function startFieldExpedition(state, { projectName, siteName, operatorName, weather }) {
  state.validation.activeExpedition = {
    projectName,
    siteName,
    operatorName,
    weather,
    startTime: new Date().toISOString(),
    endTime: null,
    scanCount: 0
  };
  saveValidationDatabase(state);
  Logger.info(`Expedition started: ${projectName} at ${siteName} by ${operatorName}`);
}

/**
 * End active field expedition
 */
export function endFieldExpedition(state) {
  if (state.validation.activeExpedition) {
    state.validation.activeExpedition.endTime = new Date().toISOString();
    saveValidationDatabase(state);
    Logger.info('Field expedition closed.');
  }
}

/**
 * Classify scan robustness automatically based on quality indexes and alerts
 */
export function classifyScanRobustness(qualityResult, cvResult, finalConfidence) {
  if (!qualityResult || qualityResult.score < 0.40) {
    return { rating: 'INVALID', reasons: ['Frame quality rejected'] };
  }

  const reasons = [];
  const score = qualityResult.score;
  const sharpness = qualityResult.sharpness;
  const contrast = qualityResult.contrast;

  if (sharpness < 4.0) reasons.push('High motion blur');
  if (contrast < 22.0) reasons.push('Low local contrast');
  if (qualityResult.brightness < 50 || qualityResult.brightness > 200) reasons.push('Poor scene illumination');
  if (cvResult && cvResult.segment && cvResult.segment.confidence < 0.65) reasons.push('Low segmentation overlap');

  let rating = 'EXCELLENT';
  if (score < 0.50 || finalConfidence < 0.40) {
    rating = 'POOR';
  } else if (score < 0.65 || finalConfidence < 0.60) {
    rating = 'ACCEPTABLE';
  } else if (score < 0.85 || finalConfidence < 0.80) {
    rating = 'GOOD';
  }

  if (reasons.length > 0 && rating === 'EXCELLENT') {
    rating = 'GOOD'; // demote if warning indicators present
  }

  return {
    rating,
    reasons: reasons.length > 0 ? reasons : ['Optimal scanning parameters']
  };
}

/**
 * Query device hardware signatures
 */
export function getDeviceMetadata() {
  const ua = navigator.userAgent;
  let model = 'Web Browser Viewport';
  let manufacturer = 'Generic';

  if (/iPhone/i.test(ua)) {
    model = 'iPhone';
    manufacturer = 'Apple';
  } else if (/Android/i.test(ua)) {
    model = 'Android Device';
    manufacturer = 'Google/Android';
  } else if (/Macintosh/i.test(ua)) {
    model = 'macOS Desktop';
    manufacturer = 'Apple';
  }

  return {
    manufacturer,
    model,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    osVersion: navigator.platform,
    browser: navigator.appName
  };
}
