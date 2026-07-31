/**
 * PORTA-TLS Shadow Filtering & Trunk Occlusion Continuation Engine
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */

/**
 * Filter strong directional shadows from edge map to prevent false trunk boundaries (Requirement 12)
 * @param {ImageData} imgData Camera frame pixel buffer
 * @param {Uint8Array} edgeMap Binary edge map
 */
export function filterTrunkShadows(imgData, edgeMap) {
  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  for (let i = 0; i < w * h; i++) {
    if (edgeMap[i] === 255) {
      const pxIdx = i * 4;
      const r = data[pxIdx];
      const g = data[pxIdx + 1];
      const b = data[pxIdx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Filter out low-luminance harsh shadow edges (< 25 luminance)
      if (lum < 25) {
        edgeMap[i] = 0;
      }
    }
  }
}

/**
 * Interpolate missing trunk contour rows through branch/foliage occlusions (Requirement 14)
 * @param {Array<{x: number, y: number}>} contour Contour points
 * @param {number} totalHeight Frame height
 */
export function interpolateOccludedContour(contour, totalHeight) {
  if (!contour || contour.length < 2) return contour;

  const interpolated = [];
  contour.sort((a, b) => a.y - b.y);

  for (let i = 0; i < contour.length - 1; i++) {
    const ptA = contour[i];
    const ptB = contour[i + 1];
    interpolated.push(ptA);

    const dy = ptB.y - ptA.y;
    if (dy > 2 && dy < 40) {
      // Linear interpolation across missing rows
      const dx = ptB.x - ptA.x;
      for (let y = ptA.y + 2; y < ptB.y; y += 2) {
        const frac = (y - ptA.y) / dy;
        interpolated.push({
          x: Math.round(ptA.x + frac * dx),
          y
        });
      }
    }
  }
  interpolated.push(contour[contour.length - 1]);
  return interpolated;
}
