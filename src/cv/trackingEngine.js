/**
 * PORTA-TLS Block-Matching Tracker & Kalman Filter
 * Version 2.0 Architectural Baseline
 */

/**
 * 2D Kalman Filter to smooth centroid coordinate states
 */
export class KalmanFilter2D {
  constructor() {
    this.x = null; // State vector [px, py, vx, vy]
    this.p = [
      [10, 0, 0, 0],
      [0, 10, 0, 0],
      [0, 0, 10, 0],
      [0, 0, 0, 10]
    ]; // Error covariance matrix
    this.q = 0.05; // Process noise
    this.r = 2.0;  // Measurement noise
  }

  predict(dt = 1.0) {
    if (this.x === null) return;

    // State transition matrices
    const px = this.x[0] + this.x[2] * dt;
    const py = this.x[1] + this.x[3] * dt;
    this.x[0] = px;
    this.x[1] = py;

    // Predict covariance P = A*P*A' + Q
    this.p[0][0] += this.p[2][2] * dt * dt + this.q;
    this.p[1][1] += this.p[3][3] * dt * dt + this.q;
  }

  correct(mx, my) {
    if (this.x === null) {
      this.x = [mx, my, 0, 0];
      return this.x;
    }

    // Measurement residual
    const rx = mx - this.x[0];
    const ry = my - this.x[1];

    // Kalman gain K = P * H' * inv(H*P*H' + R)
    const kx = this.p[0][0] / (this.p[0][0] + this.r);
    const ky = this.p[1][1] / (this.p[1][1] + this.r);

    // Update state
    this.x[0] += kx * rx;
    this.x[1] += ky * ry;
    
    // Simple velocity updates
    this.x[2] = kx * rx;
    this.x[3] = ky * ry;

    // Update covariance P = (I - K*H)*P
    this.p[0][0] *= (1.0 - kx);
    this.p[1][1] *= (1.0 - ky);

    return this.x;
  }

  reset() {
    this.x = null;
  }
}

/**
 * Block matching Optical Flow template tracker to trace trunk centroid displacement
 * @param {Uint8Array} prevGray Grayscale buffer of previous frame
 * @param {Uint8Array} currGray Grayscale buffer of current frame
 * @param {number} w Frame width
 * @param {number} h Frame height
 * @param {object} centroid {x, y} previous coordinate
 * @returns {object} {x, y} updated coordinate
 */
export function trackBlockMatch(prevGray, currGray, w, h, centroid) {
  if (!prevGray || !currGray || !centroid) return centroid;

  const cx = Math.floor(centroid.x);
  const cy = Math.floor(centroid.y);

  const blockSize = 8; // 17x17 block
  const searchRange = 12; // Search window +/-12px

  let bestDx = 0;
  let bestDy = 0;
  let minSSD = Infinity;

  // Verify coordinates are within boundary
  if (cx < blockSize || cx >= w - blockSize || cy < blockSize || cy >= h - blockSize) {
    return centroid;
  }

  // Iterate search window
  for (let dy = -searchRange; dy <= searchRange; dy++) {
    for (let dx = -searchRange; dx <= searchRange; dx++) {
      let ssd = 0;
      let valid = true;

      for (let by = -blockSize; by <= blockSize; by++) {
        for (let bx = -blockSize; bx <= blockSize; bx++) {
          const pxY = cy + by;
          const pxX = cx + bx;
          
          const currY = cy + by + dy;
          const currX = cx + bx + dx;

          if (currX < 0 || currX >= w || currY < 0 || currY >= h) {
            valid = false;
            break;
          }

          const prevVal = prevGray[pxY * w + pxX];
          const currVal = currGray[currY * w + currX];
          ssd += Math.pow(prevVal - currVal, 2);
        }
        if (!valid) break;
      }

      if (valid && ssd < minSSD) {
        minSSD = ssd;
        bestDx = dx;
        bestDy = dy;
      }
    }
  }

  return {
    x: cx + bestDx,
    y: cy + bestDy,
    dx: bestDx,
    dy: bestDy
  };
}
