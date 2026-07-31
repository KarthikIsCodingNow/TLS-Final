/**
 * PORTA-TLS Automatic Base & Canopy Boundary Detector
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */

/**
 * Automatically locate where the tree trunk meets the ground (Requirement 4)
 * @param {ImageData} imgData Camera frame pixel buffer
 * @param {Array<{x: number, y: number}>} centerLine Extracted trunk centerline
 */
export function detectAutomaticBase(imgData, centerLine) {
  if (!centerLine || centerLine.length === 0) {
    return {
      baseY: Math.floor(imgData.height * 0.90),
      baseConfidence: 0.30,
      isUncertain: true,
      warning: 'Base location uncertain'
    };
  }

  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  // Find lowest point on continuous centerline
  const lowestPt = centerLine[centerLine.length - 1];
  let detectedY = lowestPt.y;

  // Scan downward near lowest point to detect ground texture & color shift
  let colorShiftDetected = false;
  const startX = Math.round(lowestPt.x);

  for (let y = lowestPt.y; y < Math.min(h - 2, lowestPt.y + 40); y += 2) {
    const idx = (y * w + startX) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Detect shift to green grass (G > R and G > B) or light ground soil
    if ((g > r + 15 && g > b + 15) || (r > 180 && g > 170 && b > 140)) {
      detectedY = y;
      colorShiftDetected = true;
      break;
    }
  }

  const baseFraction = detectedY / h;
  let baseConfidence = colorShiftDetected ? 0.85 : 0.50;
  if (baseFraction > 0.95) baseConfidence -= 0.20;

  const isUncertain = baseConfidence < 0.40;
  const warning = isUncertain ? 'Base location uncertain' : null;

  return {
    baseY: detectedY,
    baseConfidence: parseFloat(baseConfidence.toFixed(2)),
    isUncertain,
    warning
  };
}

/**
 * Automatically locate highest canopy point belonging to target tree (Requirement 5)
 * @param {ImageData} imgData Camera frame pixel buffer
 * @param {Array<{x: number, y: number}>} centerLine Extracted trunk centerline
 */
export function detectAutomaticCanopy(imgData, centerLine) {
  if (!centerLine || centerLine.length === 0) {
    return {
      topY: Math.floor(imgData.height * 0.10),
      canopyConfidence: 0.30
    };
  }

  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  // Highest point on continuous centerline
  const highestPt = centerLine[0];
  let topY = highestPt.y;
  const startX = Math.round(highestPt.x);

  // Scan upward from highest trunk point to find canopy apex (foliage connected component)
  for (let y = highestPt.y; y > Math.max(2, highestPt.y - 60); y -= 2) {
    const idx = (y * w + startX) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Detect sky (high B and R, G bright blue/white)
    if (b > 180 && r > 160 && g > 170) {
      topY = y + 2;
      break;
    }
  }

  const topFraction = topY / h;
  let canopyConfidence = 0.80;
  if (topFraction < 0.05) canopyConfidence = 0.50; // Cropped top

  return {
    topY,
    canopyConfidence: parseFloat(canopyConfidence.toFixed(2))
  };
}
