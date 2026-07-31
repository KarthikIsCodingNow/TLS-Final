/**
 * PORTA-TLS Automatic Base & Top Detection
 * Version 2.0 Architectural Baseline
 */

/**
 * Estimate ground level base boundary using root flare expansion metrics
 * @param {ImageData} imgData Frame image data
 * @param {object[]} contour {y, leftX, rightX}[]
 * @returns {object} { baseY: number, confidence: number }
 */
export function detectTrunkBase(imgData, contour) {
  if (!contour || contour.length < 10) {
    return { baseY: imgData.height - 10, confidence: 0.1 };
  }

  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  // Track widths from bottom up
  const n = contour.length;
  let flareY = contour[n - 1].y;
  let flareFound = false;

  // Analyze the bottom section of the trunk contour (last 40% of rows)
  const startIndex = Math.floor(n * 0.6);
  
  for (let i = startIndex; i < n - 3; i++) {
    const widthCur = contour[i].rightX - contour[i].leftX;
    const widthNext = contour[i + 3].rightX - contour[i + 3].leftX;
    
    // Width gradient: rate of trunk width expansion going downwards
    const dW = widthNext - widthCur;
    
    // Root flare typically expands by >20% within a small vertical range
    if (dW > widthCur * 0.18) {
      flareY = contour[i].y;
      flareFound = true;
      break;
    }
  }

  // Verify color shift to soil/grass around base
  const testY = Math.min(h - 1, flareY + 5);
  const midX = Math.floor((contour[n-1].leftX + contour[n-1].rightX) / 2);
  const idx = (testY * w + midX) * 4;
  
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  
  const isSoilOrGrass = (g > r && g > b) || (r > g && g > b && r > 40);
  const confidence = flareFound ? (isSoilOrGrass ? 0.90 : 0.70) : 0.40;

  return {
    baseY: flareY,
    confidence: parseFloat(confidence.toFixed(2))
  };
}

/**
 * Estimate highest visible point of the trunk before canopy branches/foliage
 * @param {ImageData} imgData Frame image data
 * @param {object[]} contour {y, leftX, rightX}[]
 * @returns {object} { topY: number, confidence: number, isOccluded: boolean }
 */
export function detectTrunkTop(imgData, contour) {
  if (!contour || contour.length < 10) {
    return { topY: 10, confidence: 0.1, isOccluded: false };
  }

  const w = imgData.width;
  const data = imgData.data;

  // Scan from middle upwards
  let canopyY = contour[0].y;
  let occlusionCount = 0;
  const sampleCount = Math.floor(contour.length * 0.3);

  for (let i = 0; i < sampleCount; i++) {
    const pt = contour[i];
    const midX = Math.floor((pt.leftX + pt.rightX) / 2);
    
    // Sample a horizontal strip across the trunk for leaves
    let greenPixels = 0;
    const span = pt.rightX - pt.leftX;
    
    for (let x = pt.leftX; x <= pt.rightX; x += 2) {
      const idx = (pt.y * w + x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      if (g > r * 1.08 && g > b * 1.08) {
        greenPixels++;
      }
    }

    const ratio = greenPixels / (span / 2);
    if (ratio > 0.45) {
      occlusionCount++;
    }

    // Trunk width vanishes or goes below threshold (narrow branches)
    if (span < 4) {
      canopyY = pt.y;
      break;
    }
  }

  const isOccluded = occlusionCount > 2;
  const confidence = isOccluded ? 0.50 : 0.85;

  return {
    topY: canopyY,
    confidence: parseFloat(confidence.toFixed(2)),
    isOccluded
  };
}
