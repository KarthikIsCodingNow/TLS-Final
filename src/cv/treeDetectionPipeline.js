/**
 * PORTA-TLS Tree Feature Detection Pipeline
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';

/**
 * Fuse heuristic physical tree indicators to score a candidate bounding box
 * @param {ImageData} imgData Frame image data
 * @param {object} bounds { leftPct, rightPct, topPct, basePct }
 * @returns {object} { score, edgeDensity, symmetry, aspectRatio, colorConsistency, canopyScore, groundScore }
 */
export function evaluateTreeCandidateCues(imgData, bounds) {
  const w = imgData.width;
  const h = imgData.height;
  const data = imgData.data;

  // Convert percentages to coordinates
  const leftX = Math.max(0, Math.floor(w * (bounds.leftPct / 100)));
  const rightX = Math.min(w - 1, Math.floor(w * (bounds.rightPct / 100)));
  const topY = Math.max(0, Math.floor(h * (bounds.topPct / 100)));
  const baseY = Math.min(h - 1, Math.floor(h * (bounds.basePct / 100)));

  const boxW = Math.max(5, rightX - leftX);
  const boxH = Math.max(5, baseY - topY);

  // 1. Aspect Ratio Score
  const aspect = boxH / boxW;
  // Trees are typically tall vertical cylinders (aspect 3:1 to 8:1)
  let aspectScore = 1.0 - Math.min(1.0, Math.abs(aspect - 4.5) * 0.15);
  aspectScore = Math.max(0.1, aspectScore);

  // 2. Color Consistency & Green Exclusion (Trunk is grey/brown, not leaf-green)
  let sumR = 0, sumG = 0, sumB = 0;
  let sampleCount = 0;
  let greenCount = 0;

  const yStep = Math.max(1, Math.floor(boxH / 20));
  const xStep = Math.max(1, Math.floor(boxW / 10));

  for (let y = topY; y < baseY; y += yStep) {
    for (let x = leftX; x < rightX; x += xStep) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      sumR += r;
      sumG += g;
      sumB += b;
      
      // Simple green leaf threshold indicator
      if (g > r * 1.15 && g > b * 1.15) {
        greenCount++;
      }
      sampleCount++;
    }
  }

  const greenRatio = greenCount / sampleCount;
  const colorConsistency = Math.max(0.0, 1.0 - greenRatio * 2.0); // high penalty for green trunks

  // 3. Vertical Edge Density (Trunk boundaries are vertical lines)
  let edgeSum = 0;
  let edgeCount = 0;
  
  for (let y = topY + 1; y < baseY - 1; y += yStep) {
    const idxL = (y * w + leftX) * 4;
    const idxR = (y * w + rightX) * 4;
    
    // Sobel horizontal derivative approximation Gx = I(x+1) - I(x-1)
    const grayL_prev = 0.299 * data[idxL - 4] + 0.587 * data[idxL - 3] + 0.114 * data[idxL - 2];
    const grayL_next = 0.299 * data[idxL + 4] + 0.587 * data[idxL + 5] + 0.114 * data[idxL + 6];
    const grayR_prev = 0.299 * data[idxR - 4] + 0.587 * data[idxR - 3] + 0.114 * data[idxR - 2];
    const grayR_next = 0.299 * data[idxR + 4] + 0.587 * data[idxR + 5] + 0.114 * data[idxR + 6];

    edgeSum += Math.abs(grayL_next - grayL_prev) + Math.abs(grayR_next - grayR_prev);
    edgeCount += 2;
  }
  
  const avgEdgeGrad = edgeCount > 0 ? (edgeSum / edgeCount) : 0.0;
  const edgeDensity = Math.min(1.0, avgEdgeGrad / 35.0); // normalize with gradient strength

  // 4. Trunk Horizontal Symmetry (Luminance symmetry)
  let symDiff = 0;
  let symCount = 0;
  
  for (let y = topY; y < baseY; y += yStep * 2) {
    for (let dx = 0; dx < boxW / 2; dx += xStep) {
      const idxL = (y * w + (leftX + dx)) * 4;
      const idxR = (y * w + (rightX - dx)) * 4;

      const valL = 0.299 * data[idxL] + 0.587 * data[idxL+1] + 0.114 * data[idxL+2];
      const valR = 0.299 * data[idxR] + 0.587 * data[idxR+1] + 0.114 * data[idxR+2];

      symDiff += Math.abs(valL - valR);
      symCount++;
    }
  }

  const avgSymDiff = symCount > 0 ? (symDiff / symCount) : 0.0;
  const symmetry = Math.max(0.1, 1.0 - (avgSymDiff / 100.0));

  // 5. Canopy Continuity (Leaves above the top caliper)
  let canopyGreenCount = 0;
  let canopySampleCount = 0;
  const canopyHeight = Math.max(5, Math.floor(h * 0.1));
  const canopyTopY = Math.max(0, topY - canopyHeight);

  for (let y = canopyTopY; y < topY; y += 2) {
    for (let x = leftX; x < rightX; x += 2) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      if (g > r * 1.05 && g > b * 1.05) {
        canopyGreenCount++;
      }
      canopySampleCount++;
    }
  }

  const canopyScore = canopySampleCount > 0 ? (canopyGreenCount / canopySampleCount) : 0.5;

  // 6. Ground Connection (Grass/Soil texture around the base)
  let groundMatchCount = 0;
  let groundSampleCount = 0;
  const groundHeight = Math.max(5, Math.floor(h * 0.08));
  const groundBaseY = Math.min(h - 1, baseY + groundHeight);

  for (let y = baseY; y < groundBaseY; y += 2) {
    for (let x = leftX; x < rightX; x += 2) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      // Grass green or soil brown
      const isGrass = (g > r && g > b);
      const isBrownSoil = (r > g && g > b && r > 40 && b < 80);
      if (isGrass || isBrownSoil) {
        groundMatchCount++;
      }
      groundSampleCount++;
    }
  }

  const groundScore = groundSampleCount > 0 ? (groundMatchCount / groundSampleCount) : 0.5;

  // Fused confidence index
  const fusedScore = (
    edgeDensity * 0.25 +
    symmetry * 0.15 +
    aspectScore * 0.20 +
    colorConsistency * 0.15 +
    canopyScore * 0.15 +
    groundScore * 0.10
  );

  return {
    score: parseFloat(fusedScore.toFixed(3)),
    edgeDensity: parseFloat(edgeDensity.toFixed(2)),
    symmetry: parseFloat(symmetry.toFixed(2)),
    aspectRatio: parseFloat(aspectScore.toFixed(2)),
    colorConsistency: parseFloat(colorConsistency.toFixed(2)),
    canopyScore: parseFloat(canopyScore.toFixed(2)),
    groundScore: parseFloat(groundScore.toFixed(2))
  };
}
