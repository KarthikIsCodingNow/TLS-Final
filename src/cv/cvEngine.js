/**
 * PORTA-TLS Computer Vision Orchestration Engine
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */
import { Logger } from '../core/logger.js';
import { Profiler } from '../core/profiler.js';

import {
  applyGammaCorrection,
  applyWhiteBalance,
  applyAdaptiveContrastStretch
} from './preprocessing.js';

import { evaluateFrameQuality } from './frameQuality.js';
import { DetectionManager } from './detectionManager.js';
import { evaluateTreeCandidateCues } from './treeDetectionPipeline.js';
import { segmentTrunk } from './segmentation.js';

import {
  toGrayscale,
  applySobel,
  applyScharr,
  applyPrewitt,
  applyCanny,
  applyAdaptiveThreshold,
  calculateEdgeQualityScore
} from './edgeExtractors.js';

import { applyAdvancedEdgeDetection } from './advancedEdgeEngine.js';
import { extractTrunkBoundaries } from './trunkExtractor.js';
import { detectAutomaticBase, detectAutomaticCanopy } from './autoBaseTopEngine.js';
import { AutoCaliperManager } from './autoCaliperManager.js';
import { MotionDetector } from './motionDetector.js';
import { generateTreeSegmentationMask, estimateRelativeMonocularDepth } from './depthSegmentationEngine.js';
import { filterTrunkShadows, interpolateOccludedContour } from './shadowOcclusionHandler.js';
import { performAutomaticQualityCheck } from './qualityAssessmentEngine.js';

import { fitTrunkCenterline } from './centerline.js';
import { KalmanFilter2D, trackBlockMatch } from './trackingEngine.js';
import { generateGuidanceAlerts } from './guidance.js';

// Instantiating centroid Kalman tracker
const centroidKalman = new KalmanFilter2D();

// Cache grayscale buffer of previous frame for template tracking
let prevGrayBuffer = null;

