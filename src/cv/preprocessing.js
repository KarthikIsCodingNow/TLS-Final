/**
 * PORTA-TLS Computer Vision Preprocessing
 * Version 2.0 Architectural Baseline
 */

/**
 * Apply gamma correction to adjust brightness non-linearly (shadow/glare compensation)
 * Formula: I_out = 255 * (I_in / 255)^gamma
 * @param {Uint8ClampedArray} data ImageData pixels buffer
 * @param {number} gamma Gamma factor (e.g. 0.8 to darken glare, 1.2 to boost shadows)
 */
export function applyGammaCorrection(data, gamma) {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.min(255, Math.max(0, Math.round(255 * Math.pow(i / 255.0, gamma))));
  }

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = lut[data[i]];     // Red
    data[i + 1] = lut[data[i + 1]]; // Green
    data[i + 2] = lut[data[i + 2]]; // Blue
  }
}

/**
 * Apply Gray World White Balance normalization
 * Scales R, G, B channels based on the mean image color deviation
 * @param {Uint8ClampedArray} data ImageData pixels buffer
 */
export function applyWhiteBalance(data) {
  let sumR = 0, sumG = 0, sumB = 0;
  const numPixels = data.length / 4;

  // Sample pixels for speed
  const step = Math.max(1, Math.floor(numPixels / 1000));
  let count = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
    count++;
  }

  const avgR = sumR / count;
  const avgG = sumG / count;
  const avgB = sumB / count;
  
  const gray = (avgR + avgG + avgB) / 3.0;
  if (gray === 0) return;

  const scaleR = gray / avgR;
  const scaleG = gray / avgG;
  const scaleB = gray / avgB;

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.min(255, Math.max(0, Math.round(data[i] * scaleR)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(data[i + 1] * scaleG)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(data[i + 2] * scaleB)));
  }
}

/**
 * Perform adaptive histogram/contrast stretch
 * Formula: I_out = ((I_in - I_min) / (I_max - I_min)) * 255
 * @param {Uint8ClampedArray} data ImageData pixels buffer
 */
export function applyAdaptiveContrastStretch(data) {
  let minL = 255;
  let maxL = 0;
  const numPixels = data.length / 4;
  const step = Math.max(1, Math.floor(numPixels / 1000));

  // Determine luminance boundaries
  for (let i = 0; i < data.length; i += 4 * step) {
    const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
  }

  const range = maxL - minL;
  if (range <= 10) return; // ignore flat frames

  const scale = 255.0 / range;

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.min(255, Math.max(0, Math.round((data[i] - minL) * scale)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round((data[i + 1] - minL) * scale)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round((data[i + 2] - minL) * scale)));
  }
}
