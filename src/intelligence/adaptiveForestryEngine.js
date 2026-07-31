/**
 * adaptiveForestryEngine.js - Central Adaptive Forestry Intelligence Engine (AFIE)
 * 
 * Central Orchestrator & Brain of Porta-TLS:
 * - Accepts CMME, CEPE, AMSFE, species, and environmental inputs
 * - Profiles environment & species
 * - Analyzes tree morphology
 * - Selects primary & secondary biomass models
 * - Executes multi-model biomass fusion & agreement scoring
 * - Predicts 1-Yr, 3-Yr, 5-Yr growth trajectories
 * - Evaluates knowledge rules & field recommendations
 * - Logs immutable decision traces
 * - Returns authoritative AFIE Intelligence Report
 */

import { SpeciesProfiler } from './speciesProfiler.js';
import { EnvironmentProfiler } from './environmentProfiler.js';
import { MorphologyAnalyzer } from './morphologyAnalyzer.js';
import { ModelSelector } from './modelSelector.js';
import { AdaptiveBiomassEngine } from './adaptiveBiomass.js';
import { GrowthPredictor } from './growthPredictor.js';
import { KnowledgeEngine } from './knowledgeEngine.js';
import { RecommendationEngine } from './recommendationEngine.js';
import { DecisionLogger } from './decisionLogger.js';

export class AdaptiveForestryEngine {
  constructor() {
    this.speciesProfiler = new SpeciesProfiler();
    this.environmentProfiler = new EnvironmentProfiler();
    this.morphologyAnalyzer = new MorphologyAnalyzer();
    this.modelSelector = new ModelSelector();
    this.adaptiveBiomass = new AdaptiveBiomassEngine();
    this.growthPredictor = new GrowthPredictor();
    this.knowledgeEngine = new KnowledgeEngine();
    this.recommendationEngine = new RecommendationEngine();
    this.decisionLogger = new DecisionLogger();

    this.latestReport = null;
  }

  /**
   * Run central AFIE intelligence pipeline
   * @param {Object} context - { speciesId, height, dbh, cmmeConsensus, cepeReport, amsfeFused, gpsContext, cameraContext, envOverride }
   * @returns {Object} Complete AFIE Intelligence Report
   */
  processIntelligence(context = {}) {
    const species = this.speciesProfiler.getProfile(context.speciesId || 'generic_hardwood');
    const environment = this.environmentProfiler.classifyEnvironment(context.gpsContext || {}, context.envOverride);
    
    const height = context.cmmeConsensus?.consensus?.height || context.height || 15.0;
    const dbh = context.cmmeConsensus?.consensus?.dbh || context.dbh || 40.0;

    // Morphology
    const morphology = this.morphologyAnalyzer.analyze(height, dbh, context.cameraContext || {}, species);

    // Model Selection
    const models = this.modelSelector.selectModels(species, environment, morphology, context.cmmeConsensus);

    // Biomass Fusion
    const biomassFusion = this.adaptiveBiomass.fuseBiomass(height, dbh, species, models);

    // Growth Prediction
    const growthProjections = this.growthPredictor.predictGrowth(
      height,
      dbh,
      biomassFusion.consensusBiomass,
      biomassFusion.consensusCarbon,
      species
    );

    // Knowledge Rules & Inferences
    const knowledgeInferences = this.knowledgeEngine.evaluateRules({
      speciesProfile: species,
      morphology,
      cmmeConsensus: context.cmmeConsensus,
      envProfile: environment,
      hasPointCloud: !!context.hasPointCloud
    });

    // Actionable Recommendations
    const recommendations = this.recommendationEngine.generateRecommendations({
      cepeReport: context.cepeReport,
      cmmeConsensus: context.cmmeConsensus,
      morphology,
      envContext: context.envContext,
      hasPointCloud: !!context.hasPointCloud
    });

    const report = {
      sessionId: `AFIE-RPT-${Date.now()}`,
      timestamp: Date.now(),
      species,
      environment,
      morphology,
      models,
      biomassFusion,
      growthProjections,
      knowledgeInferences,
      recommendations
    };

    // Log decision trace
    this.decisionLogger.logDecision(report);

    this.latestReport = report;
    return report;
  }

  /**
   * Get latest intelligence report
   */
  getLatestReport() {
    return this.latestReport;
  }
}

// Export Singleton Instance
export const AFIE = new AdaptiveForestryEngine();
