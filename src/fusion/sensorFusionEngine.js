/**
 * PORTA-TLS Weighted Sensor Fusion Engine
 * Version 2.3 Architectural Baseline - Task 9 Extension
 * Fuses Camera, Accelerometer, Gyroscope, Magnetometer, GPS, and Manual Inputs
 */

/**
 * Fuse multi-sensor measurement streams using inverse-variance weights (LMMSE)
 * @param {Array<{source: string, value: number, stdDev: number, confidence: number}>} sensorReadings
 */
export function fuseSensorReadings(sensorReadings) {
  if (!sensorReadings || sensorReadings.length === 0) {
    return { fusedValue: 0, fusedVariance: 1, overallConfidence: 0.5 };
  }

  const validReadings = sensorReadings.filter(r => typeof r.value === 'number' && !isNaN(r.value) && r.stdDev > 0);

  if (validReadings.length === 0) {
    return { fusedValue: sensorReadings[0].value || 0, fusedVariance: 1, overallConfidence: 0.5 };
  }

  let weightSum = 0;
  let weightedValSum = 0;
  let confSum = 0;

  validReadings.forEach(r => {
    const variance = Math.pow(r.stdDev, 2);
    const w = 1.0 / (variance || 1e-4);
    weightSum += w;
    weightedValSum += w * r.value;
    confSum += r.confidence * w;
  });

  const fusedValue = weightedValSum / weightSum;
  const fusedVariance = 1.0 / weightSum;
  const overallConfidence = parseFloat((confSum / weightSum).toFixed(3));

  return {
    fusedValue: parseFloat(fusedValue.toFixed(3)),
    fusedStdDev: parseFloat(Math.sqrt(fusedVariance).toFixed(3)),
    overallConfidence,
    contributions: validReadings.map(r => ({
      source: r.source,
      weightPct: parseFloat((((1.0 / Math.pow(r.stdDev, 2)) / weightSum) * 100).toFixed(1))
    }))
  };
}

export class UnifiedSensorFusionState {
  constructor() {
    this.state = {
      distance: 5.0,
      height: 12.0,
      pitch: 0.0,
      roll: 0.0,
      compass: 0.0,
      lat: 0.0,
      lon: 0.0,
      fusedConfidence: 0.85
    };
  }

  update(cameraDist, imuPitch, magCompass, gpsCoords, manualDist) {
    const distReadings = [
      { source: 'Camera Optics', value: cameraDist.value, stdDev: cameraDist.error || 0.3, confidence: cameraDist.confidence || 0.85 }
    ];
    if (manualDist && manualDist.value > 0) {
      distReadings.push({ source: 'Manual Reference', value: manualDist.value, stdDev: 0.05, confidence: 0.98 });
    }

    const fusedDist = fuseSensorReadings(distReadings);
    this.state.distance = fusedDist.fusedValue;
    this.state.fusedConfidence = fusedDist.overallConfidence;
    this.state.pitch = imuPitch;
    this.state.compass = magCompass;
    if (gpsCoords) {
      this.state.lat = gpsCoords.lat;
      this.state.lon = gpsCoords.lon;
    }

    return { ...this.state, distanceContributions: fusedDist.contributions };
  }
}
