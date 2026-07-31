/**
 * PORTA-TLS Camera Calibration Engine
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';
import { ErrorHandler } from '../core/errors.js';

const CALIB_STORAGE_KEY = 'porta_tls_camera_calib';

/**
 * Calculate HFOV and VFOV in degrees based on physical camera metrics
 * @param {number} sensorWidth Sensor width in mm
 * @param {number} sensorHeight Sensor height in mm
 * @param {number} focalLength Focal length in mm
 * @returns {object} { hfov, vfov } in degrees
 */
export function computeFovFromSensor(sensorWidth, sensorHeight, focalLength) {
  if (!sensorWidth || !sensorHeight || !focalLength) {
    throw new Error('Sensor width, height, and focal length must be positive numbers');
  }
  const hfov = 2 * Math.atan(sensorWidth / (2 * focalLength)) * (180 / Math.PI);
  const vfov = 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI);
  
  Logger.info(`Calculated HFOV: ${hfov.toFixed(2)}°, VFOV: ${vfov.toFixed(2)}° from optics metrics`);
  return { hfov, vfov };
}

/**
 * Load persisted calibration profile from localStorage
 * @param {object} stateObject Global state reference
 */
export function loadCalibrationProfile(stateObject) {
  Logger.info('Attempting to load calibration profile');
  try {
    const raw = localStorage.getItem(CALIB_STORAGE_KEY);
    if (raw) {
      const profile = JSON.parse(raw);
      stateObject.calibration.hfov = profile.hfov;
      stateObject.calibration.vfov = profile.vfov;
      stateObject.calibration.sensorWidth = profile.sensorWidth;
      stateObject.calibration.sensorHeight = profile.sensorHeight;
      stateObject.calibration.focalLength = profile.focalLength;
      stateObject.calibration.cameraHeight = profile.cameraHeight;
      Logger.info('Loaded calibration profile successfully');
    }
  } catch (err) {
    ErrorHandler.handle(err, 'calibration');
  }
}

/**
 * Persist active calibration parameters to localStorage
 * @param {object} stateObject Global state reference
 * @param {object} profile The calibration values to save
 */
export function saveCalibrationProfile(stateObject, profile) {
  Logger.info('Saving camera calibration profile');
  try {
    stateObject.calibration.hfov = parseFloat(profile.hfov);
    stateObject.calibration.vfov = parseFloat(profile.vfov);
    stateObject.calibration.sensorWidth = parseFloat(profile.sensorWidth);
    stateObject.calibration.sensorHeight = parseFloat(profile.sensorHeight);
    stateObject.calibration.focalLength = parseFloat(profile.focalLength);
    stateObject.calibration.cameraHeight = parseFloat(profile.cameraHeight);

    localStorage.setItem(CALIB_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    ErrorHandler.handle(err, 'calibration');
    throw err;
  }
}

/**
 * Extract focal length from image file metadata if available
 * @param {File} file Uploaded image file
 * @returns {Promise<number|null>} Resolved focal length if extracted
 */
export async function autoReadMetadataFocalLength(file) {
  Logger.info(`Scanning file metadata for Exif tags: ${file.name}`);
  // Exif reading is browser-dependent, return null for manual override fallbacks
  return null;
}
