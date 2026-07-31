/**
 * PORTA‑TLS Enterprise API Layer Mock – REST‑style client wrappers.
 * In a real deployment these would map to actual server endpoints.
 * For now each function simply logs the request and returns a dummy promise.
 */
import { Logger } from '../core/logger.js';
import { logAuditEvent } from './auditLogger.js';

export const API = {
  /** Measurements CRUD */
  async getMeasurements() {
    Logger.info('API GET /measurements');
    logAuditEvent('SYSTEM', 'API_CALL', 'GET /measurements');
    // TODO: replace with fetch to backend when available
    return Promise.resolve([]);
  },

  async postMeasurement(payload) {
    Logger.info('API POST /measurements');
    logAuditEvent('SYSTEM', 'API_CALL', 'POST /measurements');
    return Promise.resolve({ success: true, id: crypto.randomUUID(), ...payload });
  },

  /** Projects CRUD */
  async getProjects() {
    Logger.info('API GET /projects');
    logAuditEvent('SYSTEM', 'API_CALL', 'GET /projects');
    return Promise.resolve([]);
  },

  async postProject(payload) {
    Logger.info('API POST /projects');
    logAuditEvent('SYSTEM', 'API_CALL', 'POST /projects');
    return Promise.resolve({ success: true, id: crypto.randomUUID(), ...payload });
  },

  /** Users CRUD */
  async login(credentials) {
    Logger.info('API POST /users/login');
    logAuditEvent(credentials.username, 'USER_LOGIN', 'Login via API');
    // Return mock JWT token
    return Promise.resolve({ token: `mock_jwt_${credentials.username}` });
  },

  /** Additional endpoints (trees, reports, calibration, validation, analytics) */
  // Placeholder functions for future expansion – maintain same signature style.
  async getTree(id) { return Promise.resolve({ id }); },
  async postTree(payload) { return Promise.resolve({ success: true, id: crypto.randomUUID(), ...payload }); },
  async getReport(id) { return Promise.resolve({ id, type: 'REPORT' }); },
  async postReport(payload) { return Promise.resolve({ success: true, id: crypto.randomUUID(), ...payload }); }
};
