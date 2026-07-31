/**
 * PORTA-TLS Environmental Condition Assessment & Confidence Penalty Engine
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

/**
 * Assess environmental factors (wind, rain, fog, lighting) and calculate confidence penalties (Requirement 14)
 * @param {number} luminance Mean frame luminance (0-255)
 * @param {number} contrast RMS contrast
 * @param {string} weatherText User weather report ('Clear', 'Windy', 'Rain', 'Fog')
 */
export function evaluateEnvironmentalConditions(luminance = 120, contrast = 45, weatherText = 'Clear') {
  let score = 100;
  const warnings = [];

  // Low Light / Backlighting check
  if (luminance < 40) {
    score -= 25;
    warnings.push('Low Light - Reduced contrast');
  } else if (luminance > 220) {
    score -= 20;
    warnings.push('Strong Direct Sunlight / Overexposure');
  }

  if (contrast < 20) {
    score -= 20;
    warnings.push('Low RMS Contrast / Fog / Haze');
  }

  // Weather report penalties
  const wLower = (weatherText || '').toLowerCase();
  if (wLower.includes('wind')) {
    score -= 15;
    warnings.push('Wind detected - Canopy motion blur risk');
  }
  if (wLower.includes('rain') || wLower.includes('fog')) {
    score -= 25;
    warnings.push('Precipitation / Fog - Optical scattering');
  }

  const isSuitable = score >= 50;

  return {
    environmentalScorePct: Math.max(0, score),
    confidenceMultiplier: parseFloat((score / 100.0).toFixed(2)),
    isSuitable,
    warnings
  };
}
