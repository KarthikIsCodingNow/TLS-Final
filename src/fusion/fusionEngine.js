/**
 * fusionEngine.js - Central Adaptive Multi-Sensor Fusion Engine (AMSFE) Architecture
 * 
 * Replaces independent measurement output across Porta-TLS with a unified,
 * statistically weighted, outlier-rejected multi-sensor fusion pipeline.
 * 
 * Flow:
 * Camera → AI Detection / Edge / Manual / Clinometer / Marker / GPS / PointCloud
 * ↓
 * AMSFE (Quality Scoring → MAD Outlier Filter → Adaptive Reweighting → Variance Fusion)
 * ↓
 * Final Fused Output (Height, DBH, Distance, Biomass, Carbon, Confidence, Uncertainty)
 */

import { confidenceEngine } from './confidenceEngine.js';
import { sensorWeightsEngine } from './sensorWeights.js';
import { fusionMathEngine } from './fusionMath.js';
import { fusionTelemetryEngine } from './fusionTelemetry.js';
import { measurementHistoryEngine } from './measurementHistory.js';

export class AdaptiveMultiSensorFusionEngine {
  constructor() {
    this.registeredSensors = new Map();
    this.lastFusedResult = null;

    // Register standard default sensor plugins
    this.registerDefaultSensors();
  }

  /**
   * Register a new pluggable sensor source dynamically
   * @param {string} sensorId Unique identifier (e.g. 'lidar_stereo', 'ultrasonic')
   * @param {Function|Object} sourceHandler Handler function or sensor metadata object
   */
  registerSensor(sensorId, sourceHandler) {
    if (!sensorId) return;
    this.registeredSensors.set(sensorId, {
      id: sensorId,
      handler: sourceHandler,
      registeredAt: Date.now()
    });
  }

  /**
   * Register baseline system sensor types
   */
  registerDefaultSensors() {
    ['manual', 'ai', 'clinometer', 'marker', 'pointcloud', 'gps'].forEach(type => {
      this.registerSensor(type, { type, description: `Built-in ${type} sensor provider` });
    });
  }

  /**
   * Normalize an incoming sensor reading to standardized format:
   * { type, height, distance, dbh, confidence, timestamp, metadata }
   * @param {Object} item 
   * @returns {Object} Standardized sensor reading
   */
  standardizeSensorReading(item) {
    if (!item) return null;

    return {
      type: item.type || 'unknown',
      height: typeof item.height === 'number' && item.height > 0 ? Number(item.height) : null,
      distance: typeof item.distance === 'number' && item.distance > 0 ? Number(item.distance) : null,
      dbh: typeof item.dbh === 'number' && item.dbh > 0 ? Number(item.dbh) : null,
      confidence: typeof item.confidence === 'number' ? Math.max(0.01, Math.min(1.0, item.confidence)) : 0.8,
      timestamp: item.timestamp || Date.now(),
      metadata: item.metadata || {}
    };
  }

