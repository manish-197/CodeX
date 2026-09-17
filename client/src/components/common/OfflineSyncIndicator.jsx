import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getPendingSyncCount, syncPendingQueue } from '../../services/offlineSync';

export default function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const updateCounts = async () => {
    const count = await getPendingSyncCount();
    setPendingCount(count);
  };

  useEffect(() => {
    updateCounts();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync on reconnect
      handleSyncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateCounts();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(updateCounts, 6000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    await syncPendingQueue((count) => {
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 3000);
    });
    await updateCounts();
    setSyncing(false);
  };

  if (isOnline && pendingCount === 0 && !justSynced) {
    return null; // Clean: no clutter when online and fully synced
  }

  return (
    <div className="fixed top-20 right-6 z-40 animate-fadeIn">
      {!isOnline ? (
        <div className="glass-card px-3.5 py-2 flex items-center gap-2 shadow-lg bg-caution-amber/20 border border-caution-amber text-xs font-bold text-deep-navy">
          <WifiOff className="w-4 h-4 text-alert-red animate-pulse" />
          <span>Offline PWA Mode {pendingCount > 0 && `(${pendingCount} Queued)`}</span>
        </div>
      ) : justSynced ? (
        <div className="glass-card px-3.5 py-2 flex items-center gap-2 shadow-lg bg-health-green/20 border border-health-green text-xs font-bold text-health-green">
          <CheckCircle2 className="w-4 h-4" />
          <span>All Records Synced to Atlas</span>
        </div>
      ) : (
        <div className="glass-card px-3.5 py-2 flex items-center gap-2.5 shadow-lg bg-white/95 dark:bg-dark-card/95 border border-medical-blue/40 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-caution-amber animate-ping" />
          <span className="text-deep-navy dark:text-clinical-white">
            {pendingCount} Pending Sync
          </span>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="p-1 rounded-full hover:bg-deep-navy/10 text-medical-blue"
            title="Sync to MongoDB Atlas now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}
