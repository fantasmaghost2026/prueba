import { useState, useEffect } from 'react';
import { syncManager } from '../utils/syncManager';

interface NovelSyncState {
  transmissionNovels: any[];
  finishedNovels: any[];
  allNovels: any[];
  isLoading: boolean;
  lastUpdate: Date | null;
}

export function useNovelSync() {
  const [state, setState] = useState<NovelSyncState>({
    transmissionNovels: [],
    finishedNovels: [],
    allNovels: [],
    isLoading: true,
    lastUpdate: null
  });

  useEffect(() => {
    // Cargar datos iniciales
    const loadInitialData = () => {
      const novels = syncManager.getCurrentData('novels');
      if (Array.isArray(novels)) {
        const transmission = novels.filter(novel => novel.estado === 'transmision');
        const finished = novels.filter(novel => novel.estado === 'finalizada');
        
        setState({
          transmissionNovels: transmission,
          finishedNovels: finished,
          allNovels: novels,
          isLoading: false,
          lastUpdate: new Date()
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadInitialData();

    // Suscribirse a cambios
    const unsubscribeTransmission = syncManager.subscribe('novels_transmission', (novels) => {
      setState(prev => ({
        ...prev,
        transmissionNovels: novels,
        lastUpdate: new Date()
      }));
    });

    const unsubscribeFinished = syncManager.subscribe('novels_finished', (novels) => {
      setState(prev => ({
        ...prev,
        finishedNovels: novels,
        lastUpdate: new Date()
      }));
    });

    const unsubscribeAll = syncManager.subscribe('novels_all', (novels) => {
      const transmission = novels.filter((novel: any) => novel.estado === 'transmision');
      const finished = novels.filter((novel: any) => novel.estado === 'finalizada');
      
      setState({
        transmissionNovels: transmission,
        finishedNovels: finished,
        allNovels: novels,
        isLoading: false,
        lastUpdate: new Date()
      });
    });

    // Escuchar eventos del admin
    const handleAdminStateChange = (event: CustomEvent) => {
      if (event.detail.type === 'novel_add' || 
          event.detail.type === 'novel_update' || 
          event.detail.type === 'novel_delete') {
        loadInitialData();
      }
    };

    window.addEventListener('admin_state_change', handleAdminStateChange as EventListener);

    return () => {
      unsubscribeTransmission();
      unsubscribeFinished();
      unsubscribeAll();
      window.removeEventListener('admin_state_change', handleAdminStateChange as EventListener);
    };
  }, []);

  const refreshNovels = () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const novels = syncManager.getCurrentData('novels');
    
    if (Array.isArray(novels)) {
      syncManager.syncNovels(novels);
    }
  };

  return {
    ...state,
    refreshNovels
  };
}