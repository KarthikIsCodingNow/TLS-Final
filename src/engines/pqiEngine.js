/**
 * PORTA-TLS Proprietary Quality Index (PQI) Engine
 * Task 11: Original PORTA Quality Index metric (0-100 scale).
 */

export class PQIEngine {
  constructor() {
    this.name = 'PQIEngine';
    this.version = 'v1.0.0-proprietary';
  }

  /**
   * Compute PORTA Quality Index (0 - 100)
   */
  calculatePQI(inputs = {}) {
    const {
      lightingLux = 450,
      calibrationAgeDays = 2,
      sensorStability = 0.92,
      detectionScore = 0.88,
      disagreementIndex = 0.05,
      weatherCondition = 'Clear',
      repeatabilityScore = 0.94
    } = inputs;

    // 1. Lighting Factor (0-15 pts)
    const lightingFactor = Math.min(15, (lightingLux / 500) * 15);

    // 2. Calibration Recency Factor (0-20 pts)
    const calFactor = Math.max(0, 20 - calibrationAgeDays * 0.5);

    // 3. Sensor Stability Factor (0-15 pts)
    const sensorFactor = sensorStability * 15;

    // 4. AI Detection Factor (0-15 pts)
    const detectionFactor = detectionScore * 15;

    // 5. Estimator Agreement Factor (0-15 pts)
    const agreementFactor = (1.0 - Math.min(1.0, disagreementIndex * 3)) * 15;

    // 6. Environmental Factor (0-10 pts)
    const envFactor = weatherCondition === 'Clear' ? 10 : 6;

    // 7. Repeatability Factor (0-10 pts)
    const repFactor = repeatabilityScore * 10;

    const pqi = Math.round(lightingFactor + calFactor + sensorFactor + detectionFactor + agreementFactor + envFactor + repFactor);
    const clampedPqi = Math.max(0, Math.min(100, pqi));

    let rating = 'FAIR';
    if (clampedPqi >= 90) rating = 'EXCELLENT (GRADE A+)';
    else if (clampedPqi >= 75) rating = 'GOOD (RESEARCH GRADE)';
    else if (clampedPqi >= 60) rating = 'SATISFACTORY';
    else rating = 'POOR (RE-SCAN RECOMMENDED)';

    return {
      pqi: clampedPqi,
      rating,
      breakdown: {
        lightingFactor: Number(lightingFactor.toFixed(1)),
        calFactor: Number(calFactor.toFixed(1)),
        sensorFactor: Number(sensorFactor.toFixed(1)),
        detectionFactor: Number(detectionFactor.toFixed(1)),
        agreementFactor: Number(agreementFactor.toFixed(1)),
        envFactor: Number(envFactor.toFixed(1)),
        repFactor: Number(repFactor.toFixed(1))
      },
      formula: 'PQI = sum(SubFactors) in [0, 100]'
    };
  }
}
