/**
 * PORTA-TLS Binary Tree Segmentation Mask & Monocular Depth Engine
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */

/**
 * Generate an internal 8-bit binary tree segmentation mask (Requirement 10)
 * @param {ImageData} imgData Frame pixel buffer
 * @param {object} trunkBoundaries Extracted trunk left/right contour points
 */
export function generateTreeSegmentationMask(imgData, trunkBoundaries) {
  const w = imgData.width;
  const h = imgData.height;
  const mask = new Uint8Array(w * h);

  if (!trunkBoundaries || !trunkBoundaries.leftContour || trunkBoundaries.leftContour.length === 0) {
    return mask;
  }

  // Create lookup map of row bounds
  const rowLeft = new Array(h).fill(-1);
  const rowRight = new Array(h).fill(-1);

  trunkBoundaries.leftContour.forEach(pt => {
    if (pt.y >= 0 && pt.y < h) rowLeft[pt.y] = pt.x;
  });

  trunkBoundaries.rightContour.forEach(pt => {
    if (pt.y >= 0 && pt.y < h) rowRight[pt.y] = pt.x;
  });

  // Fill foreground mask inside trunk boundaries
  for (let y = 0; y < h; y++) {
    const xl = rowLeft[y];
    const xr = rowRight[y];
    if (xl !== -1 && xr !== -1 && xr > xl) {
      for (let x = xl; x <= xr; x++) {
        mask[y * w + x] = 255;
      }
    }
  }

  return mask;
}

/**
 * Estimate monocular relative depth gradient and foreground separation (Requirement 11)
 * @param {ImageData} imgData Frame pixel buffer
 * @param {Uint8Array} mask Binary segmentation mask
 */
export function estimateRelativeMonocularDepth(imgData, mask) {
  const w = imgData.width;
  const h = imgData.height;
  const depthMap = new Uint8Array(w * h);

  // Assign high depth (foreground, near) to mask pixels, low depth to background
  for (let i = 0; i < w * h; i++) {
    depthMap[i] = mask[i] > 0 ? 200 : 50; // 200 = near foreground, 50 = distant background
  }

  return {
    depthMap,
    foregroundRatio: parseFloat(((mask.filter(v => v > 0).length / (w * h)) * 100).toFixed(1))
  };
}
