/**
 * PORTA-TLS Internal Profiler & Performance Monitor
 * Version 2.0 Architectural Baseline
 */

class PerformanceProfiler {
  constructor() {
    this.metrics = {};
    this.activeTimers = {};
    this.fpsCount = 0;
    this.fps = 0;
    this.lastFpsTimestamp = performance.now();
  }

  /**
   * Start a named stopwatch timer
   */
  start(name) {
    this.activeTimers[name] = performance.now();
  }

  /**
   * Stop a named stopwatch timer and record the duration
   */
  end(name) {
    const startTime = this.activeTimers[name];
    if (startTime === undefined) return 0;
    
    const duration = performance.now() - startTime;
    delete this.activeTimers[name];
    this.record(name, duration);
    return duration;
  }

  /**
   * Directly record a duration for a metric
   */
  record(name, duration) {
    if (!this.metrics[name]) {
      this.metrics[name] = {
        last: 0,
        avg: 0,
        min: Infinity,
        max: -Infinity,
        count: 0,
        total: 0
      };
    }

    const metric = this.metrics[name];
    metric.last = duration;
    metric.count += 1;
    metric.total += duration;
    metric.avg = metric.total / metric.count;
    if (duration < metric.min) metric.min = duration;
    if (duration > metric.max) metric.max = duration;
  }

  /**
   * Trigger frame tick for FPS calculation
   */
  tickFps() {
    this.fpsCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsTimestamp;
    
    if (elapsed >= 1000) {
      this.fps = (this.fpsCount * 1000) / elapsed;
      this.fpsCount = 0;
      this.lastFpsTimestamp = now;
      this.record('frameRate', this.fps);
    }
  }

  /**
   * Retrieve memory estimation if supported by browser
   */
  getMemoryUsage() {
    if (performance && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Retrieve metrics snapshot
   */
  getReport() {
    const report = {};
    for (const [key, value] of Object.entries(this.metrics)) {
      report[key] = {
        lastMs: value.last.toFixed(2),
        avgMs: value.avg.toFixed(2),
        count: value.count
      };
    }
    
    const mem = this.getMemoryUsage();
    if (mem) {
      report['memory'] = {
        usedMb: (mem.usedJSHeapSize / (1024 * 1024)).toFixed(2),
        totalMb: (mem.totalJSHeapSize / (1024 * 1024)).toFixed(2)
      };
    }
    
    return report;
  }
}

export const Profiler = new PerformanceProfiler();
