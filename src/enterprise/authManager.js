/**
 * PORTA-TLS Enterprise User & RBAC Manager
 * Version 1.0.0 (Enterprise Architectural Baseline)
 */
import { Logger } from '../core/logger.js';
import { logAuditEvent } from './auditLogger.js';

// Access permissions policy matrix
const PERMISSIONS_MATRIX = {
  ADMIN: ['SAVE_SCAN', 'DELETE_RECORD', 'WRITE_CALIBRATION', 'PURGE_DATABASE', 'MANAGE_PLUGINS'],
  RESEARCHER: ['SAVE_SCAN', 'DELETE_RECORD', 'WRITE_CALIBRATION'],
  FOREST_OFFICER: ['SAVE_SCAN', 'DELETE_RECORD'],
  GUEST: [] // Read-only dashboard view
};

export const AuthManager = {
  /**
   * Check if the active role has permissions to run the request action
   */
  hasPermission(role, action) {
    const list = PERMISSIONS_MATRIX[role] || [];
    return list.includes(action);
  },

  /**
   * Login user session
   */
  login(state, username, role) {
    if (!PERMISSIONS_MATRIX[role]) {
      role = 'GUEST';
    }

    state.auth = {
      username,
      role,
      token: `mock_jwt_token_${role.toLowerCase()}`,
      loginTime: new Date().toISOString()
    };

    logAuditEvent(username, 'USER_LOGIN', `Logged in successfully as role: ${role}`);
    Logger.info(`Session started for user: ${username} (${role})`);
    
    // Auto disable UI buttons depending on Guest permissions
    this.enforceUIPermissions(state);
  },

  /**
   * Enforce role limitations on interactive buttons
   */
  enforceUIPermissions(state) {
    const role = state.auth?.role || 'GUEST';
    const canSave = this.hasPermission(role, 'SAVE_SCAN');
    const canCalibrate = this.hasPermission(role, 'WRITE_CALIBRATION');

    // Toggle disabled status on DOM controls
    const saveBtns = [document.getElementById('btn-save-tree'), document.getElementById('btn-auto-save-tree')];
    saveBtns.forEach(btn => {
      if (btn) btn.disabled = !canSave;
    });

    const calibSubmit = document.querySelector('.calibration-form button[type="submit"]');
    if (calibSubmit) {
      calibSubmit.disabled = !canCalibrate;
    }
  }
};
