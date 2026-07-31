/**
 * PORTA-TLS Object Detection Interface
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';
import { CONFIG } from '../core/config.js';

class ObjectDetectionManager {
  constructor() {
    this.engines = {};
    this.activeEngine = 'coco_ssd';
  }

  registerEngine(name, engineInstance) {
    this.engines[name] = engineInstance;
    Logger.info(`Object detection engine registered: ${name}`);
  }

  setEngine(name) {
    if (this.engines[name] || this._isStubEngine(name)) {
      this.activeEngine = name;
      Logger.info(`Active detection engine switched to: ${name}`);
    } else {
      throw new Error(`Detection engine ${name} is not loaded/registered.`);
    }
  }

  async detect(videoElement, confidenceThreshold) {
    const engine = this.activeEngine;
    
    // Check if we are running the registered COCO-SSD
    if (engine === 'coco_ssd' && this.engines['coco_ssd']) {
      const raw = await this.engines['coco_ssd'].detect(videoElement);
      // Map and standardise output structure
      return raw.map(p => ({
        bbox: p.bbox, // [x, y, w, h]
        class: p.class === 'potted plant' ? 'tree' : p.class,
        score: p.score
      })).filter(p => p.score >= confidenceThreshold);
    }

    // Run stubs for other configurations
    if (this._isStubEngine(engine)) {
      return this._runStubEngine(engine, videoElement, confidenceThreshold);
    }

    return [];
  }

  _isStubEngine(name) {
    return ['yolo', 'onnx_runtime', 'mediapipe', 'custom_neural', 'cloud_api'].includes(name);
  }

  _runStubEngine(name, video, threshold) {
    Logger.warn(`Running stub detection logic for engine: ${name}`);
    // Simulate finding a tree in the center of the frame
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    
    // Return a candidate bounding box centered in the camera viewfinder
    return [{
      bbox: [w * 0.35, h * 0.15, w * 0.3, h * 0.7],
      class: 'tree',
      score: 0.90
    }];
  }
}

export const DetectionManager = new ObjectDetectionManager();
