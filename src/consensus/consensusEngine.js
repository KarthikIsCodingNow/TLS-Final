/**
 * consensusEngine.js - Central Consensus Multi-Frame Measurement Engine (CMME)
 * 
 * Central Orchestrator for CMME:
 * - Manages FrameCollector session lifecycle
 * - Runs OutlierDetector (MAD, Modified Z-Score, IQR)
 * - Evaluates StatisticalAnalysis (Mean, Median, Mode, Weighted Mean, SD, Variance, SE, 95% CIs)
 * - Evaluates StabilityMonitor & RepeatabilityEngine
 * - Computes Consensus Score (0-100), Auto-Retake Advisory, and Explanations Trace
 * - Logs session history into ConsensusTelemetry
 */

import { FrameCollector } from './frameCollector.js';
import { OutlierDetector } from './outlierDetector.js';
import { StatisticalAnalysis } from './statisticalAnalysis.js';
import { StabilityMonitor } from './stabilityMonitor.js';
import { RepeatabilityEngine } from './repeatabilityEngine.js';
import { ConsensusTelemetry } from './consensusTelemetry.js';

export class ConsensusEngine {
  constructor() {
    this.collector = new FrameCollector(10);
    this.outlierDetector = new OutlierDetector();
    this.statisticalAnalysis = new StatisticalAnalysis();
    this.stabilityMonitor = new StabilityMonitor();
    this.repeatabilityEngine = new RepeatabilityEngine();
    this.telemetry = new ConsensusTelemetry();
    
    this.latestReport = null;
  }

  /**
   * Set target frame collection count (5, 10, 20)
   * @param {number} count 
   */
  setTargetFrames(count) {
    this.collector.setTargetFrameCount(count);
  }

  /**
   * Process a single measurement frame produced by AMSFE & CEPE
   * @param {Object} amsfeFused 
   * @param {Object} cepeReport 
   * @param {Object} envContext 
   * @returns {Object} { frame, progress, consensusReport (if complete) }
   */
  processFrame(amsfeFused, cepeReport, envContext = {}) {
    const { frame, progress } = this.collector.addFrame(amsfeFused, cepeReport, envContext);
    
    // Evaluate consensus with current frames to check early convergence
    const currentFrames = this.collector.getFrames();
    const outlierResult = this.outlierDetector.evaluateFrames(currentFrames);
    const stats = this.statisticalAnalysis.analyze(outlierResult.acceptedFrames);
    const repeatability = this.repeatabilityEngine.evaluate(outlierResult.acceptedFrames, stats);

    let consensusReport = null;

    // Check early convergence or frame completion
    if (progress.isComplete || repeatability.convergence?.hasConverged) {
      consensusReport = this.finalizeConsensus(currentFrames, outlierResult, stats, repeatability);
      this.latestReport = consensusReport;
      this.telemetry.recordSession(consensusReport);
    }

    return {
      frame,
      progress,
      consensusReport,
      isConverged: repeatability.convergence?.hasConverged || false
    };
  }