  /**
   * Core multi-sensor fusion computation pipeline
   * @param {Array<Object>} sensorInputs Array of sensor reading objects or map of type -> measurement
   * @param {Object} envContext Environmental factors (cameraStability, lightingQuality, edgeSharpness, etc.)
   * @returns {Object} Authoritative Fused Output Object
   */
  fuseMeasurements(sensorInputs = [], envContext = {}) {
    const startTime = performance.now();

    // Flatten array or object inputs into standardized array
    let rawList = [];
    if (Array.isArray(sensorInputs)) {
      rawList = sensorInputs;
    } else if (typeof sensorInputs === 'object' && sensorInputs !== null) {
      rawList = Object.values(sensorInputs);
    }

    const standardizedReadings = rawList
      .map(item => this.standardizeSensorReading(item))
      .filter(item => item !== null);

    if (standardizedReadings.length === 0) {
      // Fallback response if no sensor measurements are active
      return this.createEmptyResult();
    }

    // Step 1: Calculate dynamic Sensor Quality Scores (0.0 to 1.0)
    const evaluatedSensors = standardizedReadings.map(sensor => {
      const qualityScore = confidenceEngine.calculateSensorQuality(sensor, envContext);
      return { sensor, qualityScore };
    });

    // Step 2: Outlier Detection using MAD & Modified Z-Score
    const heightOutlierCheck = fusionMathEngine.detectOutliers(evaluatedSensors, 'height', 3.5);
    const dbhOutlierCheck = fusionMathEngine.detectOutliers(evaluatedSensors, 'dbh', 3.5);
    const distOutlierCheck = fusionMathEngine.detectOutliers(evaluatedSensors, 'distance', 3.5);

    // Combine rejected outlier items
    const allRejected = [
      ...heightOutlierCheck.rejected,
      ...dbhOutlierCheck.rejected,
      ...distOutlierCheck.rejected
    ];

    // Filter accepted items (exclude sensors rejected in height or dbh)
    const rejectedTypes = new Set(allRejected.map(r => r.type));
    const validSensors = evaluatedSensors.filter(item => !rejectedTypes.has(item.sensor.type));

    // If all sensors were rejected (unlikely), fall back to highest quality single sensor
    const activeSensors = validSensors.length > 0 ? validSensors : [evaluatedSensors.sort((a, b) => b.qualityScore - a.qualityScore)[0]];

    // Step 3: Calculate Adaptive Weights (sum to 1.0)
    const weights = sensorWeightsEngine.calculateWeights(activeSensors, envContext);

    // Step 4: Perform Weighted Fusion for Height, DBH, Distance
    const fusedHeight = fusionMathEngine.computeWeightedValue(activeSensors, weights, 'height');
    const fusedDbh = fusionMathEngine.computeWeightedValue(activeSensors, weights, 'dbh');
    const fusedDistance = fusionMathEngine.computeWeightedValue(activeSensors, weights, 'distance');

    // Step 5: Compute Overall Confidence & System Uncertainty
    const { fusedConfidence, uncertainty } = fusionMathEngine.computeConfidenceAndUncertainty(activeSensors, weights);

    // Step 6: Recalculate Species-Aware Biomass & Carbon from Fused Metrics
    const woodDensity = envContext.woodDensity || 0.6;
    const { biomassKg, carbonKg } = fusionMathEngine.calculateBiomassAndCarbon(fusedDbh, fusedHeight, woodDensity);

    // Build Sensor Breakdown map
    const sensorBreakdown = {};
    evaluatedSensors.forEach(item => {
      sensorBreakdown[item.sensor.type] = Number((item.qualityScore * 100).toFixed(1));
    });

    const endTime = performance.now();
    const latencyMs = Number((endTime - startTime).toFixed(2));

    // Construct Authoritative Final Output Object
    const finalOutput = {
      height: fusedHeight,
      distance: fusedDistance,
      dbh: fusedDbh,
      biomass: biomassKg,
      carbon: carbonKg,
      confidence: fusedConfidence,
      uncertainty,
      sensorBreakdown,
      weights,
      rejectedMeasurements: allRejected,
      timestamp: Date.now(),
      latencyMs,
      activeSensorCount: activeSensors.length
    };

    // Step 7: Record Telemetry & Rolling History
    fusionTelemetryEngine.logCycle({
      ...finalOutput,
      activeSensorTypes: activeSensors.map(s => s.sensor.type),
      qualityBreakdown: sensorBreakdown
    });

    measurementHistoryEngine.recordCycle(finalOutput);

    this.lastFusedResult = finalOutput;
    return finalOutput;
  }

  /**
   * Helper fallback when no sensors are active
   */
  createEmptyResult() {
    return {
      height: 0,
      distance: 0,
      dbh: 0,
      biomass: 0,
      carbon: 0,
      confidence: 0,
      uncertainty: 0,
      sensorBreakdown: {},
      weights: {},
      rejectedMeasurements: [],
      timestamp: Date.now(),
      latencyMs: 0,
      activeSensorCount: 0
    };
  }

  /**
   * Retrieve last computed fused measurement
   */
  getLastResult() {
    return this.lastFusedResult || this.createEmptyResult();
  }
}

export const AMSFE = new AdaptiveMultiSensorFusionEngine();
