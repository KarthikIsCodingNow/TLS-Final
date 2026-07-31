/**
 * frameCollector.js - Multi-Frame Data Collector for CMME
 * 
 * Collects N independent measurement cycles produced by AMSFE & CEPE.
 * Each cycle captures:
 * - Height, Distance, DBH, Biomass, Carbon
 * - AMSFE Fused Metrics & Active Sensor Weight Vectors
 * - CEPE Quality Factors, Confidence %, Grade, Reliability Index
 * - Timestamp & Frame ID
 */

export class FrameCollector {
  constructor(targetFrameCount = 10) {
    this.targetFrameCount = targetFrameCount; // Default 10 (configurable to 5, 10, 20)
    this.frames = [];
    this.status = 'idle'; // 'idle' | 'collecting' | 'completed' | 'cancelled'
    this.onProgressCallback = null;
    this.onCompleteCallback = null;
  }

  /**
   * Set target number of frames to collect (5, 10, 20)
   * @param {number} count 
   */
  setTargetFrameCount(count) {
    if ([5, 10, 20].includes(Number(count))) {
      this.targetFrameCount = Number(count);
    }
  }

  /**
   * Start a new frame collection session
   */
  startCollection() {
    this.frames = [];
    this.status = 'collecting';
  }

  /**
   * Add a single measurement cycle frame from AMSFE & CEPE output
   * @param {Object} amsfeFused - Output from AMSFE.fuseMeasurements()
   * @param {Object} cepeReport - Output from CEPE.predictConfidence()
   * @param {Object} envContext - Active environmental context
   * @returns {Object} Added frame object with frame index and progress
   */
  addFrame(amsfeFused, cepeReport, envContext = {}) {
    if (this.status !== 'collecting') {
      this.startCollection();
    }

    const frameId = `FRAME-${Date.now()}-${this.frames.length + 1}`;
    const frameIndex = this.frames.length + 1;

    const frame = {
      frameIndex,
      frameId,
      timestamp: Date.now(),
      dimensions: {
        height: amsfeFused?.height || 0,
        distance: amsfeFused?.distance || 0,
        dbh: amsfeFused?.dbh || 0,
        biomass: amsfeFused?.biomass || 0,
        carbon: amsfeFused?.carbon || 0
      },
      amsfe: {
        fused: amsfeFused,
        weights: amsfeFused?.weights || {},
        uncertainty: amsfeFused?.uncertainty || 0,
        confidence: amsfeFused?.confidence || 0,
        rejectedSensors: amsfeFused?.rejectedMeasurements || []
      },
      cepe: {
        confidencePct: cepeReport?.confidencePct || 0,
        grade: cepeReport?.grade?.grade || 'D',
        reliabilityIndex: cepeReport?.reliabilityIndex || 0,
        intervals: cepeReport?.confidenceIntervals || {},
        factors: cepeReport?.qualityMetrics?.factors || {}
      },
      envContext: { ...envContext },
      status: 'pending' // 'pending' | 'valid' | 'suspicious' | 'rejected'
    };

    this.frames.push(frame);

    const progress = {
      current: this.frames.length,
      total: this.targetFrameCount,
      percent: Math.min(100, Math.round((this.frames.length / this.targetFrameCount) * 100)),
      isComplete: this.frames.length >= this.targetFrameCount
    };

    if (this.onProgressCallback) {
      this.onProgressCallback(frame, progress);
    }

    if (progress.isComplete) {
      this.status = 'completed';
      if (this.onCompleteCallback) {
        this.onCompleteCallback(this.frames);
      }
    }

    return { frame, progress };
  }

  /**
   * Check if collector has reached target count
   */
  isComplete() {
    return this.frames.length >= this.targetFrameCount;
  }

  /**
   * Get all collected frames
   */
  getFrames() {
    return this.frames;
  }

  /**
   * Cancel ongoing collection session
   */
  cancelCollection() {
    this.status = 'cancelled';
    this.frames = [];
  }

  /**
   * Reset collector state
   */
  reset() {
    this.frames = [];
    this.status = 'idle';
  }
}
