/**
 * PORTA‑TLS Enterprise Audit Logger
 * Central repository for security‑relevant events.
 * Every event is stored in IndexedDB (fallback to LocalStorage) with a
 * timestamp, user id, event type and descriptive payload.
 */
import { StorageFacade } from './storageAdapter.js';
import { Logger } from '../core/logger.js';

const AUDIT_STORE = 'audit_logs';

export const logAuditEvent = async (actor, eventType, details) => {
  // Ensure storage is ready – lazy init singleton.
  if (!window.__auditStorage) {
    const facade = new StorageFacade('indexeddb');
    await facade.init();
    window.__auditStorage = facade;
  }

  const record = {
    id: crypto.randomUUID(),
    actor,
    eventType,
    details,
    timestamp: new Date().toISOString()
  };

  try {
    await window.__auditStorage.setItem(AUDIT_STORE, record);
    Logger.info(`[Audit] ${eventType} – ${actor}`);
  } catch (e) {
    // Fallback to LocalStorage if IndexedDB write fails.
    try {
      const fallback = new StorageFacade('localstorage');
      await fallback.init();
      await fallback.setItem(AUDIT_STORE, record);
      Logger.warn('[Audit] IndexedDB unavailable – stored in LocalStorage');
    } catch (err) {
      Logger.error('[Audit] Failed to persist audit event', err);
    }
  }
};