export const CVEngine = {
  /**
   * Process a single video/image canvas frame through the multi-stage pipeline
   * @param {HTMLCanvasElement} canvas Viewport canvas source
   * @param {object} state App global state
   * @param {string} edgeMethod Active edge kernel ('sobel', 'scharr', 'prewitt', 'canny', 'adaptive', 'advanced')
   * @returns {object} Processed pipeline results
   */
  processFrame(canvas, state, edgeMethod = 'sobel') {
    Profiler.start('cvPipeline');

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // STAGE 0: Acquisition & Quality Analysis
    const imgData = ctx.getImageData(0, 0, w, h);
    const quality = evaluateFrameQuality(imgData.data, w, h);

    if (quality.score < 0.40) {
      Logger.warn(`Frame rejected due to low quality score: ${quality.score}`);
      Profiler.end('cvPipeline');
      return {
        success: false,
        quality,
        alerts: ['FRAME REJECTED - Hold steady & increase lighting']
      };
    }

    // STAGE 1: Preprocessing & Lighting Normalization
    applyWhiteBalance(imgData.data);
    applyGammaCorrection(imgData.data, state.settings.researchModeEnabled ? 1.0 : 1.2);
    applyAdaptiveContrastStretch(imgData.data);
    ctx.putImageData(imgData, 0, 0);

    // STAGE 2: Motion Detection (Requirement 9)
    const gray = new Uint8Array(w * h);
    toGrayscale(imgData.data, w, h, gray);
    const motionResult = MotionDetector.detectMotion(gray, w, h);

    // STAGE 3: Edge Extraction
    const edges = new Uint8Array(w * h);
    if (edgeMethod === 'advanced' || edgeMethod === 'canny') {
      applyAdvancedEdgeDetection(gray, w, h, edges);
    } else {
      switch (edgeMethod) {
        case 'scharr': applyScharr(gray, w, h, edges); break;
        case 'prewitt': applyPrewitt(gray, w, h, edges); break;
        case 'adaptive': applyAdaptiveThreshold(gray, w, h, edges, 15, 7); break;
        case 'sobel': default: applySobel(gray, w, h, edges); break;
      }
    }

    // Filter directional shadows (Requirement 12)
    filterTrunkShadows(imgData, edges);

    // STAGE 4: Trunk Extraction (Requirement 3)
    const bounds = {
      leftPct: state.calibration.left,
      rightPct: state.calibration.right,
      topPct: state.calibration.top,
      basePct: state.calibration.base
    };

    const trunkBoundaries = extractTrunkBoundaries(edges, w, h, bounds);
    if (trunkBoundaries.leftContour.length > 0) {
      trunkBoundaries.leftContour = interpolateOccludedContour(trunkBoundaries.leftContour, h);
      trunkBoundaries.rightContour = interpolateOccludedContour(trunkBoundaries.rightContour, h);
    }

    // STAGE 5: Auto Base & Canopy Detection (Requirements 4 & 5)
    const autoBase = detectAutomaticBase(imgData, trunkBoundaries.centerLine);
    const autoTop = detectAutomaticCanopy(imgData, trunkBoundaries.centerLine);

    // STAGE 6: Auto Caliper Snapping (Requirement 6)
    if (state.ui.autoCaliperSnap !== false && trunkBoundaries.success) {
      AutoCaliperManager.snapCalipers(state, trunkBoundaries, autoBase, autoTop, w, h);
    }

    // STAGE 7: Tree Segmentation & Depth Estimation (Requirements 10 & 11)
    const segMask = generateTreeSegmentationMask(imgData, trunkBoundaries);
    const depthEst = estimateRelativeMonocularDepth(imgData, segMask);

    // STAGE 8: Candidate Cues & Legacy Centerline
    const candidateCues = evaluateTreeCandidateCues(imgData, bounds);
    const segment = segmentTrunk(imgData, bounds);
    const centerline = fitTrunkCenterline(segment.contour);
    const edgeQuality = calculateEdgeQualityScore(edges, w, h, bounds);

    // STAGE 9: Tracking & Smoothing (Requirement 7 & 8)
    let trackedCentroid = segment.centroid;
    if (prevGrayBuffer && prevGrayBuffer.length === gray.length) {
      const match = trackBlockMatch(prevGrayBuffer, gray, w, h, segment.centroid);
      centroidKalman.predict();
      const smoothed = centroidKalman.correct(match.x, match.y);
      trackedCentroid = { x: smoothed[0], y: smoothed[1], dx: match.dx, dy: match.dy };
    } else {
      centroidKalman.reset();
    }
    prevGrayBuffer = gray;

    // STAGE 10: Automatic Quality Check & Detection Confidence (Requirements 15 & 17)
    const qualityCheck = performAutomaticQualityCheck(
      trunkBoundaries,
      autoBase,
      autoTop,
      motionResult,
      quality,
      w
    );

    const alerts = generateGuidanceAlerts(state, quality);
    if (motionResult.isExcessiveMotion) {
      alerts.unshift(motionResult.statusText);
    }
    if (qualityCheck.primaryWarning) {
      alerts.push(qualityCheck.primaryWarning);
    }

    const detectionConfidence = {
      treeDetectionPct: Math.round(candidateCues.score * 100),
      basePct: Math.round(autoBase.baseConfidence * 100),
      canopyPct: Math.round(autoTop.canopyConfidence * 100),
      trunkPct: Math.round(trunkBoundaries.confidence * 100),
      trackingPct: motionResult.isExcessiveMotion ? 40 : 92,
      overallPct: Math.round(
        0.25 * candidateCues.score * 100 +
        0.20 * autoBase.baseConfidence * 100 +
        0.20 * autoTop.canopyConfidence * 100 +
        0.20 * trunkBoundaries.confidence * 100 +
        0.15 * (motionResult.isExcessiveMotion ? 40 : 92)
      )
    };

    Profiler.end('cvPipeline');

    return {
      success: true,
      quality,
      candidateCues,
      segment,
      edges,
      edgeQuality,
      centerline,
      trunkBoundaries,
      autoBase,
      autoTop,
      motionResult,
      depthEst,
      detectionConfidence,
      trackedCentroid,
      alerts,
      canvasHeight: h
    };
  }
};
