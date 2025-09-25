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

  // Registrar listener para cambios
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);
    
    // Retornar función de cleanup
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // Notificar cambios a todos los listeners
  notify(key: string, data: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in sync listener for ${key}:`, error);
        }
      });
    }

    // También emitir evento personalizado para compatibilidad
    const event = new CustomEvent('sync_manager_update', {
      detail: { key, data }
    });
    window.dispatchEvent(event);
  }

  // Sincronizar novelas entre admin y componentes
  syncNovels(novels: any[]): void {
    // Actualizar localStorage
    try {
      const adminState = localStorage.getItem('admin_system_state');
      if (adminState) {
        const state = JSON.parse(adminState);
        state.novels = novels;
        localStorage.setItem('admin_system_state', JSON.stringify(state));
      }

      const systemConfig = localStorage.getItem('system_config');
      if (systemConfig) {
        const config = JSON.parse(systemConfig);
        config.novels = novels;
        localStorage.setItem('system_config', JSON.stringify(config));
      }
    } catch (error) {
      console.error('Error updating novels in localStorage:', error);
    }

    // Notificar a todos los listeners
    this.notify('novels', novels);
    
    // Emitir eventos específicos para compatibilidad
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'novels_sync', data: novels }
    });
    window.dispatchEvent(event);
  }

  // Sincronizar precios
  syncPrices(prices: any): void {
    try {
      const adminState = localStorage.getItem('admin_system_state');
      if (adminState) {
        const state = JSON.parse(adminState);
        state.prices = prices;
        localStorage.setItem('admin_system_state', JSON.stringify(state));
      }

      const systemConfig = localStorage.getItem('system_config');
      if (systemConfig) {
        const config = JSON.parse(systemConfig);
        config.prices = prices;
        localStorage.setItem('system_config', JSON.stringify(config));
      }
    } catch (error) {
      console.error('Error updating prices in localStorage:', error);
    }

    this.notify('prices', prices);
    
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'prices', data: prices }
    });
    window.dispatchEvent(event);
  }

  // Sincronizar zonas de entrega
  syncDeliveryZones(zones: any[]): void {
    try {
      const adminState = localStorage.getItem('admin_system_state');
      if (adminState) {
        const state = JSON.parse(adminState);
        state.deliveryZones = zones;
        localStorage.setItem('admin_system_state', JSON.stringify(state));
      }

      const systemConfig = localStorage.getItem('system_config');
      if (systemConfig) {
        const config = JSON.parse(systemConfig);
        config.deliveryZones = zones;
        localStorage.setItem('system_config', JSON.stringify(config));
      }
    } catch (error) {
      console.error('Error updating delivery zones in localStorage:', error);
    }

    this.notify('deliveryZones', zones);
    
    const event = new CustomEvent('admin_state_change', {
      detail: { type: 'delivery_zones_sync', data: zones }
    });
    window.dispatchEvent(event);
  }

  // Obtener datos actuales
  getCurrentData(key: string): any {
    try {
      const adminState = localStorage.getItem('admin_system_state');
      const systemConfig = localStorage.getItem('system_config');
      
      if (adminState) {
        const state = JSON.parse(adminState);
        if (state[key]) {
          return state[key];
        }
      }
      
      if (systemConfig) {
        const config = JSON.parse(systemConfig);
        if (config[key]) {
          return config[key];
        }
      }
    } catch (error) {
      console.error(`Error getting current data for ${key}:`, error);
    }
    
    return null;
  }

  // Limpiar todos los listeners
  cleanup(): void {
    this.listeners.clear();
  }
}

export const syncManager = SyncManager.getInstance();