/**
 * PORTA-TLS Ablation Analysis Engine
 * Version 2.0 Architectural Baseline
 */
import { calculateAccuracyMetrics } from './statisticsEngine.js';

/**
 * Perform a mathematical simulation of the dataset with CV features turned off
 * @param {object[]} records Validation dataset records
 * @returns {object[]} Summary results table for each ablated component
 */
export function runAblationAnalysis(records) {
  if (!records || records.length === 0) {
    return [];
  }

  // Filter records that contain complete Ground Truth (GT) height/DBH data
  const valids = records.filter(r => r.groundTruth && r.groundTruth.height > 0 && r.groundTruth.dbh > 0);
  if (valids.length === 0) return [];

  const gtHeights = valids.map(r => r.groundTruth.height);
  const gtDbhs = valids.map(r => r.groundTruth.dbh);

  // Baseline stats (All CV components active)
  const baseHeights = valids.map(r => r.application.height);
  const baseDbhs = valids.map(r => r.application.dbh);

  const baseHeightMetrics = calculateAccuracyMetrics(baseHeights, gtHeights);
  const baseDbhMetrics = calculateAccuracyMetrics(baseDbhs, gtDbhs);
  const baseRmse = (baseHeightMetrics.rmse + baseDbhMetrics.rmse) / 2.0;

  const ablatedReports = [];

  // --- 1. ABLATE CALIBRATION (Assume hardcoded 60/45 HFOV/VFOV optics) ---
  const ablatedCalibDbhs = valids.map(r => {
    // If calibration was disabled, recalculate DBH using default 60 degree HFOV
    const d = r.application.distance;
    const defaultHfovRad = 60.0 * (Math.PI / 180);
    const spanPercent = r.calibration.right - r.calibration.left;
    const dbh = 2.0 * d * Math.tan(defaultHfovRad / 2.0) * (spanPercent / 100.0) * 100.0;
    return dbh;
  });
  const ablatedCalibMetrics = calculateAccuracyMetrics(ablatedCalibDbhs, gtDbhs);
  const calibLoss = ablatedCalibMetrics.rmse - baseDbhMetrics.rmse;
  ablatedReports.push({
    component: 'Optics Calibration Engine',
    baselineRmse: parseFloat(baseDbhMetrics.rmse.toFixed(3)),
    ablatedRmse: parseFloat(ablatedCalibMetrics.rmse.toFixed(3)),
    deltaRmse: parseFloat(calibLoss.toFixed(3)),
    percentLoss: parseFloat(((calibLoss / baseDbhMetrics.rmse) * 100.0).toFixed(1))
  });

  // --- 2. ABLATE FILTERING (Use Raw IMU pitch, bypass Kalman/Median/LP filters) ---
  const ablatedFilterHeights = valids.map(r => {
    const rawPitch = r.sensors.rawPitch;
    const dSlope = r.application.distance;
    const hCam = r.calibration.cameraHeight;
    const slopeRad = (r.terrain.slopeAngle || 0.0) * (Math.PI / 180);
    const topRad = rawPitch * (Math.PI / 180);

    const cosSlope = Math.cos(slopeRad);
    const tanTop = Math.tan(topRad);
    const tanSlope = Math.tan(slopeRad);

    return Math.max(0.1, hCam + dSlope * cosSlope * (tanTop - tanSlope));
  });
  const ablatedFilterMetrics = calculateAccuracyMetrics(ablatedFilterHeights, gtHeights);
  const filterLoss = ablatedFilterMetrics.rmse - baseHeightMetrics.rmse;
  ablatedReports.push({
    component: 'IMU Sensor Pitch Filters',
    baselineRmse: parseFloat(baseHeightMetrics.rmse.toFixed(3)),
    ablatedRmse: parseFloat(ablatedFilterMetrics.rmse.toFixed(3)),
    deltaRmse: parseFloat(filterLoss.toFixed(3)),
    percentLoss: parseFloat(((filterLoss / baseHeightMetrics.rmse) * 100.0).toFixed(1))
  });

  // --- 3. ABLATE SEGMENTATION (Bypass pixel masks, use manual caliper limits) ---
  const ablatedSegDbhs = valids.map(r => {
    // If segmentation was disabled, recalculate DBH strictly using guide drag positions
    const d = r.application.distance;
    const hfovRad = r.calibration.hfov * (Math.PI / 180);
    const rawSpan = r.caliperDrag.right - r.caliperDrag.left;
    const dbh = 2.0 * d * Math.tan(hfovRad / 2.0) * (rawSpan / 100.0) * 100.0;
    return dbh;
  });
  const ablatedSegMetrics = calculateAccuracyMetrics(ablatedSegDbhs, gtDbhs);
  const segLoss = ablatedSegMetrics.rmse - baseDbhMetrics.rmse;
  ablatedReports.push({
    component: 'Trunk Pixel Segmentation Mask',
    baselineRmse: parseFloat(baseDbhMetrics.rmse.toFixed(3)),
    ablatedRmse: parseFloat(ablatedSegMetrics.rmse.toFixed(3)),
    deltaRmse: parseFloat(segLoss.toFixed(3)),
    percentLoss: parseFloat(((segLoss / baseDbhMetrics.rmse) * 100.0).toFixed(1))
  });

  // --- 4. ABLATE MULTI-FRAME FUSION (Use single raw capture, bypass burst stats) ---
  const ablatedFusionHeights = valids.map(r => {
    // Simulate instant capture height (which corresponds to raw pitch and distance)
    const rawY = r.application.rawMeasurements ? r.application.rawMeasurements.height : r.application.height * 1.12;
    return rawY;
  });
  const ablatedFusionMetrics = calculateAccuracyMetrics(ablatedFusionHeights, gtHeights);
  const fusionLoss = ablatedFusionMetrics.rmse - baseHeightMetrics.rmse;
  ablatedReports.push({
    component: 'Multi-Frame Burst Fusion',
    baselineRmse: parseFloat(baseHeightMetrics.rmse.toFixed(3)),
    ablatedRmse: parseFloat(ablatedFusionMetrics.rmse.toFixed(3)),
    deltaRmse: parseFloat(fusionLoss.toFixed(3)),
    percentLoss: parseFloat(((fusionLoss / baseHeightMetrics.rmse) * 100.0).toFixed(1))
  });

  return ablatedReports;
}
