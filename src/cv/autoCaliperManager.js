/**
 * PORTA-TLS Automatic Caliper Placement Manager
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */
import { Logger } from '../core/logger.js';

export const AutoCaliperManager = {
  /**
   * Automatically position left/right trunk calipers and top/base markers (Requirement 6)
   * @param {object} state Global application state
   * @param {object} trunkBoundaries Result from trunkExtractor ({ leftContour, rightContour })
   * @param {object} baseResult Result from detectAutomaticBase ({ baseY })
   * @param {object} canopyResult Result from detectAutomaticCanopy ({ topY })
   * @param {number} frameWidth Canvas width
   * @param {number} frameHeight Canvas height
   */
  snapCalipers(state, trunkBoundaries, baseResult, canopyResult, frameWidth, frameHeight) {
    if (!trunkBoundaries || !trunkBoundaries.success || frameWidth <= 0 || frameHeight <= 0) {
      return false;
    }

    const lefts = trunkBoundaries.leftContour.map(p => p.x);
    const rights = trunkBoundaries.rightContour.map(p => p.x);

    if (lefts.length === 0 || rights.length === 0) return false;

    // Median left and right x bounds
    lefts.sort((a, b) => a - b);
    rights.sort((a, b) => a - b);

    const medianLeftX = lefts[Math.floor(lefts.length / 2)];
    const medianRightX = rights[Math.floor(rights.length / 2)];

    const leftPct = parseFloat(((medianLeftX / frameWidth) * 100).toFixed(2));
    const rightPct = parseFloat(((medianRightX / frameWidth) * 100).toFixed(2));
    const topPct = parseFloat(((canopyResult.topY / frameHeight) * 100).toFixed(2));
    const basePct = parseFloat(((baseResult.baseY / frameHeight) * 100).toFixed(2));

    // Update global state caliper percentages
    state.calibration.left = Math.max(1.0, Math.min(98.0, leftPct));
    state.calibration.right = Math.max(leftPct + 1.0, Math.min(99.0, rightPct));
    state.calibration.top = Math.max(1.0, Math.min(98.0, topPct));
    state.calibration.base = Math.max(topPct + 1.0, Math.min(99.0, basePct));

    Logger.info(`Auto-snapped calipers: Left=${leftPct}%, Right=${rightPct}%, Top=${topPct}%, Base=${basePct}%`);
    return true;
  }
};
