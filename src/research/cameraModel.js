/**
 * PORTA-TLS Pinhole Camera Intrinsic & Radial Distortion Model
 * Version 2.3 Architectural Baseline - Task 9 Extension
 */

export class PinholeCameraModel {
  /**
   * Initialize Intrinsic Projection Model (Requirement 3)
   * @param {object} params Intrinsic parameters
   */
  constructor(params = {}) {
    this.width = params.width || 1920;
    this.height = params.height || 1080;
    this.aspectRatio = this.width / (this.height || 1);

    const hfovRad = ((params.hfov || 60.0) * Math.PI) / 180.0;
    const vfovRad = ((params.vfov || 45.0) * Math.PI) / 180.0;

    // Focal length in pixel space
    this.fx = params.fx || (this.width / (2 * Math.tan(hfovRad / 2)));
    this.fy = params.fy || (this.height / (2 * Math.tan(vfovRad / 2)));

    // Principal Point
    this.cx = params.cx || (this.width / 2);
    this.cy = params.cy || (this.height / 2);

    // Radial distortion coefficients
    this.k1 = params.k1 || 0.0;
    this.k2 = params.k2 || 0.0;
  }

  /**
   * Intrinsic Camera Matrix K
   */
  getIntrinsicMatrix() {
    return [
      [this.fx, 0, this.cx],
      [0, this.fy, this.cy],
      [0, 0, 1]
    ];
  }

  /**
   * Project 3D camera coordinate (X, Y, Z) to pixel coordinate (u, v)
   */
  project3DToPixel(X, Y, Z) {
    if (Z <= 0) return { u: 0, v: 0, visible: false };

    const xNormalized = X / Z;
    const yNormalized = Y / Z;
    const r2 = xNormalized * xNormalized + yNormalized * yNormalized;
    const distortionFactor = 1 + this.k1 * r2 + this.k2 * r2 * r2;

    const u = this.fx * (xNormalized * distortionFactor) + this.cx;
    const v = this.fy * (yNormalized * distortionFactor) + this.cy;

    return { u: Math.round(u), v: Math.round(v), visible: u >= 0 && u <= this.width && v >= 0 && v <= this.height };
  }

  /**
   * Unproject pixel coordinate (u, v) at distance Z to 3D camera coordinate (X, Y, Z)
   */
  unprojectPixelTo3D(u, v, Z) {
    const xNormalized = (u - this.cx) / this.fx;
    const yNormalized = (v - this.cy) / this.fy;

    return {
      X: parseFloat((xNormalized * Z).toFixed(3)),
      Y: parseFloat((yNormalized * Z).toFixed(3)),
      Z: parseFloat(Z.toFixed(3))
    };
  }
}
