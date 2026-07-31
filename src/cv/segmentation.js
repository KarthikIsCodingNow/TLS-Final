/**
 * PORTA-TLS Trunk Pixel Segmentation Engine
 * Version 2.0 Architectural Baseline
 */

/**
 * Perform region-growing scanline segmentation of the trunk within caliper guides
 * @param {ImageData} imgData Input camera frame
 * @param {object} bounds Caliper bounds in percentages
 * @returns {object} { mask, area, centroid: {x, y}, contour: {y, leftX, rightX}[], confidence }
 */
export function segmentTrunk(imgData, bounds) {
  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  // Convert percentages to pixel indices
  const leftX = Math.max(0, Math.floor(w * (bounds.leftPct / 100)));
  const rightX = Math.min(w - 1, Math.floor(w * (bounds.rightPct / 100)));
  const topY = Math.max(0, Math.floor(h * (bounds.topPct / 100)));
  const baseY = Math.min(h - 1, Math.floor(h * (bounds.basePct / 100)));

  const mask = new Uint8Array(w * h); // 1 = trunk, 0 = background
  const contour = [];
  
  let totalX = 0;
  let totalY = 0;
  let area = 0;

  // 1. Establish the "anchor" trunk color profile in the center of the caliper box
  const midX = Math.floor((leftX + rightX) / 2);
  const midY = Math.floor((topY + baseY) / 2);
  const anchorIdx = (midY * w + midX) * 4;
  const anchorR = data[anchorIdx];
  const anchorG = data[anchorIdx + 1];
  const anchorB = data[anchorIdx + 2];

  // Maximum color difference (Euclidean distance in RGB space)
  const maxColorDist = 65.0; 

  // 2. Scan row by row from top to base
  for (let y = topY; y <= baseY; y++) {
    let rowLeftX = midX;
    let rowRightX = midX;

    // Scan left from center
    for (let x = midX; x >= leftX - 10; x--) {
      if (x < 0) break;
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dist = Math.sqrt(
        Math.pow(r - anchorR, 2) +
        Math.pow(g - anchorG, 2) +
        Math.pow(b - anchorB, 2)
      );

      // Check green exclusion (avoiding green background leaves)
      const isGreen = (g > r * 1.15 && g > b * 1.15);

      if (dist > maxColorDist || isGreen) {
        rowLeftX = x;
        break;
      }
    }

    // Scan right from center
    for (let x = midX; x <= rightX + 10; x++) {
      if (x >= w) break;
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dist = Math.sqrt(
        Math.pow(r - anchorR, 2) +
        Math.pow(g - anchorG, 2) +
        Math.pow(b - anchorB, 2)
      );

      const isGreen = (g > r * 1.15 && g > b * 1.15);

      if (dist > maxColorDist || isGreen) {
        rowRightX = x;
        break;
      }
    }

    // Ensure contour bounds are valid
    if (rowRightX > rowLeftX) {
      contour.push({ y, leftX: rowLeftX, rightX: rowRightX });

      // Mark pixels in binary mask
      for (let x = rowLeftX; x <= rowRightX; x++) {
        mask[y * w + x] = 1;
        totalX += x;
        totalY += y;
        area++;
      }
    }
  }

  // 3. Compute stats
  const centroid = area > 0 
    ? { x: Math.round(totalX / area), y: Math.round(totalY / area) } 
    : { x: midX, y: midY };

  // Calculate confidence based on profile consistency (e.g. area vs bounding box area)
  const bboxArea = (rightX - leftX) * (baseY - topY);
  let confidence = 0.5;
  if (bboxArea > 0) {
    const coverage = area / bboxArea;
    // Optimal coverage is around 0.6 - 0.9 (since a tree is a column). Too high or too low reduces score.
    confidence = Math.max(0.1, 1.0 - Math.abs(coverage - 0.75) * 1.2);
  }

  return {
    mask,
    area,
    centroid,
    contour,
    confidence: parseFloat(confidence.toFixed(3))
  };
}
