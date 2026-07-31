/**
 * PORTA-TLS Storage Abstraction Layer (Multi-Driver Facade)
 * Version 2.4 Architectural Baseline - Task 10 Extension
 * Supports LocalStorage, IndexedDB, SQLite, PostgreSQL, MongoDB, Firebase, Supabase
 */

export class LocalStorageDriver {
  async init() { return true; }
  async getItem(key) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }
  async setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  async removeItem(key) { localStorage.removeItem(key); }
  async getAllItems(prefix = '') {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        items.push(JSON.parse(localStorage.getItem(k)));
      }
    }
    return items;
  }
}

export class IndexedDBDriver {
  constructor(dbName = 'portatls_enterprise_db') {
    this.dbName = dbName;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('trees')) db.createObjectStore('trees', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('audit_logs')) db.createObjectStore('audit_logs', { keyPath: 'timestamp' });
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getItem(storeName, key) {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result || null);
    });
  }

  async setItem(storeName, value) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(value);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllItems(storeName) {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
    });
  }
}

// Future Enterprise Remote Driver Stubs (SQLite, Postgres, Mongo, Firebase, Supabase)
export class RemoteCloudDriverStub {
  constructor(providerName = 'supabase') {
    this.providerName = providerName;
  }
  async init() { return true; }
  async getItem(key) { return null; }
  async setItem(key, value) { return true; }
  async getAllItems() { return []; }
}

export class StorageFacade {
  constructor(driverType = 'indexeddb') {
    this.driverType = driverType;
    switch (driverType) {
      case 'localstorage': this.driver = new LocalStorageDriver(); break;
      case 'sqlite':
      case 'postgres':
      case 'mongo':
      case 'firebase':
      case 'supabase': this.driver = new RemoteCloudDriverStub(driverType); break;
      case 'indexeddb':
      default: this.driver = new IndexedDBDriver(); break;
    }
  }

  async init() { return await this.driver.init(); }
  async getItem(store, key) { return await this.driver.getItem(store, key); }
  async setItem(store, value) { return await this.driver.setItem(store, value); }
  async getAllItems(store) { return await this.driver.getAllItems(store); }
}
