/**
 * PORTA-TLS Inter-Frame Camera Motion Detector
 * Version 2.2 Architectural Baseline - Task 8 Extension
 */

let prevFrameBuffer = null;

export const MotionDetector = {
  /**
   * Evaluate camera shake / inter-frame motion variance (Requirement 9)
   * @param {Uint8Array} gray 8-bit grayscale image buffer
   * @param {number} w Frame width
   * @param {number} h Frame height
   */
  detectMotion(gray, w, h) {
    if (!prevFrameBuffer || prevFrameBuffer.length !== gray.length) {
      prevFrameBuffer = new Uint8Array(gray.length);
      prevFrameBuffer.set(gray);
      return {
        isExcessiveMotion: false,
        motionScore: 0.0,
        statusText: 'Initializing'
      };
    }

    // Sample mean absolute difference (MAD) across every 16th pixel
    let sumAbsDiff = 0;
    let count = 0;
    const step = 16;

    for (let i = 0; i < gray.length; i += step) {
      sumAbsDiff += Math.abs(gray[i] - prevFrameBuffer[i]);
      count++;
    }

    // Cache current frame buffer for next tick
    prevFrameBuffer.set(gray);

    const motionScore = parseFloat((sumAbsDiff / (count || 1)).toFixed(2));
    const isExcessiveMotion = motionScore > 3.5;

    return {
      isExcessiveMotion,
      motionScore,
      statusText: isExcessiveMotion ? 'Waiting for stable frame...' : 'Stable'
    };
  },

  /**
   * Reset motion buffer
   */
  reset() {
    prevFrameBuffer = null;
  }
};
