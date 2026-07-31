/**
 * PORTA-TLS Scientific Calibration Engine
 * Version 2.1 Architectural Baseline - Task 7 Extension
 */
import { Logger } from '../core/logger.js';

const CALIBRATION_STORAGE_KEY = 'portatls_calibrationData_v2';

export const CalibrationEngine = {
  /**
   * Load stored calibration parameters into application state
   * @param {object} state Global application state
   */
  loadCalibrationData(state) {
    try {
      const saved = localStorage.getItem(CALIBRATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.calibrationData = {
          ...state.calibrationData,
          ...parsed
        };
        // Keep legacy state.calibration in sync for backwards compatibility
        state.calibration.hfov = state.calibrationData.HFOV;
        state.calibration.vfov = state.calibrationData.VFOV;
        state.calibration.cameraHeight = state.calibrationData.cameraHeight;
        Logger.info('Scientific calibration profile loaded from storage.', state.calibrationData);
      }
    } catch (e) {
      Logger.error('Failed to load stored calibration data', e);
    }
  },

  /**
   * Save active state.calibrationData to localStorage
   * @param {object} state Global application state
   */
  saveCalibrationData(state) {
    try {
      state.calibrationData.calibrationDate = new Date().toISOString();
      localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(state.calibrationData));
      
      // Synchronize legacy state.calibration fields
      state.calibration.hfov = state.calibrationData.HFOV;
      state.calibration.vfov = state.calibrationData.VFOV;
      state.calibration.cameraHeight = state.calibrationData.cameraHeight;
      Logger.info('Saved updated calibration data.', state.calibrationData);
    } catch (e) {
      Logger.error('Failed to save calibration data', e);
    }
  },

  /**
   * Interactive FOV Calculation Wizard Math
   * Calculates actual HFOV & VFOV given a known target distance (e.g. 2m) and actual dimensions
   * @param {number} distanceM Distance from phone camera to calibration target object in meters (e.g. 2.0)
   * @param {number} actualWidthM Actual measured target width in meters
   * @param {number} actualHeightM Actual measured target height in meters
   * @returns {object} Calculated HFOV and VFOV in degrees
   */
  calculateProjectionFOV(distanceM, actualWidthM, actualHeightM) {
    if (distanceM <= 0 || actualWidthM <= 0 || actualHeightM <= 0) {
      throw new Error('Distance and dimensions must be positive non-zero numbers');
    }

    // Formula: FOV = 2 * atan(dimension / (2 * distance)) * (180 / PI)
    const hfovRad = 2 * Math.atan(actualWidthM / (2 * distanceM));
    const vfovRad = 2 * Math.atan(actualHeightM / (2 * distanceM));

    const hfovDeg = hfovRad * (180 / Math.PI);
    const vfovDeg = vfovRad * (180 / Math.PI);

    return {
      hfov: parseFloat(hfovDeg.toFixed(2)),
      vfov: parseFloat(vfovDeg.toFixed(2))
    };
  },

  /**
   * Compute Gyroscope/Accelerometer Zeroing Biases from flat surface samples
   * @param {Array<{pitch: number, roll: number, compass: number}>} samples 200 orientation samples
   * @returns {object} Mean pitch, roll, and compass offset biases
   */
  computeZeroBiases(samples) {
    if (!Array.isArray(samples) || samples.length === 0) {
      return { pitchBias: 0.0, rollBias: 0.0, compassBias: 0.0 };
    }

    let sumPitch = 0;
    let sumRoll = 0;
    let sumCompass = 0;

    samples.forEach(s => {
      sumPitch += s.pitch || 0;
      sumRoll += s.roll || 0;
      sumCompass += s.compass || 0;
    });

    const count = samples.length;
    return {
      pitchBias: parseFloat((sumPitch / count).toFixed(3)),
      rollBias: parseFloat((sumRoll / count).toFixed(3)),
      compassBias: parseFloat((sumCompass / count).toFixed(3))
    };
  }
};
