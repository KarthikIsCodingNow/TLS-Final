/**
 * PORTA-TLS Plugin System – Dynamically register and invoke plugins.
 * Version 1.0.0 (Enterprise Architectural Baseline)
 */

/**
 * Central registry storing plugin descriptors.
 * Each plugin must expose a `name` string and a `process(inputs)` function that
 * returns an output object. Plugins can be added at runtime via `register`.
 */
export const PluginRegistry = {
  _plugins: {},

  /** Register a new plugin */
  register(plugin) {
    if (!plugin || !plugin.name || typeof plugin.process !== 'function') {
      throw new Error('Invalid plugin definition – must contain name and process function');
    }
    this._plugins[plugin.name] = plugin;
    console.info(`[PluginSystem] Registered plugin: ${plugin.name}`);
  },

  /** Retrieve a plugin by name */
  get(name) {
    return this._plugins[name];
  },

  /** List all registered plugins */
  list() {
    return Object.keys(this._plugins);
  },

  /** Execute a plugin with given inputs */
  async run(name, inputs) {
    const plugin = this.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    return await plugin.process(inputs);
  }
};

/**
 * Example built‑in biomass plugins that can be replaced or extended.
 */
export const BuiltInBiomassPlugins = {
  // Simple DBH‑Height model (FAO generic)
  FAO_GENERIC: {
    name: 'FAO_GENERIC',
    description: 'FAO‑type allometric model using DBH and height',
    process: ({ DBH, Height, density }) => {
      // Biomass (kg) = 0.0673 * (DBH^2 * Height) ^ 0.976 (example formula)
      const volume = 0.0673 * Math.pow(Math.pow(DBH, 2) * Height, 0.976);
      return { biomass: volume * density };
    }
  },

  // Conifer specific model example
  CONIFER: {
    name: 'CONIFER',
    description: 'Conifer model using taper factor',
    process: ({ DBH, Height, density }) => {
      const taper = 0.6; // placeholder taper coefficient
      const volume = (Math.PI * Math.pow(DBH / 2, 2) * Height) * taper;
      return { biomass: volume * density };
    }
  }
};

// Register built‑in plugins on load
Object.values(BuiltInBiomassPlugins).forEach(p => PluginRegistry.register(p));
