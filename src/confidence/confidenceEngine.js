/**
 * confidenceEngine.js - Central Confidence & Error Prediction Engine (CEPE)
 * 
 * Orchestrates:
 * - 17-Factor Quality Metrics Evaluation
 * - Partial-Derivative Mathematical Error Propagation
 * - 68%, 95%, 99% Gaussian Confidence Intervals
 * - Standalone Reliability Index (0-100) & Letter Grading (A+ to D)
 * - Uncertainty Attributions & Explanations Trace
 * - Actionable Guidance Recommendations
 */

import { qualityMetricsEngine } from './qualityMetrics.js';
import { errorPropagationEngine } from './errorPropagation.js';
import { uncertaintyModelEngine } from './uncertaintyModel.js';
import { measurementGradeEngine } from './measurementGrade.js';
import { confidenceTelemetryEngine } from './confidenceTelemetry.js';

export class ConfidenceAndErrorPredictionEngine {
  constructor() {
    this.lastEvaluation = null;
  }

  /**
   * Main evaluation function processing AMSFE outputs & runtime telemetry
   * @param {Object} amsfeOutput Result from AMSFE.fuseMeasurements()
   * @param {Object} telemetry Device telemetry & environmental factors
   * @returns {Object} Complete Scientific Prediction Report
   */
  predictConfidence(amsfeOutput = {}, telemetry = {}) {
    // Step 1: Evaluate 17 Quality Factors
    const qualityFactors = qualityMetricsEngine.evaluateQualityFactors(amsfeOutput, telemetry);

    // Step 2: Dimensions & Base Error Propagation
    const dimensions = {
      height: amsfeOutput.height || 0,
      distance: amsfeOutput.distance || 0,
      dbh: amsfeOutput.dbh || 0,
      biomass: amsfeOutput.biomass || 0,
      carbon: amsfeOutput.carbon || 0
    };

    const uncertainties = {
      distErr: amsfeOutput.uncertainty || 0.15,
      pitchErrDeg: (1 - qualityFactors.deviceOrientationStability) * 0.5,
      dbhErrCm: (1 - qualityFactors.edgeSharpness) * 2.0,
      densityErr: 0.03,
      woodDensity: telemetry.woodDensity || 0.60
    };

    const { expectedErrors, percentageErrors, errorContributors } = errorPropagationEngine.propagateErrors(dimensions, uncertainties);

    // Step 3: Compute 68%, 95%, 99% Confidence Intervals
    const confidenceIntervals = uncertaintyModelEngine.calculateConfidenceIntervals(dimensions, expectedErrors);

    // Step 4: Calculate Overall Mathematical Confidence Score (0-100%)
    const rawConf = amsfeOutput.confidence !== undefined ? amsfeOutput.confidence * 100 : 92.5;
    const factorAvg = Object.values(qualityFactors).reduce((a, b) => a + b, 0) / Object.keys(qualityFactors).length;
    const confidencePct = Number((0.60 * rawConf + 0.40 * (factorAvg * 100)).toFixed(1));

    // Step 5: Assign Measurement Letter Grade & Standalone Reliability Index
    const grade = measurementGradeEngine.calculateGrade(confidencePct);
    const reliabilityIndex = measurementGradeEngine.calculateReliabilityIndex(qualityFactors, amsfeOutput);

    // Step 6: Generate Measurement Explanations
    const explanations = this.generateExplanations(qualityFactors, amsfeOutput, confidencePct);

    // Step 7: Generate Dynamic Recommendations
    const recommendations = this.generateRecommendations(qualityFactors, amsfeOutput, dimensions);

    // Construct Complete Output Payload
    const evaluationPayload = {
      timestamp: Date.now(),
      confidencePct,
      grade,
      reliabilityIndex,
      dimensions,
      expectedErrors,
      percentageErrors,
      confidenceIntervals,
      qualityFactors,
      errorContributors,
      explanations,
      recommendations,
      amsfeSummary: {
        activeSensorCount: amsfeOutput.activeSensorCount || 4,
        rejectedCount: (amsfeOutput.rejectedMeasurements || []).length,
        weights: amsfeOutput.weights || {}
      }
    };

    // Log Telemetry
    confidenceTelemetryEngine.logCycle(evaluationPayload);
    this.lastEvaluation = evaluationPayload;

    return evaluationPayload;
  }

  /**
   * Generate "Confidence increased because..." & "Confidence decreased because..." explanations
   */
  generateExplanations(factors, amsfeOutput, confidencePct) {
    const positive = [];
    const negative = [];

    if (factors.pointCloudDensity > 0.6) positive.push('Dense 3D LiDAR point cloud available');
    if (factors.referenceMarkerQuality > 0.8) positive.push('Reference marker detected & scale matched');
    if (factors.cameraStability > 0.85) positive.push('Stable device orientation (low IMU jitter)');
    if (factors.aiConfidence > 0.90) positive.push(`High AI tree detection score (${(factors.aiConfidence * 100).toFixed(0)}%)`);

    if (factors.lightingQuality < 0.6) negative.push('Insufficient ambient lighting in scene');
    if (factors.cameraStability < 0.7) negative.push('Device motion / jitter detected during scan');
    if (factors.gpsAccuracy < 0.6) negative.push('GPS location accuracy exceeds 8 meters');
    if (factors.occlusion < 0.8) negative.push('Partial trunk/canopy occlusion detected');
    if ((amsfeOutput.rejectedMeasurements || []).length > 0) {
      negative.push(`${amsfeOutput.rejectedMeasurements.length} sensor reading(s) rejected as statistical outliers`);
    }

    return { positive, negative };
  }

  /**
   * Generate dynamic actionable recommendations based on detected weaknesses
   */
  generateRecommendations(factors, amsfeOutput, dimensions) {
    const recs = [];

    if (dimensions.distance > 15) {
      recs.push({ action: 'Move 2-3 meters closer to the tree', impact: '+5% Confidence', icon: 'move-left' });
    }
    if (factors.cameraStability < 0.80) {
      recs.push({ action: 'Hold phone steady or mount on tripod', impact: '+8% Reliability', icon: 'smartphone' });
    }
    if (factors.lightingQuality < 0.60) {
      recs.push({ action: 'Increase ambient scene lighting or adjust angle', impact: '+6% Sharpness', icon: 'sun' });
    }
    if (factors.referenceMarkerQuality < 0.50) {
      recs.push({ action: 'Place a standard reference marker on tree trunk', impact: '+10% Scale Accuracy', icon: 'qr-code' });
    }
    if (factors.pointCloudDensity < 0.40) {
      recs.push({ action: 'Enable LiDAR Point Cloud import for 3D spatial precision', impact: '+12% Confidence', icon: 'radar' });
    }
    if (recs.length === 0) {
      recs.push({ action: 'Optimal scan conditions met. Proceed to save entry.', impact: 'High Precision', icon: 'check-circle' });
    }

    return recs;
  }

  /**
   * Retrieve last prediction payload
   */
  getLastEvaluation() {
    return this.lastEvaluation;
  }
}

export const CEPE = new ConfidenceAndErrorPredictionEngine();
