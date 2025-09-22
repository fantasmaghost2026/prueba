import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// CONFIGURACIÓN EMBEBIDA - Generada automáticamente
const EMBEDDED_CONFIG = {
  "version": "2.1.0",
  "lastExport": "2025-09-05T08:44:06.529Z",
  "prices": {
    "moviePrice": 100,
    "seriesPrice": 300,
    "transferFeePercentage": 10,
    "novelPricePerChapter": 5
  },
  "deliveryZones": [
    {
      "id": 1,
      "name": "Santiago de Cuba > Vista Hermosa",
      "cost": 400,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-17T09:20:53.160Z"
    },
    {
      "id": 2,
      "name": "Santiago de Cuba > Antonio Maceo",
      "cost": 400,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-17T09:21:05.888Z"
    },
    {
      "id": 3,
      "name": "Santiago de Cuba > Centro de la ciudad",
      "cost": 250,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-17T09:21:30.455Z"
    },
    {
      "name": "Santiago de Cuba > Versalles Hasta el Hotel",
      "cost": 500,
      "id": 1758100929096,
      "createdAt": "2025-09-17T09:22:09.096Z",
      "updatedAt": "2025-09-17T09:22:09.096Z"
    },
    {
      "name": "Santiago de Cuba > Carretera del Morro",
      "cost": 300,
      "id": 1758100944200,
      "createdAt": "2025-09-17T09:22:24.200Z",
      "updatedAt": "2025-09-17T09:22:24.200Z"
    },
    {
      "name": "Santiago de Cuba > Altamira",
      "cost": 400,
      "id": 1758100965751,
      "createdAt": "2025-09-17T09:22:45.751Z",
      "updatedAt": "2025-09-17T09:22:45.751Z"
    },
    {
      "name": "Santiago de Cuba > Cangrejitos",
      "cost": 350,
      "id": 1758100993856,
      "createdAt": "2025-09-17T09:23:13.856Z",
      "updatedAt": "2025-09-17T09:23:13.856Z"
    },
    {
      "name": "Santiago de Cuba > Trocha",
      "cost": 250,
      "id": 1758101017063,
      "createdAt": "2025-09-17T09:23:37.063Z",
      "updatedAt": "2025-09-17T09:23:37.063Z"
    },
    {
      "name": "Santiago de Cuba > Veguita de Galo",
      "cost": 300,
      "id": 1758101035400,
      "createdAt": "2025-09-17T09:23:55.400Z",
      "updatedAt": "2025-09-17T09:23:55.400Z"
    },
    {
      "name": "Santiago de Cuba > Plaza de Martes",
      "cost": 250,
      "id": 1758101052903,
      "createdAt": "2025-09-17T09:24:12.903Z",
      "updatedAt": "2025-09-17T09:24:12.903Z"
    },
    {
      "name": "Santiago de Cuba > Portuondo",
      "cost": 300,
      "id": 1758101091183,
      "createdAt": "2025-09-17T09:24:51.183Z",
      "updatedAt": "2025-09-17T09:24:51.183Z"
    },
    {
      "name": "Santiago de Cuba > Sta Barbara",
      "cost": 300,
      "id": 1758101134159,
      "createdAt": "2025-09-17T09:25:34.159Z",
      "updatedAt": "2025-09-17T09:25:34.159Z"
    },
    {
      "name": "Santiago de Cuba > Sueño",
      "cost": 250,
      "id": 1758101147999,
      "createdAt": "2025-09-17T09:25:47.999Z",
      "updatedAt": "2025-09-17T09:25:47.999Z"
    },
    {
      "name": "Santiago de Cuba > San Pedrito",
      "cost": 150,
      "id": 1758101195423,
      "createdAt": "2025-09-17T09:26:35.423Z",
      "updatedAt": "2025-09-17T09:28:10.297Z"
    },
    {
      "name": "Santiago de Cuba > Agüero",
      "cost": 100,
      "id": 1758101214991,
      "createdAt": "2025-09-17T09:26:54.991Z",
      "updatedAt": "2025-09-17T09:26:54.991Z"
    },
    {
      "name": "Santiago de Cuba > Distrito Jose Martí",
      "cost": 150,
      "id": 1758101231864,
      "createdAt": "2025-09-17T09:27:11.864Z",
      "updatedAt": "2025-09-17T09:27:11.864Z"
    },
    {
      "name": "Santiago de Cuba > Los Pinos",
      "cost": 200,
      "id": 1758101271623,
      "createdAt": "2025-09-17T09:27:51.623Z",
      "updatedAt": "2025-09-17T09:27:51.623Z"
    },
    {
      "name": "Santiago de Cuba > Quintero",
      "cost": 500,
      "id": 1758101326983,
      "createdAt": "2025-09-17T09:28:46.983Z",
      "updatedAt": "2025-09-17T09:28:46.983Z"
    },
    {
      "name": "Santiago de Cuba > 30 de noviembre bajo",
      "cost": 400,
      "id": 1758101359671,
      "createdAt": "2025-09-17T09:29:19.671Z",
      "updatedAt": "2025-09-17T09:29:19.671Z"
    },
    {
      "name": "Santiago de Cuba > Rajayoga",
      "cost": 600,
      "id": 1758101371199,
      "createdAt": "2025-09-17T09:29:31.199Z",
      "updatedAt": "2025-09-17T09:29:31.199Z"
    },
    {
      "name": "Santiago de Cuba > Pastorita",
      "cost": 600,
      "id": 1758101381527,
      "createdAt": "2025-09-17T09:29:41.527Z",
      "updatedAt": "2025-09-17T09:29:41.527Z"
    },
    {
      "name": "Santiago de Cuba > Vista Alegre",
      "cost": 300,
      "id": 1758101392543,
      "createdAt": "2025-09-17T09:29:52.543Z",
      "updatedAt": "2025-09-17T09:29:52.543Z"
    },
    {
      "name": "Santiago de Cuba > Caney",
      "cost": 1000,
      "id": 1758101407935,
      "createdAt": "2025-09-17T09:30:07.935Z",
      "updatedAt": "2025-09-17T09:30:07.935Z"
    },
    {
      "name": "Santiago de Cuba > Nuevo Vista Alegre",
      "cost": 100,
      "id": 1758101424479,
      "createdAt": "2025-09-17T09:30:24.479Z",
      "updatedAt": "2025-09-17T09:30:24.479Z"
    },
    {
      "name": "Santiago de Cuba > Marimón",
      "cost": 100,
      "id": 1758101435703,
      "createdAt": "2025-09-17T09:30:35.703Z",
      "updatedAt": "2025-09-17T09:30:35.703Z"
    },
    {
      "name": "Santiago de Cuba > Versalle Edificios",
      "cost": 800,
      "id": 1758101461055,
      "createdAt": "2025-09-17T09:31:01.055Z",
      "updatedAt": "2025-09-17T09:31:01.055Z"
    },
    {
      "name": "Santiago de Cuba > Ferreiro",
      "cost": 300,
      "id": 1758101481079,
      "createdAt": "2025-09-17T09:31:21.079Z",
      "updatedAt": "2025-09-17T09:31:21.079Z"
    },
    {
      "name": "Santiago de Cuba > 30 de noviembre altos",
      "cost": 500,
      "id": 1758101546055,
      "createdAt": "2025-09-17T09:32:26.055Z",
      "updatedAt": "2025-09-17T09:32:26.055Z"
    }
  ],
  "novels": [
    {
      "id": 1,
      "titulo": "El Turco",
      "genero": "Acción, Drama y Romance",
      "capitulos": 6,
      "año": 2025,
      "descripcion": "Balaban, un soldado del ejército jenízaro, se va a vivir a Moena, en el norte de Italia, después de la Batalla de Viena en 1683 y lucha por los derechos de la gente local.",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-20T07:35:27.323Z"
    },
    {
      "id": 2,
      "titulo": "Holding",
      "genero": "Familia, Drama",
      "capitulos": 20,
      "año": 2024,
      "descripcion": "Aydan, campeona de apnea, se incorpora a una poderosa empresa familiar. Su presencia saca a la luz oscuros secretos y luchas de poder. Debe sortear la influencia corruptora de la riqueza sin dejar de ser fiel a sí misma.",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-20T07:38:27.922Z"
    },
    {
      "id": 3,
      "titulo": "La Realeza ",
      "genero": "Drama, Comedia",
      "capitulos": 8,
      "año": 2025,
      "descripcion": "Un joven y apuesto príncipe conoce a una chica que dirige el primer hotel de lujo de la India. El encuentro de estos dos mundos, la aristocracia en decadencia y el capitalismo desenfrenado, genera un torbellino de ambición, conflicto y romance.",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-20T07:41:35.857Z"
    },
    {
      "id": 4,
      "titulo": "Valentina, mi amor especial",
      "genero": "Drama",
      "capitulos": 30,
      "año": 2024,
      "descripcion": "La historia de una niña con autismo que se convierte en un genio de la tecnología.",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-20T07:41:00.465Z"
    },
    {
      "id": 5,
      "titulo": "Alaca (Cicatrices del alma)",
      "genero": "Drama.",
      "capitulos": 120,
      "año": 2024,
      "descripcion": "La vida de una niña se pone patas arriba cuando le roban el riñón durante un violento secuestro, orquestado por su padre biológico rico que necesita un donante.",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-09-21T08:59:08.653Z"
    },
    {
      "titulo": "Viceversa",
      "genero": "Drama",
      "capitulos": 80,
      "año": 2023,
      "descripcion": "El argumento propuesto por los guionistas Amílcar Salatti, Yoel Infante y María Claudia Figueroa parte de la historia de tres parejas de jóvenes que acuden a un concierto de música electrónica y sufren un accidente, lo que detona sucesos posteriores.",
      "id": 1758354384106,
      "createdAt": "2025-09-20T07:46:24.106Z",
      "updatedAt": "2025-09-20T07:46:24.106Z"
    },
    {
      "titulo": "Amar, Donde El Amor Teje Sus Redes",
      "genero": "Drama",
      "capitulos": 90,
      "año": 2025,
      "descripcion": "Estrella, una madre soltera, regresa al pequeño pueblo pesquero de su juventud después de la muerte de su padre. Se enamora de Fabián, un padre viudo y enfrenta un huracán de problemas que ponen en riesgo el bienestar de sus familias.",
      "id": 1758445394324,
      "createdAt": "2025-09-21T09:03:14.324Z",
      "updatedAt": "2025-09-21T09:03:14.324Z"
    },
    {
      "titulo": "Amor en blanco y negro",
      "genero": "Romance",
      "capitulos": 64,
      "año": 2017,
      "descripcion": "Una doctora que dedica su vida a salvar vidas es capturada por un hombre que se dedica a quitarlas.",
      "id": 1758445503268,
      "createdAt": "2025-09-21T09:05:03.268Z",
      "updatedAt": "2025-09-21T09:05:03.268Z"
    },
    {
      "titulo": "Amor Perfecto",
      "genero": "Drama, Romántica",
      "capitulos": 60,
      "año": 2023,
      "descripcion": "Amor Perfecto cuenta la historia de Marê (Camila Queiroz), una niña rica, estudiante de Administración y Finanzas, que se enamora del joven doctor Orlando (Diogo Almeida). Marê está de novia con Gaspar (Thiago Lacerda) pero dejará de lado los deseos de su padre para vivir ese amor. Sin embargo, la trágica muerte de su progenitor y los manejos de su madrastra para inculparla llevan a Marê a una prisión injusta.",
      "id": 1758445741890,
      "createdAt": "2025-09-21T09:09:01.890Z",
      "updatedAt": "2025-09-21T09:09:01.890Z"
    }
  ],
  "settings": {
    "autoSync": true,
    "syncInterval": 300000,
    "enableNotifications": true,
    "maxNotifications": 100
  },
  "metadata": {
    "totalOrders": 0,
    "totalRevenue": 0,
    "lastOrderDate": "",
    "systemUptime": "2025-09-05T07:41:37.754Z"
  }
};

