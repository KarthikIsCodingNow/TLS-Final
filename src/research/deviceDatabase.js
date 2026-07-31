/**
 * PORTA-TLS Hardware Device Calibration Presets Database
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export const DEVICE_PRESETS = {
  'iphone_15_pro': {
    name: 'Apple iPhone 14/15/16 Pro',
    hfov: 65.4,
    vfov: 50.3,
    sensorAccuracyDeg: 0.05,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    lensType: 'Wide Prime (24mm equiv)',
    fx: 1450,
    fy: 1450,
    hasLidar: true
  },
  'pixel_8_pro': {
    name: 'Google Pixel 7/8/9 Pro',
    hfov: 66.8,
    vfov: 51.8,
    sensorAccuracyDeg: 0.06,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    lensType: 'Wide Prime (25mm equiv)',
    fx: 1420,
    fy: 1420,
    hasLidar: false
  },
  'galaxy_s24': {
    name: 'Samsung Galaxy S23/S24 Ultra',
    hfov: 64.8,
    vfov: 49.8,
    sensorAccuracyDeg: 0.05,
    resolution: '1920x1080',
    aspectRatio: '16:9',
    lensType: 'Wide Prime (24mm equiv)',
    fx: 1465,
    fy: 1465,
    hasLidar: false
  },
  'ipad_pro_lidar': {
    name: 'Apple iPad Pro LiDAR',
    hfov: 62.0,
    vfov: 47.5,
    sensorAccuracyDeg: 0.04,
    resolution: '1920x1440',
    aspectRatio: '4:3',
    lensType: 'Wide Prime + Active ToF LiDAR',
    fx: 1510,
    fy: 1510,
    hasLidar: true
  },
  'standard_mobile': {
    name: 'Standard Mobile Camera (Generic)',
    hfov: 60.0,
    vfov: 45.0,
    sensorAccuracyDeg: 0.10,
    resolution: '1280x720',
    aspectRatio: '16:9',
    lensType: 'Standard Mobile Lens',
    fx: 1380,
    fy: 1380,
    hasLidar: false
  }
};

/**
 * Detect hardware user agent and return preset profile
 */
export function detectDevicePreset() {
  const ua = navigator.userAgent || '';
  if (/iPhone/i.test(ua)) return DEVICE_PRESETS['iphone_15_pro'];
  if (/iPad/i.test(ua)) return DEVICE_PRESETS['ipad_pro_lidar'];
  if (/Android.*Pixel/i.test(ua)) return DEVICE_PRESETS['pixel_8_pro'];
  if (/Android.*Samsung/i.test(ua)) return DEVICE_PRESETS['galaxy_s24'];
  return DEVICE_PRESETS['standard_mobile'];
}
