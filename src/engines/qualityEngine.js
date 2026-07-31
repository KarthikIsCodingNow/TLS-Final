/**
 * PORTA-TLS Image Quality, Lighting, Sharpness & AI Reliability Analyzer
 * Version 2.1 Architectural Baseline - Task 7 Extension
 */

/**
 * Analyze camera frame image data for lighting, contrast, and dynamic range
 * @param {Uint8ClampedArray} pixelData RGBA pixel buffer
 * @param {number} width Frame width
 * @param {number} height Frame height
 */
export function analyzeFrameLighting(pixelData, width, height) {
  if (!pixelData || pixelData.length === 0) {
    return {
      avgBrightness: 128,
      rmsContrast: 50,
      dynamicRange: 255,
      classification: 'Good',
      warning: null
    };
  }

  const totalPixels = width * height;
  let sumLuminance = 0;
  let minL = 255;
  let maxL = 0;

  // Sample every 4th pixel for speed
  const step = 4 * 4;
  let count = 0;

  for (let i = 0; i < pixelData.length; i += step) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;

    sumLuminance += y;
    if (y < minL) minL = y;
    if (y > maxL) maxL = y;
    count++;
  }

  const avgBrightness = sumLuminance / (count || 1);

  // Compute RMS Contrast
  let sumSquareDiff = 0;
  for (let i = 0; i < pixelData.length; i += step) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    sumSquareDiff += Math.pow(y - avgBrightness, 2);
  }

  const rmsContrast = Math.sqrt(sumSquareDiff / (count || 1));
  const dynamicRange = maxL - minL;

  let classification = 'Good';
  let warning = null;

  if (avgBrightness >= 70 && avgBrightness <= 190 && rmsContrast >= 35) {
    classification = 'Excellent';
  } else if (avgBrightness >= 50 && avgBrightness <= 210 && rmsContrast >= 20) {
    classification = 'Good';
  } else if (avgBrightness >= 25 && avgBrightness < 50) {
    classification = 'Low Light';
    warning = 'Low light detected. Consider increasing illumination.';
  } else {
    classification = 'Very Poor';
    warning = 'Poor lighting quality. Image is underexposed or overexposed.';
  }

  return {
    avgBrightness: parseFloat(avgBrightness.toFixed(1)),
    rmsContrast: parseFloat(rmsContrast.toFixed(1)),
    dynamicRange,
    classification,
    warning
  };
}

/**
 * Estimate image sharpness using Laplacian variance over grayscale buffer
 * @param {Uint8Array} gray 8-bit grayscale frame buffer
 * @param {number} width Frame width
 * @param {number} height Frame height
 */
export function analyzeImageSharpness(gray, width, height) {
  if (!gray || gray.length === 0) {
    return { laplacianVariance: 100, rating: 'Acceptable', warning: null };
  }

  let sumLap = 0;
  let sumSqLap = 0;
  let count = 0;

  // Discrete Laplacian kernel 3x3:
  // [ 0  1  0]
  // [ 1 -4  1]
  // [ 0  1  0]
  const stride = width;
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = y * stride + x;
      const val = 
        gray[idx - stride] +
        gray[idx - 1] - 4 * gray[idx] + gray[idx + 1] +
        gray[idx + stride];

      sumLap += val;
      sumSqLap += val * val;
      count++;
    }
  }

  const meanLap = sumLap / (count || 1);
  const lapVariance = (sumSqLap / (count || 1)) - (meanLap * meanLap);

  let rating = 'Acceptable';
  let warning = null;

  if (lapVariance >= 120) {
    rating = 'Sharp';
  } else if (lapVariance >= 40) {
    rating = 'Acceptable';
  } else {
    rating = 'Blurry';
    warning = 'Image is blurry. Hold camera steady or refocus.';
  }

  return {
    laplacianVariance: parseFloat(lapVariance.toFixed(1)),
    rating,
    warning
  };
}

/**
 * Calculate AI Detection Reliability index (0-100%)
 * @param {number} cocoConf Detector raw confidence (0.0 to 1.0)
 * @param {number} bboxStability Bounding box area stability (0.0 to 1.0)
 * @param {number} iouConsistency Frame-to-frame IoU overlap (0.0 to 1.0)
 */
export function calculateAiReliability(cocoConf = 0.8, bboxStability = 0.85, iouConsistency = 0.9) {
  const combined = 0.40 * cocoConf + 0.35 * bboxStability + 0.25 * iouConsistency;
  const scorePct = Math.round(Math.max(0, Math.min(100, combined * 100)));

  const isReliable = scorePct >= 40;
  let rating = 'High';
  if (scorePct < 40) rating = 'Unreliable';
  else if (scorePct < 70) rating = 'Moderate';

  return {
    scorePct,
    isReliable,
    rating
  };
}