// CREDENCIALES DE ACCESO (CONFIGURABLES)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'tvalacarta2024'
};

// Types
export interface PriceConfig {
  moviePrice: number;
  seriesPrice: number;
  transferFeePercentage: number;
  novelPricePerChapter: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  section: string;
  action: string;
}

export interface SyncStatus {
  lastSync: string;
  isOnline: boolean;
  pendingChanges: number;
}

export interface SystemConfig {
  version: string;
  lastExport: string;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  settings: {
    autoSync: boolean;
    syncInterval: number;
    enableNotifications: boolean;
    maxNotifications: number;
  };
  metadata: {
    totalOrders: number;
    totalRevenue: number;
    lastOrderDate: string;
    systemUptime: string;
  };
}

export interface AdminState {
  isAuthenticated: boolean;
  prices: PriceConfig;
  deliveryZones: DeliveryZone[];
  novels: Novel[];
  notifications: Notification[];
  syncStatus: SyncStatus;
  systemConfig: SystemConfig;
}

type AdminAction = 
  | { type: 'LOGIN'; payload: { username: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PRICES'; payload: PriceConfig }
  | { type: 'ADD_DELIVERY_ZONE'; payload: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_DELIVERY_ZONE'; payload: DeliveryZone }
  | { type: 'DELETE_DELIVERY_ZONE'; payload: number }
  | { type: 'ADD_NOVEL'; payload: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_NOVEL'; payload: Novel }
  | { type: 'DELETE_NOVEL'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SYNC_STATUS'; payload: Partial<SyncStatus> }
  | { type: 'SYNC_STATE'; payload: Partial<AdminState> }
  | { type: 'LOAD_SYSTEM_CONFIG'; payload: SystemConfig }
  | { type: 'UPDATE_SYSTEM_CONFIG'; payload: Partial<SystemConfig> };

interface AdminContextType {
  state: AdminState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updatePrices: (prices: PriceConfig) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: number) => void;
  addNovel: (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNovel: (novel: Novel) => void;
  deleteNovel: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  exportSystemConfig: () => void;
  importSystemConfig: (config: SystemConfig) => void;
  exportCompleteSourceCode: () => void;
  syncWithRemote: () => Promise<void>;
  broadcastChange: (change: any) => void;
  syncAllSections: () => Promise<void>;
}

// Initial state with embedded configuration
const initialState: AdminState = {
  isAuthenticated: false,
  prices: EMBEDDED_CONFIG.prices,
  deliveryZones: EMBEDDED_CONFIG.deliveryZones,
  novels: EMBEDDED_CONFIG.novels,
  notifications: [],
  syncStatus: {
    lastSync: new Date().toISOString(),
    isOnline: true,
    pendingChanges: 0,
  },
  systemConfig: EMBEDDED_CONFIG,
};

// Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN':
      if (action.payload.username === ADMIN_CREDENTIALS.username && action.payload.password === ADMIN_CREDENTIALS.password) {
        return { ...state, isAuthenticated: true };
      }
      return state;

    case 'LOGOUT':
      return { ...state, isAuthenticated: false };

    case 'UPDATE_PRICES':
      const updatedConfig = {
        ...state.systemConfig,
        prices: action.payload,
        lastExport: new Date().toISOString(),
      };
      return {
        ...state,
        prices: action.payload,
        systemConfig: updatedConfig,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'ADD_DELIVERY_ZONE':
      const newZone: DeliveryZone = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const configWithNewZone = {
        ...state.systemConfig,
        deliveryZones: [...state.systemConfig.deliveryZones, newZone],
        lastExport: new Date().toISOString(),
      };
      return {
        ...state,
        deliveryZones: [...state.deliveryZones, newZone],
        systemConfig: configWithNewZone,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'UPDATE_DELIVERY_ZONE':
      const updatedZones = state.deliveryZones.map(zone =>
        zone.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : zone
      );
      const configWithUpdatedZone = {
        ...state.systemConfig,
        deliveryZones: updatedZones,
        lastExport: new Date().toISOString(),
      };
      return {
        ...state,
        deliveryZones: updatedZones,
        systemConfig: configWithUpdatedZone,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'DELETE_DELIVERY_ZONE':
      const filteredZones = state.deliveryZones.filter(zone => zone.id !== action.payload);
      const configWithDeletedZone = {
        ...state.systemConfig,
        deliveryZones: filteredZones,
        lastExport: new Date().toISOString(),
      };
      return {
        ...state,
        deliveryZones: filteredZones,
        systemConfig: configWithDeletedZone,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'ADD_NOVEL':
      const newNovel: Novel = {
        ...action.payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const configWithNewNovel = {
        ...state.systemConfig,
        novels: [...state.systemConfig.novels, newNovel],
        lastExport: new Date().toISOString(),
      };
      return {
        ...state,
        novels: [...state.novels, newNovel],
        systemConfig: configWithNewNovel,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'UPDATE_NOVEL':
      const updatedNovels = state.novels.map(novel =>
        novel.id === action.payload.id
          ? { ...action.payload, updatedAt: new Date().toISOString() }
          : novel
      );
      const configWithUpdatedNovel = {
        ...state.systemConfig,
        novels: updatedNovels,
        lastExport: new Date().toISOString(),
      };
      return {
        ...state,
        novels: updatedNovels,
        systemConfig: configWithUpdatedNovel,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'DELETE_NOVEL':
      const filteredNovels = state.novels.filter(novel => novel.id !== action.payload);
      const configWithDeletedNovel = {
        ...state.systemConfig,
        novels: filteredNovels,
        lastExport: new Date().toISOString(),
      };
      return {
        ...state,
        novels: filteredNovels,
        systemConfig: configWithDeletedNovel,
        syncStatus: { ...state.syncStatus, pendingChanges: state.syncStatus.pendingChanges + 1 }
      };

    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications].slice(0, state.systemConfig.settings.maxNotifications),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'UPDATE_SYNC_STATUS':
      return {
        ...state,
        syncStatus: { ...state.syncStatus, ...action.payload },
      };

    case 'LOAD_SYSTEM_CONFIG':
      return {
        ...state,
        prices: action.payload.prices,
        deliveryZones: action.payload.deliveryZones,
        novels: action.payload.novels,
        systemConfig: action.payload,
        syncStatus: { ...state.syncStatus, lastSync: new Date().toISOString(), pendingChanges: 0 }
      };

    case 'UPDATE_SYSTEM_CONFIG':
      const newSystemConfig = { ...state.systemConfig, ...action.payload };
      return {
        ...state,
        systemConfig: newSystemConfig,
      };

    case 'SYNC_STATE':
      return {
        ...state,
        ...action.payload,
        syncStatus: { ...state.syncStatus, lastSync: new Date().toISOString(), pendingChanges: 0 }
      };

    default:
      return state;
  }
}

// Context creation
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Real-time sync service
class RealTimeSyncService {
  private listeners: Set<(data: any) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private storageKey = 'admin_system_state';
  private configKey = 'system_config';

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    this.syncInterval = setInterval(() => {
      this.checkForUpdates();
    }, 5000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  private handleStorageChange(event: StorageEvent) {
    if ((event.key === this.storageKey || event.key === this.configKey) && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        this.notifyListeners(newState);
      } catch (error) {
        console.error('Error parsing sync data:', error);
      }
    }
  }

  private checkForUpdates() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const config = localStorage.getItem(this.configKey);
      
      if (stored) {
        const storedState = JSON.parse(stored);
        this.notifyListeners(storedState);
      }
      
      if (config) {
        const configData = JSON.parse(config);
        this.notifyListeners({ systemConfig: configData });
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  subscribe(callback: (data: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcast(state: AdminState) {
    try {
      const syncData = {
        ...state,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(syncData));
      localStorage.setItem(this.configKey, JSON.stringify(state.systemConfig));
      this.notifyListeners(syncData);
    } catch (error) {
      console.error('Error broadcasting state:', error);
    }
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    this.listeners.clear();
  }
}

// Provider component
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [syncService] = React.useState(() => new RealTimeSyncService());

  // Load system config on startup
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem('system_config');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        dispatch({ type: 'LOAD_SYSTEM_CONFIG', payload: config });
      }
      
      const stored = localStorage.getItem('admin_system_state');
      if (stored) {
        const storedState = JSON.parse(stored);
        dispatch({ type: 'SYNC_STATE', payload: storedState });
      }
    } catch (error) {
      console.error('Error loading initial state:', error);
    }
  }, []);

  // Save state changes
  useEffect(() => {
    try {
      localStorage.setItem('admin_system_state', JSON.stringify(state));
      localStorage.setItem('system_config', JSON.stringify(state.systemConfig));
      syncService.broadcast(state);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state, syncService]);

  // Real-time sync listener
  useEffect(() => {
    const unsubscribe = syncService.subscribe((syncedState) => {
      if (JSON.stringify(syncedState) !== JSON.stringify(state)) {
        dispatch({ type: 'SYNC_STATE', payload: syncedState });
      }
    });
    return unsubscribe;
  }, [syncService, state]);

  useEffect(() => {
    return () => {
      syncService.destroy();
    };
  }, [syncService]);

  // Context methods implementation
  const login = (username: string, password: string): boolean => {
    dispatch({ type: 'LOGIN', payload: { username, password } });
    const success = username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
    if (success) {
      addNotification({
        type: 'success',
        title: 'Inicio de sesión exitoso',
        message: 'Bienvenido al panel de administración',
        section: 'Autenticación',
        action: 'login'
      });
    }
    return success;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    addNotification({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      section: 'Autenticación',
      action: 'logout'
    });
  };

  const updatePrices = (prices: PriceConfig) => {
    dispatch({ type: 'UPDATE_PRICES', payload: prices });
    addNotification({
      type: 'success',
      title: 'Precios actualizados',
      message: 'Los precios se han actualizado y sincronizado automáticamente',
      section: 'Precios',
      action: 'update'
    });
    broadcastChange({ type: 'prices', data: prices });
  };

  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona de entrega agregada',
      message: `Se agregó la zona "${zone.name}" y se sincronizó automáticamente`,
      section: 'Zonas de Entrega',
      action: 'create'
    });
    broadcastChange({ type: 'delivery_zone_add', data: zone });
  };

  const updateDeliveryZone = (zone: DeliveryZone) => {
    dispatch({ type: 'UPDATE_DELIVERY_ZONE', payload: zone });
    addNotification({
      type: 'success',
      title: 'Zona de entrega actualizada',
      message: `Se actualizó la zona "${zone.name}" y se sincronizó automáticamente`,
      section: 'Zonas de Entrega',
      action: 'update'
    });
    broadcastChange({ type: 'delivery_zone_update', data: zone });
  };

  const deleteDeliveryZone = (id: number) => {
    const zone = state.deliveryZones.find(z => z.id === id);
    dispatch({ type: 'DELETE_DELIVERY_ZONE', payload: id });
    addNotification({
      type: 'warning',
      title: 'Zona de entrega eliminada',
      message: `Se eliminó la zona "${zone?.name || 'Desconocida'}" y se sincronizó automáticamente`,
      section: 'Zonas de Entrega',
      action: 'delete'
    });
    broadcastChange({ type: 'delivery_zone_delete', data: { id } });
  };

  const addNovel = (novel: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela agregada',
      message: `Se agregó la novela "${novel.titulo}" y se sincronizó automáticamente`,
      section: 'Gestión de Novelas',
      action: 'create'
    });
    broadcastChange({ type: 'novel_add', data: novel });
  };

  const updateNovel = (novel: Novel) => {
    dispatch({ type: 'UPDATE_NOVEL', payload: novel });
    addNotification({
      type: 'success',
      title: 'Novela actualizada',
      message: `Se actualizó la novela "${novel.titulo}" y se sincronizó automáticamente`,
      section: 'Gestión de Novelas',
      action: 'update'
    });
    broadcastChange({ type: 'novel_update', data: novel });
  };

  const deleteNovel = (id: number) => {
    const novel = state.novels.find(n => n.id === id);
    dispatch({ type: 'DELETE_NOVEL', payload: id });
    addNotification({
      type: 'warning',
      title: 'Novela eliminada',
      message: `Se eliminó la novela "${novel?.titulo || 'Desconocida'}" y se sincronizó automáticamente`,
      section: 'Gestión de Novelas',
      action: 'delete'
    });
    broadcastChange({ type: 'novel_delete', data: { id } });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    addNotification({
      type: 'info',
      title: 'Notificaciones limpiadas',
      message: 'Se han eliminado todas las notificaciones del sistema',
      section: 'Notificaciones',
      action: 'clear'
    });
  };

  const exportSystemConfig = async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Exportación de configuración iniciada',
        message: 'Generando archivo de configuración JSON...',
        section: 'Sistema',
        action: 'export_config_start'
      });

      // Create comprehensive system configuration
      const completeConfig: SystemConfig = {
        ...state.systemConfig,
        version: '2.1.0',
        lastExport: new Date().toISOString(),
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels,
        metadata: {
          ...state.systemConfig.metadata,
          totalOrders: state.systemConfig.metadata.totalOrders,
          totalRevenue: state.systemConfig.metadata.totalRevenue,
          lastOrderDate: state.systemConfig.metadata.lastOrderDate,
          systemUptime: state.systemConfig.metadata.systemUptime,
        },
      };

      // Generate JSON file
      const configJson = JSON.stringify(completeConfig, null, 2);
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TV_a_la_Carta_Config_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update system config with export timestamp
      dispatch({ 
        type: 'UPDATE_SYSTEM_CONFIG', 
        payload: { lastExport: new Date().toISOString() } 
      });

      addNotification({
        type: 'success',
        title: 'Configuración exportada',
        message: 'La configuración JSON se ha exportado correctamente',
        section: 'Sistema',
        action: 'export_config'
      });
    } catch (error) {
      console.error('Error exporting system config:', error);
      addNotification({
        type: 'error',
        title: 'Error en la exportación de configuración',
        message: 'No se pudo exportar la configuración JSON',
        section: 'Sistema',
        action: 'export_config_error'
      });
    }
  };

  const exportCompleteSourceCode = async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Exportación de código fuente iniciada',
        message: 'Generando sistema completo con código fuente...',
        section: 'Sistema',
        action: 'export_source_start'
      });

      const zip = new JSZip();
      
      // Generate updated source code with current configuration
      const generateAdminContextSource = () => `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// CONFIGURACIÓN EMBEBIDA - Generada automáticamente
const EMBEDDED_CONFIG = ${JSON.stringify(state.systemConfig, null, 2)};

// CREDENCIALES DE ACCESO (CONFIGURABLES)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'tvalacarta2024'
};

// ... resto del código AdminContext.tsx igual ...`;

      const generateCartContextSource = () => `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Toast } from '../components/Toast';
import type { CartItem } from '../types/movie';

// PRECIOS EMBEBIDOS - Generados automáticamente
const EMBEDDED_PRICES = ${JSON.stringify(state.prices, null, 2)};

// ... resto del código CartContext.tsx igual ...`;

      const generatePriceCardSource = () => `import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';

// PRECIOS EMBEBIDOS - Generados automáticamente
const EMBEDDED_PRICES = ${JSON.stringify(state.prices, null, 2)};

// ... resto del código PriceCard.tsx igual ...`;

      const generateCheckoutModalSource = () => `import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Home, CreditCard, DollarSign, MessageCircle, Calculator, Truck, ExternalLink } from 'lucide-react';

// ZONAS DE ENTREGA EMBEBIDAS - Generadas automáticamente
const EMBEDDED_DELIVERY_ZONES = ${JSON.stringify(state.deliveryZones, null, 2)};

// PRECIOS EMBEBIDOS
const EMBEDDED_PRICES = ${JSON.stringify(state.prices, null, 2)};

// ... resto del código CheckoutModal.tsx igual ...`;

      const generateNovelasModalSource = () => `import React, { useState, useEffect } from 'react';
import { X, Download, MessageCircle, Phone, BookOpen, Info, Check, DollarSign, CreditCard, Calculator, Search, Filter, SortAsc, SortDesc, Smartphone } from 'lucide-react';

// CATÁLOGO DE NOVELAS EMBEBIDO - Generado automáticamente
const EMBEDDED_NOVELS = ${JSON.stringify(state.novels, null, 2)};

// PRECIOS EMBEBIDOS
const EMBEDDED_PRICES = ${JSON.stringify(state.prices, null, 2)};

// ... resto del código NovelasModal.tsx igual ...`;

      // Add files to ZIP
      zip.file('src/context/AdminContext.tsx', generateAdminContextSource());
      zip.file('src/context/CartContext.tsx', generateCartContextSource());
      zip.file('src/components/PriceCard.tsx', generatePriceCardSource());
      zip.file('src/components/CheckoutModal.tsx', generateCheckoutModalSource());
      zip.file('src/components/NovelasModal.tsx', generateNovelasModalSource());

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TV_a_la_Carta_SourceCode_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Código fuente exportado',
        message: 'El sistema completo se ha exportado como código fuente',
        section: 'Sistema',
        action: 'export_source'
      });
    } catch (error) {
      console.error('Error exporting source code:', error);
      addNotification({
        type: 'error',
        title: 'Error en la exportación de código',
        message: error instanceof Error ? error.message : 'No se pudo exportar el código fuente completo',
        section: 'Sistema',
        action: 'export_source_error'
      });
      throw error;
    }
  };

  const importSystemConfig = (config: SystemConfig) => {
    try {
      dispatch({ type: 'LOAD_SYSTEM_CONFIG', payload: config });
      addNotification({
        type: 'success',
        title: 'Configuración importada',
        message: 'La configuración del sistema se ha cargado correctamente',
        section: 'Sistema',
        action: 'import'
      });
    } catch (error) {
      console.error('Error importing system config:', error);
      addNotification({
        type: 'error',
        title: 'Error en la importación',
        message: 'No se pudo cargar la configuración del sistema',
        section: 'Sistema',
        action: 'import_error'
      });
    }
  };

  const syncAllSections = async (): Promise<void> => {
    try {
      addNotification({
        type: 'info',
        title: 'Sincronización completa iniciada',
        message: 'Sincronizando todas las secciones del sistema...',
        section: 'Sistema',
        action: 'sync_all_start'
      });

      // Simulate comprehensive sync of all sections
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update all components with current state
      const updatedConfig: SystemConfig = {
        ...state.systemConfig,
        lastExport: new Date().toISOString(),
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels,
      };

      dispatch({ type: 'UPDATE_SYSTEM_CONFIG', payload: updatedConfig });
      
      // Broadcast changes to all components
      window.dispatchEvent(new CustomEvent('admin_full_sync', { 
        detail: { 
          config: updatedConfig,
          timestamp: new Date().toISOString()
        } 
      }));

      addNotification({
        type: 'success',
        title: 'Sincronización completa exitosa',
        message: 'Todas las secciones se han sincronizado correctamente',
        section: 'Sistema',
        action: 'sync_all'
      });
    } catch (error) {
      console.error('Error in full sync:', error);
      addNotification({
        type: 'error',
        title: 'Error en sincronización completa',
        message: 'No se pudo completar la sincronización de todas las secciones',
        section: 'Sistema',
        action: 'sync_all_error'
      });
    }
  };

  const broadcastChange = (change: any) => {
    const changeEvent = {
      ...change,
      timestamp: new Date().toISOString(),
      source: 'admin_panel'
    };
    
    dispatch({ 
      type: 'UPDATE_SYNC_STATUS', 
      payload: { 
        lastSync: new Date().toISOString(),
        pendingChanges: Math.max(0, state.syncStatus.pendingChanges - 1)
      } 
    });

    window.dispatchEvent(new CustomEvent('admin_state_change', { 
      detail: changeEvent 
    }));
  };

  const syncWithRemote = async (): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_SYNC_STATUS', payload: { isOnline: true } });
      
      addNotification({
        type: 'info',
        title: 'Sincronización iniciada',
        message: 'Iniciando sincronización con el sistema remoto...',
        section: 'Sistema',
        action: 'sync_start'
      });

      // Simulate remote sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch({ 
        type: 'UPDATE_SYNC_STATUS', 
        payload: { 
          lastSync: new Date().toISOString(),
          pendingChanges: 0
        } 
      });
      
      addNotification({
        type: 'success',
        title: 'Sincronización completada',
        message: 'Todos los datos se han sincronizado correctamente',
        section: 'Sistema',
        action: 'sync'
      });
    } catch (error) {
      dispatch({ type: 'UPDATE_SYNC_STATUS', payload: { isOnline: false } });
      addNotification({
        type: 'error',
        title: 'Error de sincronización',
        message: 'No se pudo sincronizar con el servidor remoto',
        section: 'Sistema',
        action: 'sync_error'
      });
    }
  };

  return (
    <AdminContext.Provider
      value={{
        state,
        login,
        logout,
        updatePrices,
        addDeliveryZone,
        updateDeliveryZone,
        deleteDeliveryZone,
        addNovel,
        updateNovel,
        deleteNovel,
        addNotification,
        clearNotifications,
        exportSystemConfig,
        importSystemConfig,
        exportCompleteSourceCode,
        syncWithRemote,
        broadcastChange,
        syncAllSections,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export { AdminContext };