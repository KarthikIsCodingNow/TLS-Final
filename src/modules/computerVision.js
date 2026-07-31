/**
 * PORTA-TLS Computer Vision Operations
 * Version 2.0 Architectural Baseline
 */
import { CONFIG } from '../core/config.js';
import { Logger } from '../core/logger.js';

/**
 * Apply real-time monochrome edge enhancement overlay on a 2D Canvas context
 */
export function applyMonochromeEdgeEnhancement(canvas, ctx) {
  const w = canvas.width;
  const h = canvas.height;
  
  // Use downsampled values for performance reasons
  const dw = CONFIG.cv.downsampleWidth;
  const dh = Math.round(dw * (h / w));
  
  // Create an offscreen buffer
  const offscreen = document.createElement('canvas');
  offscreen.width = dw;
  offscreen.height = dh;
  const octx = offscreen.getContext('2d');
  octx.drawImage(canvas, 0, 0, dw, dh);
  
  let imageData;
  try {
    imageData = octx.getImageData(0, 0, dw, dh);
  } catch (err) {
    Logger.error('Failed to retrieve image data for edge enhancement:', err.message);
    return; // handle cross-origin canvas security exceptions gracefully
  }

  const data = imageData.data;
  const edgeBuffer = octx.createImageData(dw, dh);
  const edgeData = edgeBuffer.data;

  const { r: rCoeff, g: gCoeff, b: bCoeff } = CONFIG.cv.luminanceCoefficients;
  const threshold = CONFIG.cv.edgeThreshold;
  const multiplier = CONFIG.cv.edgeMultiplier;
  const opacity = CONFIG.cv.edgeOpacity;

  for (let y = 0; y < dh; y++) {
    for (let x = 1; x < dw - 1; x++) {
      const idx = (y * dw + x) * 4;
      const idxLeft = (y * dw + (x - 1)) * 4;
      const idxRight = (y * dw + (x + 1)) * 4;

      // RGB Luminance calculation
      const l = rCoeff * data[idx] + gCoeff * data[idx + 1] + bCoeff * data[idx + 2];
      const lLeft = rCoeff * data[idxLeft] + gCoeff * data[idxLeft + 1] + bCoeff * data[idxLeft + 2];
      const lRight = rCoeff * data[idxRight] + gCoeff * data[idxRight + 1] + bCoeff * data[idxRight + 2];

      const edge = Math.abs(lRight - lLeft);
      const val = edge > threshold ? Math.min(255, edge * multiplier) : 0;

      edgeData[idx] = 255;
      edgeData[idx + 1] = 255;
      edgeData[idx + 2] = 255;
      edgeData[idx + 3] = val > 0 ? opacity : 0;
    }
  }

  octx.putImageData(edgeBuffer, 0, 0);
  
  // Composite edge enhancement onto screen
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(offscreen, 0, 0, w, h);
  ctx.restore();
}
