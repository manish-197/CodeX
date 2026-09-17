// IndexedDB Offline Queue Manager for ArogyaRakshak AI
const DB_NAME = 'ArogyaRakshakOfflineDB';
const DB_VERSION = 1;
const STORE_VITALS = 'pending_vitals';
const STORE_TRIAGE = 'pending_triage';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_VITALS)) {
        db.createObjectStore(STORE_VITALS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_TRIAGE)) {
        db.createObjectStore(STORE_TRIAGE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineVitals(vitalsRecord) {
  try {
    const db = await openDatabase();
    if (!db) return false;

    const tx = db.transaction(STORE_VITALS, 'readwrite');
    const store = tx.objectStore(STORE_VITALS);
    store.add({
      ...vitalsRecord,
      queuedAt: new Date().toISOString(),
    });

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('[Offline Queue Error]', err);
    return false;
  }
}

export async function getPendingSyncCount() {
  try {
    const db = await openDatabase();
    if (!db) return 0;

    const tx = db.transaction([STORE_VITALS, STORE_TRIAGE], 'readonly');
    const vitalsStore = tx.objectStore(STORE_VITALS);
    const triageStore = tx.objectStore(STORE_TRIAGE);

    const vitalsReq = vitalsStore.count();
    const triageReq = triageStore.count();

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        resolve((vitalsReq.result || 0) + (triageReq.result || 0));
      };
      tx.onerror = () => resolve(0);
    });
  } catch (err) {
    return 0;
  }
}

export async function syncPendingQueue(onSyncSuccess) {
  try {
    const db = await openDatabase();
    if (!db) return;

    const tx = db.transaction([STORE_VITALS], 'readwrite');
    const store = tx.objectStore(STORE_VITALS);
    const getAllReq = store.getAll();

    getAllReq.onsuccess = async () => {
      const items = getAllReq.result || [];
      if (items.length === 0) return;

      console.log(`[Offline Sync] Synchronizing ${items.length} pending records to Atlas...`);

      for (const item of items) {
        try {
          if (item.memberId) {
            await fetch(`http://localhost:5000/api/family/${item.memberId}/vitals`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });
          }
        } catch (e) {
          console.warn('[Sync Item Failed]', e.message);
        }
      }

      // Clear synced items
      const clearTx = db.transaction([STORE_VITALS], 'readwrite');
      clearTx.objectStore(STORE_VITALS).clear();

      if (onSyncSuccess) onSyncSuccess(items.length);
    };
  } catch (err) {
    console.warn('[Sync Pending Error]', err);
  }
}
