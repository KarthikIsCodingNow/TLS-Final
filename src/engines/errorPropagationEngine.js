/**
 * PORTA-TLS Partial-Derivative Uncertainty Propagation & Sensitivity Analysis Engine
 * Version 2.1 Architectural Baseline - Task 7 Extension
 */

/**
 * Propagate uncertainty for Clinometer Distance estimation (Requirement 7)
 * d = h_cam / tan(theta_base)
 */
export function propagateDistanceUncertainty(
  distanceM,
  baseAngleDeg,
  sensorStdDevDeg = 0.05,
  cameraHeightM = 1.45,
  cameraHeightErrM = 0.03,
  calibFactorErr = 0.02
) {
  if (distanceM <= 0) return { distanceErr: 0.2 };

  const thetaRad = Math.abs(baseAngleDeg || 15) * (Math.PI / 180);
  const sinTheta = Math.sin(thetaRad);

  if (sinTheta <= 0.01) return { distanceErr: 1.0 };

  const sigmaThetaRad = (sensorStdDevDeg || 0.05) * (Math.PI / 180);

  // Partial derivatives
  // dd / dh_cam = 1 / tan(theta)
  const dd_dh = 1.0 / Math.tan(thetaRad);
  
  // dd / dtheta = - h_cam / (sin^2(theta))
  const dd_dtheta = - cameraHeightM / (sinTheta * sinTheta);

  // Variance components
  const varHeight = Math.pow(dd_dh * cameraHeightErrM, 2);
  const varPitch = Math.pow(dd_dtheta * sigmaThetaRad, 2);
  const varCalib = Math.pow(distanceM * calibFactorErr, 2);

  const totalVar = varHeight + varPitch + varCalib;
  const distanceErr = Math.sqrt(totalVar);

  return {
    distanceErr: parseFloat(Math.max(0.1, distanceErr).toFixed(2)),
    varComponents: { varHeight, varPitch, varCalib }
  };
}

/**
 * Propagate uncertainty for Tree Height estimation (Requirement 7)
 * H = d * (tan(theta_top) - tan(theta_base))
 */
export function propagateHeightUncertainty(
  heightM,
  distanceM,
  distanceErrM,
  baseAngleDeg,
  topAngleDeg,
  sensorStdDevDeg = 0.05
) {
  if (heightM <= 0 || distanceM <= 0) return { heightErr: 0.3 };

  const thetaBaseRad = (baseAngleDeg || 0) * (Math.PI / 180);
  const thetaTopRad = (topAngleDeg || 30) * (Math.PI / 180);
  const sigmaThetaRad = (sensorStdDevDeg || 0.05) * (Math.PI / 180);

  // Partial derivatives
  // dH / dd = tan(top) - tan(base)
  const dH_dd = Math.tan(thetaTopRad) - Math.tan(thetaBaseRad);
  
  // dH / dtheta_top = d * sec^2(top)
  const cosTop = Math.cos(thetaTopRad);
  const dH_dtop = distanceM / Math.max(0.01, cosTop * cosTop);

  // dH / dtheta_base = - d * sec^2(base)
  const cosBase = Math.cos(thetaBaseRad);
  const dH_dbase = - distanceM / Math.max(0.01, cosBase * cosBase);

  // Variance components
  const varDistance = Math.pow(dH_dd * distanceErrM, 2);
  const varTopPitch = Math.pow(dH_dtop * sigmaThetaRad, 2);
  const varBasePitch = Math.pow(dH_dbase * sigmaThetaRad, 2);

  const totalVar = varDistance + varTopPitch + varBasePitch;
  const heightErr = Math.sqrt(totalVar);

  return {
    heightErr: parseFloat(Math.max(0.15, heightErr).toFixed(2)),
    varComponents: { varDistance, varTopPitch, varBasePitch }
  };
}

/**
 * Propagate uncertainty for Trunk DBH estimation (Requirement 7)
 */
export function propagateDbhUncertainty(
  dbhCm,
  distanceM,
  distanceErrM,
  hfovDeg = 60,
  hfovErrDeg = 0.5,
  manualAlignmentErrPct = 0.03
) {
  if (dbhCm <= 0 || distanceM <= 0) return { dbhErr: 1.5 };

  const relDistErr = distanceErrM / distanceM;
  const relHfovErr = hfovErrDeg / (hfovDeg || 60);

  const relDbhErr = Math.sqrt(
    Math.pow(relDistErr, 2) +
    Math.pow(relHfovErr, 2) +
    Math.pow(manualAlignmentErrPct, 2)
  );

  const dbhErr = dbhCm * relDbhErr;
  return {
    dbhErr: parseFloat(Math.max(0.5, dbhErr).toFixed(1))
  };
}

/**
 * Propagate uncertainty for AGB Biomass and CO2 Equivalent (Requirement 7)
 * AGB = 0.0673 * (rho * DBH^2 * H)^0.976
 * CO2 = AGB * 0.5 * 3.67
 */
export function propagateBiomassAndCo2Uncertainty(
  agbKg,
  co2Kg,
  heightM,
  heightErrM,
  dbhCm,
  dbhErrCm,
  density = 0.65,
  densityErr = 0.04
) {
  if (agbKg <= 0 || heightM <= 0 || dbhCm <= 0) {
    return { agbErr: 15.0, co2Err: 27.5 };
  }

  const relDensityErr = densityErr / density;
  const relDbhErr = dbhErrCm / dbhCm;
  const relHeightErr = heightErrM / heightM;

  // Partial derivative relative error formulation for AGB
  const relAgbErr = 0.976 * Math.sqrt(
    Math.pow(relDensityErr, 2) +
    Math.pow(2 * relDbhErr, 2) +
    Math.pow(relHeightErr, 2)
  );

  const agbErr = agbKg * relAgbErr;
  const co2Err = agbErr * 0.5 * 3.67;

  return {
    agbErr: parseFloat(Math.max(2.0, agbErr).toFixed(1)),
    co2Err: parseFloat(Math.max(3.5, co2Err).toFixed(1))
  };
}

/**
 * Perform Variance Sensitivity Analysis (Requirement 8)
 * Returns breakdown percentages summing to 100%
 */
export function computeSensitivityBreakdown({
  distanceErrM = 0.4,
  sensorStdDevDeg = 0.05,
  hfovErrDeg = 0.5,
  manualAlignPct = 0.03
}) {
  // Normalize metrics into variance impact weights
  const distImpact = Math.pow(distanceErrM * 10, 2);
  const pitchImpact = Math.pow(sensorStdDevDeg * 120, 2);
  const hfovImpact = Math.pow(hfovErrDeg * 8, 2);
  const alignImpact = Math.pow(manualAlignPct * 200, 2);

  const sum = distImpact + pitchImpact + hfovImpact + alignImpact || 1.0;

  const distancePct = Math.round((distImpact / sum) * 100);
  const pitchPct = Math.round((pitchImpact / sum) * 100);
  const hfovPct = Math.round((hfovImpact / sum) * 100);
  let alignPct = 100 - (distancePct + pitchPct + hfovPct);
  if (alignPct < 0) alignPct = 0;

  return {
    distanceErrorPct: distancePct,
    pitchErrorPct: pitchPct,
    hfovErrorPct: hfovPct,
    manualAlignmentPct: alignPct
  };
}
