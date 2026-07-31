/**
 * PORTA-TLS AI Bounding Box Tracking & TensorFlow.js Wrapper
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';
import { CONFIG } from '../core/config.js';

/**
 * Load cocoSsd model asynchronously
 * @returns {Promise<any>}
 */
export async function loadCocoSsdModel() {
  Logger.info('Initializing TensorFlow.js COCO-SSD Model loading sequence');
  if (typeof cocoSsd === 'undefined') {
    throw new Error('cocoSsd library is not loaded. Ensure TensorFlow CDN script tags exist in index.html.');
  }
  return await cocoSsd.load();
}

/**
 * Bounding box overlap calculation (Intersection over Union)
 * @param {number[]} boxA [x, y, width, height]
 * @param {number[]} boxB [x, y, width, height]
 * @returns {number} IoU coefficient (0.0 to 1.0)
 */
export function calculateIoU(boxA, boxB) {
  const xA = Math.max(boxA[0], boxB[0]);
  const yA = Math.max(boxA[1], boxB[1]);
  const xB = Math.min(boxA[0] + boxA[2], boxB[0] + boxB[2]);
  const yB = Math.min(boxA[1] + boxA[3], boxB[1] + boxB[3]);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const boxAArea = boxA[2] * boxA[3];
  const boxBArea = boxB[2] * boxB[3];

  const unionArea = boxAArea + boxBArea - interArea;
  if (unionArea === 0) return 0;
  return interArea / unionArea;
}

/**
 * Filter and map raw predictions from COCO-SSD model
 * @param {object[]} predictions Raw model output
 * @param {number} threshold Confidence filter
 * @param {string} targetClass 'trees' | 'all'
 * @returns {object[]} Filtered predictions
 */
export function filterPredictions(predictions, threshold, targetClass) {
  return predictions.filter(p => {
    if (p.score < threshold) return false;
    if (targetClass === 'trees') {
      // Map common flora COCO classes: potted plant, vase, bed, broccoli, umbrella (sometimes trees are classified as these)
      return CONFIG.ai.targetFloraClasses.includes(p.class);
    }
    return true;
  });
}

/**
 * Track the selected target prediction within the new set of frame predictions
 * @param {object} selectedPrediction Previously tracked target
 * @param {object[]} newPredictions Current frame predictions
 * @param {number} minIoU Minimum overlap threshold
 * @returns {object|null} The matching prediction or null if track is lost
 */
export function trackTarget(selectedPrediction, newPredictions, minIoU = CONFIG.ai.iouTrackingThreshold) {
  if (!selectedPrediction || newPredictions.length === 0) return null;

  let bestMatch = null;
  let maxIoU = minIoU;

  newPredictions.forEach(p => {
    if (p.class === selectedPrediction.class) {
      const iou = calculateIoU(p.bbox, selectedPrediction.bbox);
      if (iou > maxIoU) {
        maxIoU = iou;
        bestMatch = p;
      }
    }
  });

  return bestMatch;
}
