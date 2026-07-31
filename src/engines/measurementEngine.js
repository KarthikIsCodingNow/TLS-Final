/**
 * PORTA-TLS Mathematical Measurement Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Perform clinometer mode calculations
 */
export function calculateClinometerHeight({
  baseAngle,
  topAngle,
  pitch,
  cameraHeight,
  useOverrideDistance,
  overrideDistance
}) {
  const baseRad = (baseAngle || 0) * (Math.PI / 180);
  const topRad = (topAngle || 0) * (Math.PI / 180);
  const camH = cameraHeight;
  let distance = CONFIG.camera.defaultOverrideDistance;

  if (useOverrideDistance) {
    distance = overrideDistance;
  } else if (baseAngle !== null && baseAngle < 0) {
    distance = camH / Math.tan(Math.abs(baseRad));
  }

  let height = 0.0;
  if (baseAngle !== null && topAngle !== null) {
    height = distance * (Math.tan(topRad) - Math.tan(baseRad));
  } else if (baseAngle !== null) {
    const liveTopRad = pitch * (Math.PI / 180);
    height = distance * (Math.tan(liveTopRad) - Math.tan(baseRad));
  } else if (useOverrideDistance) {
    // Live estimation relative to horizontal plane if base angle is not locked yet
    const liveTopRad = pitch * (Math.PI / 180);
    height = distance * Math.tan(liveTopRad);
  }

  height = Math.max(0.1, height);
  return { distance, height };
}

/**
 * Perform manual distance based height calculations
 */
export function calculateManualDistanceHeight(manualDistance, topPercent, basePercent, vfovDeg = CONFIG.camera.vfovDeg) {
  const vfov = vfovDeg * (Math.PI / 180);
  const frameH = 2 * manualDistance * Math.tan(vfov / 2);
  const spanFraction = (basePercent - topPercent) / 100;
  const height = Math.max(0.1, frameH * spanFraction);
  return { distance: manualDistance, height };
}

/**
 * Perform reference marker size based height calculations
 */
export function calculateReferenceHeight(referenceSizeCm, topPercent, basePercent) {
  let height = 0.1;
  const span = Math.abs(basePercent - topPercent);
  if (span > 1) {
    const scale = (referenceSizeCm / 100) / span;
    height = Math.max(0.1, 100 * scale);
  }
  return { height };
}

/**
 * Calculate trunk diameter at breast height (DBH) in centimeters
 */
export function calculateTrunkDbh(distance, leftPercent, rightPercent, hfovDeg = CONFIG.camera.hfovDeg) {
  const hfov = hfovDeg * (Math.PI / 180);
  const frameW = 2 * distance * Math.tan(hfov / 2);
  const spanW = (rightPercent - leftPercent) / 100;
  const dbh = Math.max(1.0, (frameW * spanW) * 100);
  return dbh;
}

/**
 * Calculate Above Ground Biomass (AGB) and Carbon equivalent sequestration
 */
export function calculateBiomassAndCarbon(height, dbh, density) {
  // AGB (Above Ground Dry Biomass) allometric model
  const agb = 0.0673 * Math.pow((density * Math.pow(dbh, 2) * height), 0.976);
  // Carbon is roughly 50% of dry biomass, and CO2 offset is C * 3.67
  const co2 = agb * 0.5 * 3.67;
  return { agb, co2 };
}

/**
 * Parse PLY ASCII point cloud format
 */
export function parsePlyASCII(text) {
  Logger.info('Parsing ASCII PLY point cloud data');
  const lines = text.split('\n');
  let insideHeader = true;
  const points = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (insideHeader) {
      if (line === 'end_header') {
        insideHeader = false;
      }
      continue;
    }
    
    const parts = line.split(/\s+/);
    if (parts.length >= 3) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        points.push({ x, y, z });
      }
    }
  }
  Logger.info(`Parsed ${points.length} points from PLY`);
  return points;
}

/**
 * Parse XYZ, TXT, or CSV point cloud format
 */
export function parseXyzTxtCsv(text) {
  Logger.info('Parsing XYZ/TXT/CSV point cloud data');
  const lines = text.split('\n');
  const points = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    
    const delimiter = line.includes(',') ? ',' : /\s+/;
    const parts = line.split(delimiter);
    if (parts.length >= 3) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        points.push({ x, y, z });
      }
    }
  }
  Logger.info(`Parsed ${points.length} points from XYZ`);
  return points;
}

/**
 * Downsample and normalize point clouds, estimate height, and run DBH slice calculation
 */
export function processLidarPoints(rawPoints) {
  Logger.info(`Processing ${rawPoints.length} LiDAR coordinates`);
  let points = rawPoints;
  
  const maxPoints = CONFIG.lidar.maxPoints;
  if (points.length > maxPoints) {
    const step = Math.ceil(points.length / maxPoints);
    const downsampled = [];
    for (let i = 0; i < points.length; i += step) {
      downsampled.push(points[i]);
    }
    points = downsampled;
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const pt of points) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
    if (pt.z < minZ) minZ = pt.z;
    if (pt.z > maxZ) maxZ = pt.z;
  }
  
  const widthX = maxX - minX;
  const heightY = maxY - minY;
  const depthZ = maxZ - minZ;
  
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const centerYShift = minY;
  
  const defaultScanH = CONFIG.lidar.defaultScanHeight;
  const scaleToRender = heightY > 0 ? (defaultScanH / heightY) : 1;
  
  const normalizedPoints = points.map(pt => {
    const nx = (pt.x - centerX) * scaleToRender;
    const ny = (pt.y - centerYShift) * scaleToRender;
    const nz = (pt.z - centerZ) * scaleToRender;
    // Classification of point type
    const type = ny < (defaultScanH * CONFIG.lidar.trunkRatio) ? 'trunk' : 'foliage';
    return { x: nx, y: ny, z: nz, type };
  });
  
  // Calculate DBH at breast height (1.15m - 1.45m)
  const breastHeightSlice = points.filter(pt => {
    const relativeY = pt.y - centerYShift;
    return relativeY >= CONFIG.lidar.breastHeightMin && relativeY <= CONFIG.lidar.breastHeightMax;
  });
  
  let dbhCm = 20.0;
  if (breastHeightSlice.length > 0) {
    let sliceMinX = Infinity, sliceMaxX = -Infinity;
    let sliceMinZ = Infinity, sliceMaxZ = -Infinity;
    for (const pt of breastHeightSlice) {
      if (pt.x < sliceMinX) sliceMinX = pt.x;
      if (pt.x > sliceMaxX) sliceMaxX = pt.x;
      if (pt.z < sliceMinZ) sliceMinZ = pt.z;
      if (pt.z > sliceMaxZ) sliceMaxZ = pt.z;
    }
    const sliceWidthX = sliceMaxX - sliceMinX;
    const sliceWidthZ = sliceMaxZ - sliceMinZ;
    const estimatedDiameterMeters = (sliceWidthX + sliceWidthZ) / 2;
    dbhCm = Math.max(2.0, estimatedDiameterMeters * 100);
  } else {
    dbhCm = Math.max(2.0, ((widthX + depthZ) / 4) * 100);
  }
  
  return {
    normalizedPoints,
    height: heightY,
    dbh: dbhCm
  };
}
