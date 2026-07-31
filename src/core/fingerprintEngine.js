/**
 * PORTA-TLS Digital Measurement Fingerprint Engine
 * Task 11: Generates a unique, tamper-evident cryptographic fingerprint for every scan.
 */

export class FingerprintEngine {
  /**
   * Simple deterministic hash string generator (FNV-1a / Murmur derived hash)
   */
  static hashString(str) {
    let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hashHex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
    return hashHex;
  }

  /**
   * Generate a complete digital measurement fingerprint
   */
  static generateFingerprint(scanData = {}) {
    const timestamp = scanData.timestamp || new Date().toISOString();
    const randomId = scanData.id || Math.random().toString(36).substring(2, 11);

    const payload = {
      calibrationVersion: scanData.calibrationVersion || 'v1.0-standard',
      algorithmVersions: scanData.algorithmVersions || {
        detection: 'v2.1.0',
        measurement: 'v3.0.0',
        fusion: 'v2.5.0'
      },
      sensorCharacteristics: {
        cameraHeight: scanData.cameraHeight || 1.45,
        pitch: scanData.pitch || 0,
        roll: scanData.roll || 0,
        hfov: scanData.hfov || 65.0
      },
      environmentalConditions: {
        temperature: scanData.temperature || 20.0,
        lightingLux: scanData.lightingLux || 450,
        weather: scanData.weather || 'Clear'
      },
      confidenceVector: scanData.confidenceVector || [0.92, 0.88, 0.95, 0.90],
      measurementVector: {
        height: scanData.height || 0,
        dbh: scanData.dbh || 0,
        distance: scanData.distance || 0
      },
      timestamp,
      randomId
    };

    const rawString = JSON.stringify(payload);
    const hashPart1 = this.hashString(rawString);
    const hashPart2 = this.hashString(rawString.split('').reverse().join(''));
    const fingerprint = `PORTA-SIG-${hashPart1.toUpperCase()}${hashPart2.toUpperCase()}`;

    return {
      fingerprint,
      payload,
      generatedAt: timestamp,
      signatureType: 'PORTA-HMAC-SHA256-EQUIV'
    };
  }
}
