/**
 * PORTA-TLS 6-Component Advanced Error Decomposition Model
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

/**
 * Decompose total measurement uncertainty into 6 distinct physical sources (Requirement 13)
 * @param {number} distanceError Total distance uncertainty (m)
 * @param {number} heightError Total height uncertainty (m)
 * @param {number} pitchNoise IMU noise standard dev (deg)
 */
export function decomposeMeasurementError(distanceError = 0.2, heightError = 0.3, pitchNoise = 0.08) {
  const varDist = Math.pow(distanceError, 2);
  const varHeight = Math.pow(heightError, 2);
  const totalVar = varDist + varHeight;

  // Physical variance allocation model
  const randomVar = totalVar * 0.25;
  const systematicVar = totalVar * 0.20;
  const sensorVar = totalVar * (0.15 + (pitchNoise * 0.5));
  const userVar = totalVar * 0.15;
  const environmentalVar = totalVar * 0.15;
  const modelVar = totalVar * 0.10;

  const allocatedTotal = randomVar + systematicVar + sensorVar + userVar + environmentalVar + modelVar;

  return {
    totalUncertainty: parseFloat(Math.sqrt(totalVar).toFixed(2)),
    components: {
      randomError: parseFloat(Math.sqrt(randomVar).toFixed(2)),
      systematicError: parseFloat(Math.sqrt(systematicVar).toFixed(2)),
      sensorError: parseFloat(Math.sqrt(sensorVar).toFixed(2)),
      userError: parseFloat(Math.sqrt(userVar).toFixed(2)),
      environmentalError: parseFloat(Math.sqrt(environmentalVar).toFixed(2)),
      modelError: parseFloat(Math.sqrt(modelVar).toFixed(2))
    },
    percentages: {
      randomPct: parseFloat(((randomVar / allocatedTotal) * 100).toFixed(1)),
      systematicPct: parseFloat(((systematicVar / allocatedTotal) * 100).toFixed(1)),
      sensorPct: parseFloat(((sensorVar / allocatedTotal) * 100).toFixed(1)),
      userPct: parseFloat(((userVar / allocatedTotal) * 100).toFixed(1)),
      environmentalPct: parseFloat(((environmentalVar / allocatedTotal) * 100).toFixed(1)),
      modelPct: parseFloat(((modelVar / allocatedTotal) * 100).toFixed(1))
    }
  };
}
