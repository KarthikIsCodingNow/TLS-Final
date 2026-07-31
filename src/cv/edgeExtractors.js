/**
 * PORTA-TLS Multi-Kernel Edge Detection Engine
 * Version 2.0 Architectural Baseline
 */

/**
 * Helper: Convert RGBA canvas pixels buffer to grayscale 8-bit buffer
 */
export function toGrayscale(data, width, height, grayBuffer) {
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    grayBuffer[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
}

/**
 * Convolve image with horizontal and vertical 3x3 kernels
 */
function convolve3x3(gray, w, h, kx, ky, outputGrad) {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let cy = -1; cy <= 1; cy++) {
        for (let cx = -1; cx <= 1; cx++) {
          const val = gray[(y + cy) * w + (x + cx)];
          gx += val * kx[(cy + 1) * 3 + (cx + 1)];
          gy += val * ky[(cy + 1) * 3 + (cx + 1)];
        }
      }

      const mag = Math.sqrt(gx * gx + gy * gy);
      outputGrad[y * w + x] = Math.min(255, mag);
    }
  }
}

/**
 * Sobel Edge Filter
 */
export function applySobel(gray, w, h, output) {
  const kx = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];
  const ky = [
    -1, -2, -1,
     0,  0,  0,
     1,  2,  1
  ];
  convolve3x3(gray, w, h, kx, ky, output);
}

/**
 * Scharr Edge Filter (More angularly sensitive than Sobel)
 */
export function applyScharr(gray, w, h, output) {
  const kx = [
    -3,  0,  3,
    -10, 0, 10,
    -3,  0,  3
  ];
  const ky = [
    -3, -10, -3,
     0,   0,  0,
     3,  10,  3
  ];
  convolve3x3(gray, w, h, kx, ky, output);
}

/**
 * Prewitt Edge Filter
 */
export function applyPrewitt(gray, w, h, output) {
  const kx = [
    -1, 0, 1,
    -1, 0, 1,
    -1, 0, 1
  ];
  const ky = [
    -1, -1, -1,
     0,  0,  0,
     1,  1,  1
  ];
  convolve3x3(gray, w, h, kx, ky, output);
}

/**
 * Adaptive Thresholding (Locally threshold pixels based on neighborhood mean)
 */
export function applyAdaptiveThreshold(gray, w, h, output, blockSize = 15, c = 7) {
  const half = Math.floor(blockSize / 2);
  output.fill(0);

  for (let y = half; y < h - half; y++) {
    for (let x = half; x < w - half; x++) {
      let sum = 0;
      
      // Calculate local sum
      for (let cy = -half; cy <= half; cy++) {
        for (let cx = -half; cx <= half; cx++) {
          sum += gray[(y + cy) * w + (x + cx)];
        }
      }

      const mean = sum / (blockSize * blockSize);
      const centerVal = gray[y * w + x];
      output[y * w + x] = centerVal < (mean - c) ? 255 : 0;
    }
  }
}

/**
 * Morphological Erosion
 */
export function applyErosion(binary, w, h, output) {
  output.fill(0);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (
        binary[y * w + x] === 255 &&
        binary[(y - 1) * w + x] === 255 &&
        binary[(y + 1) * w + x] === 255 &&
        binary[y * w + (x - 1)] === 255 &&
        binary[y * w + (x + 1)] === 255
      ) {
        output[y * w + x] = 255;
      }
    }
  }
}

/**
 * Morphological Dilation
 */
export function applyDilation(binary, w, h, output) {
  output.fill(0);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (binary[y * w + x] === 255) {
        output[y * w + x] = 255;
        output[(y - 1) * w + x] = 255;
        output[(y + 1) * w + x] = 255;
        output[y * w + (x - 1)] = 255;
        output[y * w + (x + 1)] = 255;
      }
    }
  }
}

/**
 * Simplified Canny (Non-maximum suppression + Hysteresis)
 */
export function applyCanny(gray, w, h, output, lowThresh = 20, highThresh = 50) {
  const mag = new Float32Array(w * h);
  const dir = new Float32Array(w * h);
  
  // 1. Compute gradients and angles
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx = (gray[idx + 1] - gray[idx - 1]) * 0.5;
      const gy = (gray[idx + w] - gray[idx - w]) * 0.5;
      
      mag[idx] = Math.sqrt(gx * gx + gy * gy);
      dir[idx] = Math.atan2(gy, gx);
    }
  }

  // 2. Non-maximum suppression
  const nms = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const m = mag[idx];
      if (m === 0) continue;

      let angle = dir[idx] * (180 / Math.PI);
      if (angle < 0) angle += 180;

      let n1 = 0;
      let n2 = 0;

      // Classify angle to 4 sectors
      if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
        n1 = mag[idx - 1];
        n2 = mag[idx + 1];
      } else if (angle >= 22.5 && angle < 67.5) {
        n1 = mag[idx - w - 1];
        n2 = mag[idx + w + 1];
      } else if (angle >= 67.5 && angle < 112.5) {
        n1 = mag[idx - w];
        n2 = mag[idx + w];
      } else {
        n1 = mag[idx - w + 1];
        n2 = mag[idx + w - 1];
      }

      if (m >= n1 && m >= n2) {
        nms[idx] = m;
      }
    }
  }

  // 3. Hysteresis double-thresholding
  output.fill(0);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const m = nms[idx];
      
      if (m >= highThresh) {
        output[idx] = 255;
      } else if (m >= lowThresh) {
        // Connected to strong pixel?
        if (
          nms[idx - 1] >= highThresh || nms[idx + 1] >= highThresh ||
          nms[idx - w] >= highThresh || nms[idx + w] >= highThresh
        ) {
          output[idx] = 255;
        }
      }
    }
  }
}

/**
 * Score edge quality based on edge coherence and noise levels
 */
export function calculateEdgeQualityScore(edgeBuffer, w, h, bounds) {
  const leftX = Math.max(0, Math.floor(w * (bounds.leftPct / 100)));
  const rightX = Math.min(w - 1, Math.floor(w * (bounds.rightPct / 100)));
  const topY = Math.max(0, Math.floor(h * (bounds.topPct / 100)));
  const baseY = Math.min(h - 1, Math.floor(h * (bounds.basePct / 100)));

  let trunkEdges = 0;
  let noiseEdges = 0;

  for (let y = topY; y <= baseY; y++) {
    for (let x = 0; x < w; x++) {
      if (edgeBuffer[y * w + x] > 120) {
        // Is it inside the trunk margins?
        if (x >= leftX - 10 && x <= rightX + 10) {
          trunkEdges++;
        } else {
          noiseEdges++;
        }
      }
    }
  }

  if (trunkEdges === 0) return 0.0;
  // Score is ratio of signal-to-noise
  const score = trunkEdges / (trunkEdges + noiseEdges * 0.1);
  return parseFloat(Math.min(1.0, score).toFixed(2));
}
