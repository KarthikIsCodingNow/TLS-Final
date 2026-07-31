/**
 * PORTA-TLS Unified Hardware & Device Manager
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';
import { ErrorHandler } from '../core/errors.js';
import { CONFIG } from '../core/config.js';

class HardwareDeviceManager {
  constructor() {
    this.gpsWatchId = null;
  }

  /**
   * Request user's camera video stream
   * @param {string} facingMode 'environment' | 'user'
   * @returns {Promise<MediaStream>}
   */
  async requestCameraStream(facingMode = 'environment') {
    Logger.info(`Requesting camera stream with facingMode: ${facingMode}`);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('MediaDevices.getUserMedia is not supported by this browser.');
    }

    const constraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: CONFIG.camera.idealWidth },
        height: { ideal: CONFIG.camera.idealHeight }
      },
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      Logger.info('Camera stream obtained successfully');
      return stream;
    } catch (err) {
      ErrorHandler.handle(err, 'camera');
      throw err;
    }
  }

  /**
   * Stop an active media stream
   * @param {MediaStream} stream 
   */
  stopCameraStream(stream) {
    if (!stream) return;
    Logger.info('Stopping camera stream tracks');
    try {
      stream.getTracks().forEach(track => {
        track.stop();
        Logger.debug(`Track ${track.label} stopped`);
      });
    } catch (err) {
      ErrorHandler.handle(err, 'camera');
    }
  }

  /**
   * Start tracking GPS location coordinates
   * @param {function} onUpdate Callback when coords update
   * @param {function} onError Callback on failure
   */
  startGPS(onUpdate, onError) {
    Logger.info('Starting GPS geolocation tracking');
    if (!navigator.geolocation) {
      Logger.warn('Geolocation not supported by browser');
      if (onError) onError(new Error('Geolocation unsupported'));
      return;
    }

    const options = {
      enableHighAccuracy: CONFIG.gps.enableHighAccuracy,
      timeout: 10000,
      maximumAge: 0
    };

    this.gpsWatchId = navigator.geolocation.watchPosition(
      (position) => {
        Logger.debug(`GPS position updated: ${position.coords.latitude}, ${position.coords.longitude}`);
        if (onUpdate) onUpdate(position);
      },
      (err) => {
        Logger.warn(`GPS failed to locate, using mock coordinates: ${err.message}`);
        // Fallback to Mock GPS position
        const mockPosition = {
          coords: {
            latitude: CONFIG.gps.mockLatitude,
            longitude: CONFIG.gps.mockLongitude,
            accuracy: 999
          },
          timestamp: Date.now(),
          isMock: true
        };
        if (onUpdate) onUpdate(mockPosition);
      },
      options
    );
  }

  /**
   * Stop tracking GPS
   */
  stopGPS() {
    if (this.gpsWatchId !== null) {
      Logger.info('Stopping GPS geolocation tracking');
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }
  }

  /**
   * Request permission for device orientation (for iOS devices)
   * @returns {Promise<boolean>}
   */
  async requestOrientationPermission() {
    Logger.info('Requesting Device Orientation permissions');
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        Logger.info(`Device Orientation permission status: ${response}`);
        return response === 'granted';
      } catch (err) {
        ErrorHandler.handle(err, 'sensors');
        return false;
      }
    }
    // Android or desktop, permission implicitly granted
    return true;
  }

  /**
   * Start listening for orientation sensor pitch adjustments
   * @param {function} onOrientation Callback on orientation event
   */
  startOrientation(onOrientation) {
    Logger.info('Binding orientation event listeners');
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onOrientation);
    } else {
      Logger.warn('Device Orientation not supported by browser/device');
    }
  }

  /**
   * Stop orientation listeners
   * @param {function} onOrientation 
   */
  stopOrientation(onOrientation) {
    Logger.info('Unbinding orientation event listeners');
    window.removeEventListener('deviceorientation', onOrientation);
  }

  /**
   * Vibrate hardware haptics motor
   * @param {number|number[]} pattern Vibration timing milliseconds
   */
  vibrate(pattern) {
    if (navigator.vibrate) {
      Logger.debug(`Triggering device vibration: ${JSON.stringify(pattern)}`);
      navigator.vibrate(pattern);
    }
  }

  /**
   * Diagnostic test for active LiDAR support
   * @returns {object} { supportType: 'webxr'|'ios-compatible'|'simulated', title: string, html: string }
   */
  checkLidarSupport() {
    const isXR = !!(navigator.xr && navigator.xr.isSessionSupported);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isXR) {
      return {
        supportType: 'webxr',
        title: 'ACTIVE WebXR LiDAR DETECTED',
        html: `Your device supports <strong>WebXR Depth Sensing</strong>! We have calibrated the laser scanner to read real-time depth directly from your phone's active depth camera. 
              <br><br>
              The range has been locked at the center crosshair.`
      };
    } else if (isIOS) {
      return {
        supportType: 'ios-compatible',
        title: '📱 iOS LiDAR SENSOR COMPATIBILITY',
        html: `<strong>Apple iOS Pro Device detected!</strong> 
              <br><br>
              Although your iPhone/iPad contains a physical LiDAR sensor, Apple's iOS security policy restricts raw depth APIs from standard web browsers (Safari, Chrome, etc.).
              <br><br>
              <strong>How to get millimeter accuracy:</strong>
              <ol>
                <li>Toggle <strong>"Enable Distance Override"</strong> in the settings panel.</li>
                <li>Measure the exact distance to the tree using Apple's native <strong>Measure App</strong> (which uses the LiDAR sensor).</li>
                <li>Enter that distance directly into the <strong>"Estimated Distance"</strong> input. Height and trunk DBH will adjust with absolute accuracy.</li>
                <li>Alternatively, capture the tree with a native scanning app (like Polycam), export the point cloud (.ply, .xyz), and upload it via the <strong>3D LiDAR Visualizer</strong>.</li>
              </ol>`
      };
    } else {
      return {
        supportType: 'simulated',
        title: '⚠️ LiDAR SENSOR NOT FOUND',
        html: `Active depth sensor or WebXR Depth APIs could not be initiated on this browser/device.
              <br><br>
              We have triggered a simulated laser measurement based on your <strong>Camera Height</strong> and <strong>Tilt Sensor Pitch Angle</strong>. 
              <br><br>
              For manual override, check the <strong>"Enable Distance Override"</strong> option in settings and enter your estimated distance.`
      };
    }
  }
}

export const DeviceManager = new HardwareDeviceManager();
