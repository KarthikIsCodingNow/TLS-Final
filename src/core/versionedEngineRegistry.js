/**
 * PORTA-TLS Versioned Engine Registry
 * Task 11: Independent engine semantic versioning & manifest registration.
 */

export const ENGINE_VERSIONS = {
  DetectionEngine: 'v2.1.0',
  MeasurementEngine: 'v3.0.0',
  FusionEngine: 'v2.5.0',
  ValidationEngine: 'v2.2.0',
  ConfidenceEngine: 'v2.4.0',
  CarbonEngine: 'v2.0.0',
  PQIEngine: 'v1.0.0-proprietary',
  ConsensusEngine: 'v1.1.0-proprietary',
  FingerprintEngine: 'v1.0.0-SHA256',
  PatentDocEngine: 'v1.0.0'
};

export class VersionedEngineRegistry {
  constructor() {
    this.registry = new Map();
    this.initializeDefaultRegistry();
  }

  initializeDefaultRegistry() {
    Object.entries(ENGINE_VERSIONS).forEach(([name, version]) => {
      this.registerEngine(name, version, {
        registeredAt: new Date().toISOString(),
        status: 'ACTIVE',
        patentStatus: 'PATENT_PENDING'
      });
    });
  }

  registerEngine(name, version, metadata = {}) {
    this.registry.set(name, {
      name,
      version,
      metadata,
      registeredAt: metadata.registeredAt || new Date().toISOString()
    });
  }

  getEngineVersion(name) {
    return this.registry.get(name)?.version || 'v1.0.0-legacy';
  }

  getAllEngineVersions() {
    const versions = {};
    this.registry.forEach((val, key) => {
      versions[key] = val.version;
    });
    return versions;
  }

  getEngineManifest() {
    return Array.from(this.registry.values());
  }
}

export const versionedEngineRegistry = new VersionedEngineRegistry();
