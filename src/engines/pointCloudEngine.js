/**
 * PORTA-TLS 3D LiDAR Point Cloud Projection Engine
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Generate simulated point cloud points representing a tree
 * @param {number} height 
 * @param {number} dbh Trunk diameter in cm
 * @returns {object[]} Array of point objects { x, y, z, type }
 */
export function generateSimulatedLidarPoints(height, dbh) {
  Logger.debug(`Generating simulated LiDAR points for Height: ${height}m, DBH: ${dbh}cm`);
  const points = [];
  const rTrunk = dbh / 200; // in meters radius
  const trunkH = height * CONFIG.lidar.trunkRatio;
  const pointQty = CONFIG.lidar.simulationQty;

  const trunkQty = Math.round(pointQty * CONFIG.lidar.trunkRatio);
  for (let i = 0; i < trunkQty; i++) {
    const py = Math.random() * trunkH;
    const angle = Math.random() * Math.PI * 2;
    const px = Math.cos(angle) * rTrunk;
    const pz = Math.sin(angle) * rTrunk;
    points.push({ x: px, y: py, z: pz, type: 'trunk' });
  }

  const canopyQty = Math.round(pointQty * CONFIG.lidar.foliageRatio);
  const canopyH = height - trunkH;
  const maxR = height * 0.22; // canopy width factor
  for (let i = 0; i < canopyQty; i++) {
    const yFract = Math.random();
    const py = trunkH + (yFract * canopyH);
    const rCanopy = (1 - yFract) * maxR;
    const angle = Math.random() * Math.PI * 2;
    const px = Math.cos(angle) * rCanopy;
    const pz = Math.sin(angle) * rCanopy;
    points.push({ x: px, y: py, z: pz, type: 'foliage' });
  }

  return points;
}

/**
 * Perform 3D rotation, scaling, camera depth-sorting, and projection onto a 2D Canvas context
 */
export function projectAndRenderLidar({
  canvas,
  ctx,
  points,
  rotationAngle,
  renderScale = CONFIG.lidar.renderScale,
  cameraDistance = CONFIG.lidar.cameraDistance,
  projectionFov = CONFIG.lidar.projectionFov
}) {
  const w = canvas.width;
  const h = canvas.height;

  // Clear Canvas with absolute black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Draw grid background
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 20; i < w; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
  }
  for (let i = 20; i < h; i += 20) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
  }

  if (!points || points.length === 0) return;

  const sinA = Math.sin(rotationAngle);
  const cosA = Math.cos(rotationAngle);
  const cx = w / 2;
  const cy = h - 40;

  // Rotate and project points
  const projected = points.map(pt => {
    // 3D rotation about the Y axis
    const rotX = pt.x * cosA - pt.z * sinA;
    const rotZ = pt.x * sinA + pt.z * cosA;
    
    const sx = rotX * renderScale;
    const sy = pt.y * renderScale;
    const sz = rotZ * renderScale;

    // Perspective projection depth scaling
    const zDepth = sz + (cameraDistance * renderScale);
    const px = cx + (sx * projectionFov) / zDepth;
    const py = cy - (sy * projectionFov) / zDepth;

    return { x: px, y: py, z: zDepth, type: pt.type };
  });

  // Sort by depth (painters algorithm) to render back points first
  projected.sort((a, b) => b.z - a.z);

  // Draw points
  projected.forEach(pt => {
    if (pt.y < 0 || pt.y > h || pt.x < 0 || pt.x > w) return;
    const size = Math.max(1, 90 / pt.z);

    if (pt.type === 'trunk') {
      ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.3, 200 / pt.z)})`;
    }

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}
