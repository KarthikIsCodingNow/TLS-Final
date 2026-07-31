/**
 * PORTA-TLS Offline-First Cloud Synchronization Engine
 * Version 2.4 Architectural Baseline - Task 10 Extension
 */
import { Logger } from '../core/logger.js';
import { StorageFacade } from './storageAdapter.js';

export const SyncEngine = {
  syncQueue: [],
  isSyncing: false,
  isOnline: navigator.onLine,
  storage: new StorageFacade('indexeddb'),

  init(state) {
    this.storage.init();
    window.addEventListener('online', () => {
      this.isOnline = true;
      Logger.info('Network online detected. Triggering auto cloud sync queue...');
      this.processQueue(state);
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      Logger.warn('Network offline detected. Switching to offline-first local queue.');
    });
  },

  enqueueSyncItem(item) {
    this.syncQueue.push({
      item,
      queuedAt: new Date().toISOString(),
      attempts: 0
    });
  },

  async forceSync(state) {
    return await this.processQueue(state);
  },

  async processQueue(state) {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return { syncedCount: 0, status: this.isOnline ? 'IDLE' : 'OFFLINE' };
    }

    this.isSyncing = true;
    let count = 0;

    while (this.syncQueue.length > 0) {
      const qItem = this.syncQueue.shift();
      try {
        qItem.attempts++;
        // Simulate remote server push and IndexedDB store
        await this.storage.setItem('trees', qItem.item);
        count++;
      } catch (err) {
        Logger.error(`Cloud sync failed for item ${qItem.item.id}:`, err);
        if (qItem.attempts < 3) {
          this.syncQueue.push(qItem); // retry queue
        }
      }
    }

    this.isSyncing = false;
    return { syncedCount: count, status: 'SUCCESS' };
  },

  async triggerSync(state) {
    return await this.processQueue(state);
  },

  getPendingCount() {
    return this.syncQueue.length;
  },

  getSyncStatusBadge() {
    if (!this.isOnline) return 'OFFLINE MODE';
    if (this.isSyncing) return 'SYNCHRONIZING...';
    if (this.syncQueue.length > 0) return `${this.syncQueue.length} PENDING`;
    return 'ONLINE / SYNCED';
  },

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.syncQueue.length,
      badgeText: this.getSyncStatusBadge()
    };
  }
};
