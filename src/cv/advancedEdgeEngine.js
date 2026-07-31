/**
 * PORTA-TLS Advanced Edge Detection Engine
 * Version 2.2 Architectural Baseline - Task 8 Extension
 * Pipeline: Gaussian Blur -> Sobel Vertical Gradient -> Canny Hysteresis -> Morphological Closing
 */

/**
 * Apply 5x5 Gaussian Smoothing to suppress high-frequency leaf texture
 */
export function applyGaussianSmoothing(gray, w, h, output) {
  const kernel = [
    1, 4, 7, 4, 1,
    4, 16, 26, 16, 4,
    7, 26, 41, 26, 7,
    4, 16, 26, 16, 4,
    1, 4, 7, 4, 1
  ];
  const kernelSum = 273;

  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      let sum = 0;
      let kIdx = 0;
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          sum += gray[(y + ky) * w + (x + kx)] * kernel[kIdx++];
        }
      }
      output[y * w + x] = Math.min(255, Math.max(0, Math.round(sum / kernelSum)));
    }
  }
}

/**
 * Apply Morphological Closing (Dilation then Erosion) with a vertical 3x7 structuring element
 * Connects interrupted vertical trunk contours
 */
export function applyMorphologicalClosing(edges, w, h, output) {
  const tempDilation = new Uint8Array(w * h);

  // 1. Vertical Dilation
  for (let y = 3; y < h - 3; y++) {
    for (let x = 1; x < w - 1; x++) {
      let maxVal = 0;
      for (let ky = -3; ky <= 3; ky++) {
        const val = edges[(y + ky) * w + x];
        if (val > maxVal) maxVal = val;
      }
      tempDilation[y * w + x] = maxVal;
    }
  }

  // 2. Vertical Erosion
  for (let y = 3; y < h - 3; y++) {
    for (let x = 1; x < w - 1; x++) {
      let minVal = 255;
      for (let ky = -3; ky <= 3; ky++) {
        const val = tempDilation[(y + ky) * w + x];
        if (val < minVal) minVal = val;
      }
      output[y * w + x] = minVal;
    }
  }
}

/**
 * Execute Advanced Edge Detection Pipeline
 * @param {Uint8Array} gray 8-bit grayscale image buffer
 * @param {number} w Frame width
 * @param {number} h Frame height
 * @param {Uint8Array} output Target binary edge map output buffer
 */
export function applyAdvancedEdgeDetection(gray, w, h, output) {
  const smoothed = new Uint8Array(w * h);
  const gradient = new Uint8Array(w * h);

  // 1. Gaussian Noise Suppression
  applyGaussianSmoothing(gray, w, h, smoothed);

  // 2. Sobel Horizontal Gradient G_x (Highlights vertical trunk edges)
  const Gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let val = 
        smoothed[(y - 1) * w + (x - 1)] * Gx[0] + smoothed[(y - 1) * w + (x + 1)] * Gx[2] +
        smoothed[y * w + (x - 1)] * Gx[3] + smoothed[y * w + (x + 1)] * Gx[5] +
        smoothed[(y + 1) * w + (x - 1)] * Gx[6] + smoothed[(y + 1) * w + (x + 1)] * Gx[8];

      const mag = Math.min(255, Math.abs(val));
      gradient[y * w + x] = mag;
    }
  }

  // 3. Canny Hysteresis Dual Thresholding (Low = 35, High = 90)
  const cannyTemp = new Uint8Array(w * h);
  const lowThresh = 35;
  const highThresh = 90;

  for (let i = 0; i < w * h; i++) {
    const mag = gradient[i];
    if (mag >= highThresh) {
      cannyTemp[i] = 255;
    } else if (mag >= lowThresh) {
      cannyTemp[i] = 128; // weak edge
    } else {
      cannyTemp[i] = 0;
    }
  }

  // Connect weak edges to strong neighbors
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (cannyTemp[idx] === 128) {
        let hasStrong = false;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (cannyTemp[(y + ky) * w + (x + kx)] === 255) {
              hasStrong = true;
              break;
            }
          }
        }
        cannyTemp[idx] = hasStrong ? 255 : 0;
      }
    }
  }

  // 4. Morphological Closing to connect trunk boundaries
  applyMorphologicalClosing(cannyTemp, w, h, output);
}
