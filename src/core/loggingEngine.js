/**
 * PORTA-TLS Scientific Research Log & Export Engine
 * Version 2.0 Architectural Baseline
 */
import { Logger } from './logger.js';

/**
 * Construct the detailed scientific research metadata payload
 */
export function compileResearchPayload(stateObject) {
  Logger.info('Compiling scientific research calculation records');
  
  return {
    timestamp: new Date().toISOString(),
    gps: {
      lat: stateObject.telemetry.gps.lat,
      lon: stateObject.telemetry.gps.lon,
      accuracy: stateObject.telemetry.gps.accuracy,
      status: stateObject.telemetry.gps.status
    },
    calibration: {
      hfov: stateObject.calibration.hfov,
      vfov: stateObject.calibration.vfov,
      sensorWidth: stateObject.calibration.sensorWidth,
      sensorHeight: stateObject.calibration.sensorHeight,
      focalLength: stateObject.calibration.focalLength,
      cameraHeight: stateObject.calibration.cameraHeight
    },
    terrain: {
      slopeAngleDeg: stateObject.measurement.slopeAngle
    },
    sensors: {
      rawPitchDeg: stateObject.sensors.pitch,
      filteredPitchDeg: stateObject.sensors.filteredPitch,
      filterType: stateObject.settings.activePitchFilter
    },
    caliperDragPercents: {
      left: stateObject.calibration.left,
      right: stateObject.calibration.right,
      top: stateObject.calibration.top,
      base: stateObject.calibration.base
    },
    uncertainties: {
      distanceErrorMeters: stateObject.measurement.live.distanceError,
      heightErrorMeters: stateObject.measurement.live.heightError,
      dbhErrorCm: stateObject.measurement.live.dbhError,
      agbErrorKg: stateObject.measurement.live.agbError,
      co2ErrorKg: stateObject.measurement.live.co2Error
    },
    confidenceScores: {
      distance: stateObject.measurement.live.distanceConfidence,
      height: stateObject.measurement.live.heightConfidence,
      dbh: stateObject.measurement.live.dbhConfidence,
      agb: stateObject.measurement.live.agbConfidence
    },
    intermediateCalculations: { ...stateObject.diagnostics.intermediateCalculations }
  };
}

/**
 * Generate extended scientific CSV file including all research metadata fields
 * @param {object[]} trees Array of tree records
 * @returns {string} Encoded CSV download URI
 */
export function exportScientificCSV(trees) {
  Logger.info('Compiling scientific research CSV export');
  
  const baseHeaders = ['Tree ID', 'Species', 'Height (m)', 'Height Error (m)', 'DBH (cm)', 'DBH Error (cm)', 'AGB (kg)', 'AGB Error (kg)', 'CO2 (kg)', 'Lat', 'Lon', 'Timestamp'];
  const researchHeaders = ['Raw Pitch (deg)', 'Filtered Pitch (deg)', 'Slope Angle (deg)', 'HFOV (deg)', 'VFOV (deg)', 'Camera Height (m)', 'Focal Length (mm)', 'Distance Conf', 'Height Conf', 'DBH Conf', 'Overall Conf'];
  
  const headers = [...baseHeaders, ...researchHeaders];
  let csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';

  trees.forEach(t => {
    const r = t.researchData || {};
    const cal = r.calibration || {};
    const tr = r.terrain || {};
    const sens = r.sensors || {};
    const unc = r.uncertainties || {};
    const conf = r.confidenceScores || {};

    const row = [
      `"${t.id}"`,
      `"${t.species}"`,
      t.height,
      unc.heightErrorMeters !== undefined ? unc.heightErrorMeters : '',
      t.dbh,
      unc.dbhErrorCm !== undefined ? unc.dbhErrorCm : '',
      t.agb,
      unc.agbErrorKg !== undefined ? unc.agbErrorKg : '',
      t.co2,
      t.lat || '',
      t.lon || '',
      `"${t.timestamp}"`,
      sens.rawPitchDeg !== undefined ? sens.rawPitchDeg : '',
      sens.filteredPitchDeg !== undefined ? sens.filteredPitchDeg : '',
      tr.slopeAngleDeg !== undefined ? tr.slopeAngleDeg : '',
      cal.hfov !== undefined ? cal.hfov : '',
      cal.vfov !== undefined ? cal.vfov : '',
      cal.cameraHeight !== undefined ? cal.cameraHeight : '',
      cal.focalLength !== undefined ? cal.focalLength : '',
      conf.distance !== undefined ? conf.distance : '',
      conf.height !== undefined ? conf.height : '',
      conf.dbh !== undefined ? conf.dbh : '',
      t.confidence || ''
    ];

    csv += row.join(',') + '\n';
  });

  return encodeURI(csv);
}
