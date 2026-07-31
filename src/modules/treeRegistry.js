/**
 * PORTA-TLS Tree Registry & Database Manager
 * Version 2.0 Architectural Baseline
 */
import { Logger } from '../core/logger.js';
import { ErrorHandler } from '../core/errors.js';

const STORAGE_KEY = 'qt_tls_inventory';

/**
 * Load tree database from localStorage
 */
export function loadRegistry(stateObject) {
  Logger.info('Loading tree registry from localStorage');
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      stateObject.registry.trees = JSON.parse(raw);
    } else {
      stateObject.registry.trees = [];
      saveRegistry(stateObject);
    }
  } catch (err) {
    ErrorHandler.handle(err, 'registry');
    stateObject.registry.trees = [];
  }
}

/**
 * Persist tree database to localStorage
 */
export function saveRegistry(stateObject) {
  Logger.info('Saving tree registry to localStorage');
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObject.registry.trees));
  } catch (err) {
    ErrorHandler.handle(err, 'registry');
  }
}

/**
 * Generate next incremental ID for manual or auto trees
 */
export function getNextId(trees, prefix) {
  let max = 0;
  trees.forEach(t => {
    const regex = new RegExp(`^${prefix}(\\d+)$`);
    const match = t.id.match(regex);
    if (match) {
      const num = parseInt(match[1]);
      if (num > max) max = num;
    }
  });
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

/**
 * Add a record to the registry
 */
export function addRecord(stateObject, record) {
  Logger.info(`Adding tree record: ${record.id}`);
  
  // Validation: Check if ID exists
  const idExists = stateObject.registry.trees.some(
    t => t.id.toLowerCase() === record.id.toLowerCase()
  );
  if (idExists) {
    throw new Error(`Tree ID ${record.id} already exists in database.`);
  }

  // Prepend new record to state
  stateObject.registry.trees.unshift(record);
  saveRegistry(stateObject);
}

/**
 * Delete a record by ID from the registry
 */
export function deleteRecord(stateObject, id) {
  Logger.info(`Deleting tree record: ${id}`);
  stateObject.registry.trees = stateObject.registry.trees.filter(t => t.id !== id);
  saveRegistry(stateObject);
}

/**
 * Purge all records from the registry
 */
export function clearRegistry(stateObject) {
  Logger.info('Purging all records from tree registry');
  stateObject.registry.trees = [];
  saveRegistry(stateObject);
}

/**
 * Get filtered trees based on search query and species criteria
 */
export function getFilteredTrees(trees, query = '', speciesFilter = 'All') {
  const lcQuery = query.toLowerCase().trim();
  const lcFilter = speciesFilter.toLowerCase().trim();

  return trees.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(lcQuery) || t.species.toLowerCase().includes(lcQuery);
    const matchesFilter = lcFilter === 'all' || t.species.toLowerCase() === lcFilter;
    return matchesSearch && matchesFilter;
  });
}

/**
 * Construct CSV content and return a downloadable URI
 */
export function generateCSVContent(trees) {
  Logger.info('Generating CSV stream from tree records');
  if (trees.length === 0) {
    throw new Error('Database is empty. No records to export.');
  }

  const headers = ['Tree ID', 'Species', 'Height (m)', 'DBH (cm)', 'AGB (kg)', 'CO2 (kg)', 'Lat', 'Lon', 'Timestamp'];
  let csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
  
  trees.forEach(t => {
    csv += `"${t.id}","${t.species}",${t.height},${t.dbh},${t.agb},${t.co2},${t.lat||''},${t.lon||''},"${t.timestamp}"\n`;
  });

  return encodeURI(csv);
}
