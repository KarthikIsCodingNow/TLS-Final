/**
 * PORTA-TLS Frame Quality Analyzer
 * Version 2.0 Architectural Baseline
 */

/**
 * Assess frame contrast, brightness, blur, and glare
 * @param {Uint8ClampedArray} data ImageData pixels buffer
 * @param {number} width Frame width
 * @param {number} height Frame height
 * @returns {object} { score, issues: string[], sharpness, brightness, contrast }
 */
export function evaluateFrameQuality(data, width, height) {
  const numPixels = data.length / 4;
  const step = Math.max(1, Math.floor(numPixels / 1000));
  
  let sumL = 0;
  let count = 0;
  let darkCount = 0;
  let saturatedCount = 0;

  // 1. Gather luminance stats
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b; // luminance

    sumL += l;
    if (l < 25.0) darkCount++;         // shadow count
    if (r > 245 && g > 245 && b > 245) saturatedCount++; // glare count
    count++;
  }

  const brightness = sumL / count;
  const darkPercent = darkCount / count;
  const glarePercent = saturatedCount / count;

  // 2. Calculate variance (contrast index)
  let sumSqDiff = 0;
  for (let i = 0; i < data.length; i += 4 * step) {
    const l = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    sumSqDiff += Math.pow(l - brightness, 2);
  }
  const contrast = Math.sqrt(sumSqDiff / count);

  // 3. Estimate sharpness (Laplacian variance approximation)
  // Compute difference of adjacent pixels horizontally
  let sumGradSq = 0;
  let gradCount = 0;
  const rowStep = Math.max(1, Math.floor(height / 100));
  const colStep = Math.max(1, Math.floor(width / 100));

  for (let y = 1; y < height - 1; y += rowStep) {
    for (let x = 1; x < width - 1; x += colStep) {
      const idx = (y * width + x) * 4;
      const idxRight = (y * width + (x + 1)) * 4;
      
      const l = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];
      const lRight = 0.299 * data[idxRight] + 0.587 * data[idxRight+1] + 0.114 * data[idxRight+2];
      
      sumGradSq += Math.pow(lRight - l, 2);
      gradCount++;
    }
  }

  const sharpness = Math.sqrt(sumGradSq / gradCount);

  // 4. Score logic
  const issues = [];
  let score = 1.0;

  // Check Brightness bounds
  if (brightness < 40) {
    score -= 0.3;
    issues.push('Poor lighting - Underexposed');
  } else if (brightness > 215) {
    score -= 0.3;
    issues.push('Poor lighting - Overexposed');
  }

  // Check Glare
  if (glarePercent > 0.12) {
    score -= 0.25;
    issues.push('Glare detected');
  }

  // Check Shadows/Occlusion
  if (darkPercent > 0.40) {
    score -= 0.2;
    issues.push('Heavy shadow/occlusion');
  }

  // Check Contrast
  if (contrast < 18) {
    score -= 0.35;
    issues.push('Low contrast - Foggy/low details');
  }

  // Check Motion Blur
  if (sharpness < 2.5) {
    score -= 0.4;
    issues.push('Motion blur - Hold camera steady');
  }

  score = Math.max(0.0, Math.min(1.0, score));

  return {
    score: parseFloat(score.toFixed(2)),
    issues,
    sharpness: parseFloat(sharpness.toFixed(2)),
    brightness: parseFloat(brightness.toFixed(1)),
    contrast: parseFloat(contrast.toFixed(1))
  };
}
