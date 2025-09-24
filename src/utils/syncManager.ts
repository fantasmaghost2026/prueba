// Gestor de sincronización centralizado para mantener coherencia entre componentes
export class SyncManager {
  private static instance: SyncManager;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Registrar un listener para un tipo de datos específico
  subscribe(dataType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, new Set());
    }
    
    this.listeners.get(dataType)!.add(callback);
    
    // Retornar función de cleanup
    return () => {
      const listeners = this.listeners.get(dataType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(dataType);
        }
      }
    };
  }

  // Notificar cambios a todos los listeners
  notify(dataType: string, data: any): void {
    const listeners = this.listeners.get(dataType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in sync listener for ${dataType}:`, error);
        }
      });
    }

    // También emitir evento personalizado para compatibilidad
    const event = new CustomEvent('sync_update', {
      detail: { type: dataType, data }
    });
    window.dispatchEvent(event);
  }

  // Sincronizar novelas específicamente
  syncNovels(novels: any[]): void {
    const transmissionNovels = novels.filter(novel => novel.estado === 'transmision');
    const finishedNovels = novels.filter(novel => novel.estado === 'finalizada');
    
    this.notify('novels_transmission', transmissionNovels);
    this.notify('novels_finished', finishedNovels);
    this.notify('novels_all', novels);
  }

  // Sincronizar precios
  syncPrices(prices: any): void {
    this.notify('prices', prices);
  }

  // Sincronizar zonas de entrega
  syncDeliveryZones(zones: any[]): void {
    this.notify('delivery_zones', zones);
  }

  // Obtener datos actuales desde localStorage
  getCurrentData(dataType: string): any {
    try {
      // Intentar desde el estado del admin primero
      const adminStateStr = localStorage.getItem('admin_system_state');
      if (adminStateStr) {
        const adminState = JSON.parse(adminStateStr);
        
        switch (dataType) {
          case 'novels':
            return adminState.novels || [];
          case 'prices':
            return adminState.prices || {};
          case 'delivery_zones':
            return adminState.deliveryZones || [];
        }
      }
      
      // Fallback al system_config
      const systemConfig = localStorage.getItem('system_config');
      if (systemConfig) {
        const config = JSON.parse(systemConfig);
        return config[dataType] || (dataType === 'novels' || dataType === 'delivery_zones' ? [] : {});
      }
    } catch (error) {
      console.error(`Error getting current data for ${dataType}:`, error);
    }
    
    return dataType === 'novels' || dataType === 'delivery_zones' ? [] : {};
  }

  // Limpiar todos los listeners
  cleanup(): void {
    this.listeners.clear();
  }
}

export const syncManager = SyncManager.getInstance();