  /**
   * Finalize multi-frame session and build authoritative consensus report
   */
  finalizeConsensus(allFrames, outlierResult, stats, repeatability) {
    const accepted = outlierResult.acceptedFrames;
    const stability = this.stabilityMonitor.evaluateStability(allFrames);

    // Compute weighted consensus dimensions (from statistical weighted mean)
    const consensusHeight = stats.height.weightedMean;
    const consensusDistance = stats.distance.weightedMean;
    const consensusDbh = stats.dbh.weightedMean;
    const consensusBiomass = stats.biomass.weightedMean;
    const consensusCarbon = stats.carbon.weightedMean;

    // Consensus Confidence & Reliability
    const avgConfidence = accepted.reduce((acc, f) => acc + f.cepe.confidencePct, 0) / (accepted.length || 1);
    const avgReliability = accepted.reduce((acc, f) => acc + f.cepe.reliabilityIndex, 0) / (accepted.length || 1);

    const consensusConfidence = Number(avgConfidence.toFixed(1));
    const consensusReliability = Number(avgReliability.toFixed(1));

    // Consensus Score (0 - 100)
    const acceptanceRatio = (accepted.length / (allFrames.length || 1)) * 100;
    const consensusScore = Number((
      0.35 * repeatability.repeatabilityScore +
      0.25 * consensusConfidence +
      0.20 * acceptanceRatio +
      0.20 * stability.overallStabilityScore
    ).toFixed(1));

    // Auto-Retake Recommendation Advisory
    const retakeAdvisory = this.generateRetakeAdvisory(consensusScore, outlierResult, repeatability);

    // Natural Language Explanation
    const explanation = this.generateExplanation(allFrames, outlierResult, stats, consensusScore, consensusConfidence);

    const sessionId = `CMME-SESS-${Date.now()}`;

    return {
      sessionId,
      timestamp: Date.now(),
      consensusScore,
      repeatabilityScore: repeatability.repeatabilityScore,
      consistencyIndex: repeatability.consistencyIndex,
      consensus: {
        height: consensusHeight,
        distance: consensusDistance,
        dbh: consensusDbh,
        biomass: consensusBiomass,
        carbon: consensusCarbon,
        confidencePct: consensusConfidence,
        reliabilityIndex: consensusReliability
      },
      summary: outlierResult.summary,
      statistics: stats,
      stability,
      repeatability,
      allFrames: outlierResult.classifiedFrames,
      acceptedFrames: outlierResult.acceptedFrames,
      rejectedFrames: outlierResult.rejectedFrames,
      retakeAdvisory,
      explanation
    };
  }

  /**
   * Generate Retake Advisory if Consensus Score is below threshold
   */
  generateRetakeAdvisory(consensusScore, outlierResult, repeatability) {
    const recommended = consensusScore < 82.0 || outlierResult.summary.rejected > (outlierResult.summary.total * 0.4);
    let reason = 'Consensus quality is high and repeatable.';

    if (recommended) {
      if (outlierResult.summary.rejected > (outlierResult.summary.total * 0.4)) {
        reason = `High frame rejection rate (${outlierResult.summary.rejected} of ${outlierResult.summary.total} frames rejected due to motion or range outliers).`;
      } else if (repeatability.repeatabilityScore < 75) {
        reason = `Low repeatability score (${repeatability.repeatabilityScore}/100) indicating unstable standoff distance or pitch wobble.`;
      } else {
        reason = `Overall Consensus Score (${consensusScore}/100) is below research threshold (82.0).`;
      }
    }

    return {
      recommended,
      threshold: 82.0,
      reason,
      action: recommended ? 'RETAKE MEASUREMENT RECOMMENDED' : 'MEASUREMENT CONSENSUS VALIDATED'
    };
  }

  /**
   * Generate natural language explanation trace
   */
  generateExplanation(allFrames, outlierResult, stats, consensusScore, consensusConfidence) {
    const total = allFrames.length;
    const accepted = outlierResult.acceptedFrames.length;
    const rejected = outlierResult.rejectedFrames.length;
    const hMean = stats.height.weightedMean.toFixed(2);
    const hSd = stats.height.stdDev.toFixed(2);

    let qualityTag = 'highly repeatable';
    if (consensusScore < 75) qualityTag = 'unstable / low confidence';
    else if (consensusScore < 88) qualityTag = 'moderately consistent';

    return `${total} measurement frames collected (${accepted} accepted, ${rejected} rejected). Consensus height ${hMean}m (SD ±${hSd}m) with ${consensusConfidence}% confidence and a Consensus Score of ${consensusScore}/100. Measurement considered ${qualityTag}.`;
  }

  /**
   * Get latest completed consensus report
   */
  getLatestReport() {
    return this.latestReport;
  }

  /**
   * Reset engine session
   */
  reset() {
    this.collector.reset();
    this.latestReport = null;
  }
}

// Export Singleton Instance
export const CMME = new ConsensusEngine();
