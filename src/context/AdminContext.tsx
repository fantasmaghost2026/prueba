import React, { createContext, useContext, useReducer, useEffect } from 'react';
import JSZip from 'jszip';

// CONFIGURACIÓN EMBEBIDA - Generada automáticamente
const EMBEDDED_CONFIG = {
  "version": "2.1.0",
  "prices": {
    "moviePrice": 100,
    "seriesPrice": 300,
    "transferFeePercentage": 10,
    "novelPricePerChapter": 5
  },
  "deliveryZones": [
    {
      "name": "Santiago de Cuba > Vista Hermosa",
      "cost": 400,
      "id": 1759549448776,
      "createdAt": "2025-10-04T03:44:08.776Z",
      "updatedAt": "2025-10-04T03:44:08.776Z"
    },
    {
      "name": "Santiago de Cuba > Antonio Maceo",
      "cost": 400,
      "id": 1759549461376,
      "createdAt": "2025-10-04T03:44:21.376Z",
      "updatedAt": "2025-10-04T03:44:21.376Z"
    },
    {
      "name": "Santiago de Cuba > Centro de la ciudad",
      "cost": 250,
      "id": 1759549473488,
      "createdAt": "2025-10-04T03:44:33.488Z",
      "updatedAt": "2025-10-04T03:44:33.488Z"
    },
    {
      "name": "Santiago de Cuba > Versalles Hasta el Hotel",
      "cost": 500,
      "id": 1759549486736,
      "createdAt": "2025-10-04T03:44:46.736Z",
      "updatedAt": "2025-10-04T03:44:46.736Z"
    },
    {
      "name": "Santiago de Cuba > Carretera del Morro",
      "cost": 300,
      "id": 1759549499552,
      "createdAt": "2025-10-04T03:44:59.552Z",
      "updatedAt": "2025-10-04T03:44:59.552Z"
    },
    {
      "name": "Santiago de Cuba > Altamira",
      "cost": 400,
      "id": 1759549511664,
      "createdAt": "2025-10-04T03:45:11.664Z",
      "updatedAt": "2025-10-04T03:45:11.664Z"
    },
    {
      "name": "Santiago de Cuba > Cangrejitos",
      "cost": 350,
      "id": 1759549521424,
      "createdAt": "2025-10-04T03:45:21.424Z",
      "updatedAt": "2025-10-04T03:45:21.424Z"
    },
    {
      "name": "Santiago de Cuba > Trocha",
      "cost": 250,
      "id": 1759549534560,
      "createdAt": "2025-10-04T03:45:34.560Z",
      "updatedAt": "2025-10-04T03:45:34.560Z"
    },
    {
      "name": "Santiago de Cuba > Veguita de Galo",
      "cost": 300,
      "id": 1759549546912,
      "createdAt": "2025-10-04T03:45:46.912Z",
      "updatedAt": "2025-10-04T03:45:46.912Z"
    },
    {
      "name": "Santiago de Cuba > Plaza de Martes",
      "cost": 250,
      "id": 1759549558000,
      "createdAt": "2025-10-04T03:45:58.000Z",
      "updatedAt": "2025-10-04T03:45:58.000Z"
    },
    {
      "name": "Santiago de Cuba > Portuondo",
      "cost": 300,
      "id": 1759549569112,
      "createdAt": "2025-10-04T03:46:09.112Z",
      "updatedAt": "2025-10-04T03:46:09.112Z"
    },
    {
      "name": "Santiago de Cuba > Sta Barbara",
      "cost": 300,
      "id": 1759549580560,
      "createdAt": "2025-10-04T03:46:20.560Z",
      "updatedAt": "2025-10-04T03:46:20.560Z"
    },
    {
      "name": "Santiago de Cuba > Sueño",
      "cost": 250,
      "id": 1759549592112,
      "createdAt": "2025-10-04T03:46:32.112Z",
      "updatedAt": "2025-10-04T03:46:32.112Z"
    },
    {
      "name": "Santiago de Cuba > San Pedrito",
      "cost": 150,
      "id": 1759549603696,
      "createdAt": "2025-10-04T03:46:43.696Z",
      "updatedAt": "2025-10-04T03:46:43.696Z"
    },
    {
      "name": "Santiago de Cuba > Agüero",
      "cost": 100,
      "id": 1759549615848,
      "createdAt": "2025-10-04T03:46:55.848Z",
      "updatedAt": "2025-10-04T03:46:55.848Z"
    },
    {
      "name": "Santiago de Cuba > Distrito Jose Martí",
      "cost": 150,
      "id": 1759549627504,
      "createdAt": "2025-10-04T03:47:07.504Z",
      "updatedAt": "2025-10-04T03:47:07.504Z"
    },
    {
      "name": "Santiago de Cuba > Los Pinos",
      "cost": 200,
      "id": 1759549638272,
      "createdAt": "2025-10-04T03:47:18.272Z",
      "updatedAt": "2025-10-04T03:47:18.272Z"
    },
    {
      "name": "Santiago de Cuba > Quintero",
      "cost": 500,
      "id": 1759549649480,
      "createdAt": "2025-10-04T03:47:29.480Z",
      "updatedAt": "2025-10-04T03:47:29.480Z"
    },
    {
      "name": "Santiago de Cuba > 30 de noviembre bajo",
      "cost": 400,
      "id": 1759549660904,
      "createdAt": "2025-10-04T03:47:40.904Z",
      "updatedAt": "2025-10-04T03:47:40.904Z"
    },
    {
      "name": "Santiago de Cuba > Rajayoga",
      "cost": 600,
      "id": 1759549668800,
      "createdAt": "2025-10-04T03:47:48.800Z",
      "updatedAt": "2025-10-04T03:47:48.800Z"
    },
    {
      "name": "Santiago de Cuba > Pastorita",
      "cost": 600,
      "id": 1759549676760,
      "createdAt": "2025-10-04T03:47:56.760Z",
      "updatedAt": "2025-10-04T03:47:56.760Z"
    },
    {
      "name": "Santiago de Cuba > Vista Alegre",
      "cost": 300,
      "id": 1759549686896,
      "createdAt": "2025-10-04T03:48:06.896Z",
      "updatedAt": "2025-10-04T03:48:06.896Z"
    },
    {
      "name": "Santiago de Cuba > Caney",
      "cost": 1000,
      "id": 1759549696240,
      "createdAt": "2025-10-04T03:48:16.240Z",
      "updatedAt": "2025-10-04T03:48:16.240Z"
    },
    {
      "name": "Santiago de Cuba > Nuevo Vista Alegre",
      "cost": 100,
      "id": 1759549706888,
      "createdAt": "2025-10-04T03:48:26.888Z",
      "updatedAt": "2025-10-04T03:48:26.888Z"
    },
    {
      "name": "Santiago de Cuba > Marimón",
      "cost": 100,
      "id": 1759549715521,
      "createdAt": "2025-10-04T03:48:35.521Z",
      "updatedAt": "2025-10-04T03:48:35.521Z"
    },
    {
      "name": "Santiago de Cuba > Versalle Edificios",
      "cost": 800,
      "id": 1759549729736,
      "createdAt": "2025-10-04T03:48:49.736Z",
      "updatedAt": "2025-10-04T03:48:49.736Z"
    },
    {
      "name": "Santiago de Cuba > Ferreiro",
      "cost": 300,
      "id": 1759549738720,
      "createdAt": "2025-10-04T03:48:58.720Z",
      "updatedAt": "2025-10-04T03:48:58.720Z"
    },
    {
      "name": "Santiago de Cuba > 30 de noviembre altos",
      "cost": 500,
      "id": 1759549747952,
      "createdAt": "2025-10-04T03:49:07.952Z",
      "updatedAt": "2025-10-04T03:49:07.952Z"
    }
  ],
  "novels": [
    {
      "titulo": "Alaca",
      "genero": "Drama",
      "capitulos": 120,
      "año": 2024,
      "descripcion": "La vida de una joven se ve destrozada cuando le roban un riñón durante un violento secuestro, organizado por su rico padre biológico, que necesita un donante. Mientras busca respuestas, descubre el secreto que cambió su vida y se enfrenta a la traición de Kenan, el amor de su vida, cuyas complicadas lealtades ponen a prueba su vínculo.",
      "pais": "Turquía",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/alaca.jpeg",
      "estado": "finalizada",
      "id": 1759547587158,
      "createdAt": "2025-10-04T03:13:07.158Z",
      "updatedAt": "2025-10-04T03:16:03.389Z"
    },
    {
      "titulo": "Salvaje (Yabani)",
      "genero": "Drama",
      "capitulos": 20,
      "año": 2023,
      "descripcion": "Salvaje novela turca, Yaman es un joven que ha vivido en las calles desde que tiene uso de razón. Ha tenido una vida dura, teniendo que luchar para sobrevivir y encontrar comida. Afortunadamente, siempre ha tenido a su lado tres amigos que se convirtieron en su familia, Cesur, Asi y Umut.\n\nSe cruzaron cuando eran apenas unos niños y a partir de ahí no se separaron. De manera inexplicable ninguno sabe nada de su pasado o porque están en la calle, sin importar su pasado o traumas decidieron confiar entre ellos y seguir adelante.\n\nLa gran preocupación del grupo es cumplir con el tratamiento de Umut, quien no puede caminar y el “Doctor milagro” es su única esperanza, pero el médico vive en el extranjero y ve a pocos pacientes una vez al año cuando llega al país. \n\nYaman cometerá el mayor error de su vida, entrando a una mansión que probablemente podría ser la de su familia, pero se le cae la cara de vergüenza ya que ha atacado a quien sería su hermano y apuñalado a su madre. Ahora su familia y la policía lo buscan.\n\nLa vida de Yaman comenzará a dar un giro inesperado cuando se cruce con Ates y su novia Ruya. Estos salían de un club nocturno. A partir de ahí una serie de eventos golpearán la vida de Yaman y lo llevarán al límite. Salvaje serie turca.",
      "pais": "Turquía",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/salvaje.jpeg",
      "estado": "transmision",
      "id": 1759547831629,
      "createdAt": "2025-10-04T03:17:11.629Z",
      "updatedAt": "2025-10-04T03:17:11.629Z"
    },
    {
      "titulo": "El Turco",
      "genero": "Romance",
      "capitulos": 6,
      "año": 2024,
      "descripcion": "Tras ser traicionado y condenado a muerte, logra escapar y es curado por los aldeanos del pintoresco pueblo italiano de Moena, ubicado en los Alpes. A medida que se recupera, Balaban, al que apodan 'El Turco', se convierte en protector del pueblo, resistiendo las opresivas cargas impositivas de su señor feudal. Con el tiempo, la lucha se intensifica y, cuando un antiguo enemigo del protagonista, el implacable caballero Marco, aparece, comienza la batalla decisiva.",
      "pais": "Turquía",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/el+turco.jpeg",
      "estado": "finalizada",
      "id": 1759547886013,
      "createdAt": "2025-10-04T03:18:06.013Z",
      "updatedAt": "2025-10-04T03:18:06.013Z"
    },
    {
      "titulo": "Amar, donde el amor teje sus redes",
      "genero": "Romance",
      "capitulos": 90,
      "año": 2025,
      "descripcion": "Estrella Contreras, una madre soltera que lucha por criar a su hija Azul, regresa a su pueblo natal tras la muerte de su padre, donde conoce a Fabián Bravo, un padre viudo y pescador que lucha por recuperar la custodia de su hija Yazmín.",
      "pais": "México",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/amar+donde+el+amor+teje+sus+redes.jpg",
      "estado": "finalizada",
      "id": 1759548453473,
      "createdAt": "2025-10-04T03:27:33.473Z",
      "updatedAt": "2025-10-04T03:27:33.473Z"
    },
    {
      "titulo": "Amor en blanco y negro ES (Siyah Beyaz Ask)",
      "genero": "Romance",
      "capitulos": 64,
      "año": 2017,
      "descripcion": "Amor en Blanco y Negro novela turca es protagonizada por Ferhat Aslan, un joven que tiene un empleo que no todos pueden cumplir. Él es un asesino que trabaja para Namik, quien es su tío. Namik es el líder de los Emirham. La otra protagonista de esta serie es Asli Cinar, una neurocirujana que adora su empleo. Un día, no regresará a casa y será secuestrada por sus habilidades con el bisturí. Tendrá que salvarle la vida a un hombre al que Ferhat agredió. Sorprendida por los hechos, se convertirá en testigo de ese crimen, y reconocerá al infame Namik Emirham.\n\nSerá allí cuando Namik desarrolle desconfianza hacia la mujer, y es que además de ser un mafioso, es uno de los benefactores más importantes del hospital en dónde trabaja Asli. Namik le dará la misión a Ferhat de asesinar a la testigo, pero no podrá completarla, y le ofrecerá a Asli la opción de morir o contraer matrimonio con él. Resultará que el hermano de nuestra protagonista es policía, y está investigando casos de corrupción, en los que se incluye a los Emirham. Se llevará a cabo la boda, pero Namik jamás creerá que el amor floreció entre su sobrino y la neurocirujana.\n\nSeguirán con su matrimonio falso en Amor en Blanco y Negro serie turca, y poco a poco, Asli dejará de sentir miedo hacia Ferhat.",
      "pais": "Turquía",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/amor+en+blanco+y+negro.jpeg",
      "estado": "finalizada",
      "id": 1759548589366,
      "createdAt": "2025-10-04T03:29:49.366Z",
      "updatedAt": "2025-10-04T03:29:49.366Z"
    },
    {
      "titulo": "Amor perfecto",
      "genero": "Romance",
      "capitulos": 60,
      "año": 2023,
      "descripcion": "Amor perfecto novela brasileña, Mare es una joven visionaria, regresa a su pueblo natal en 1934 para tomar las riendas del hotel familiar. Sus sueños se ven truncados cuando su padre, cegado por los prejuicios, la obliga a casarse con Gaspar, un hombre malvado y sin escrúpulos. La ambición desmedida de Gilda, la madrastra de Mare, la lleva a conspirar con Gaspar para deshacerse de Leonel, el padre de Mare, y culpar a la joven de su muerte.\n\nMare es encarcelada injustamente y da a luz en la cárcel. Tras ocho años en prisión, finalmente cumple su condena en el año 1942, sale de prisión con un solo objetivo, vengarse de quienes la traicionaron y recuperar a su hijo perdido.\n\nEn su camino, Mare se reencuentra con Orlando, un médico que la amó en el pasado y que ahora está dispuesto a luchar por ella. Juntos, se enfrentan a los poderosos de Sao Jacinto. Mientras tanto Marcelino, es hijo de Orlando y Mare, se ha criado en un monasterio, a cargo de Fray León, quien se ha convertido en una figura paterna para el joven.\n\nGilda se ha convertido en una mujer poderosa e influyente, Mare hará todo en sus manos para recuperar su vida, reencontrarse con su hijo y vengarse de aquellos que le hicieron daño. Amor perfecto telenovela brasileña. ",
      "pais": "Brasil",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/e7dWk4egyN4MvtB1y1HROZIHI.jpeg",
      "estado": "finalizada",
      "id": 1759548723639,
      "createdAt": "2025-10-04T03:32:03.639Z",
      "updatedAt": "2025-10-04T03:32:03.639Z"
    },
    {
      "titulo": "Holding",
      "genero": "Drama",
      "capitulos": 20,
      "año": 2024,
      "descripcion": "La campeona mundial de apnea, Aydan Türker, se prepara para una nueva inmersión récord. Aydan no solo es una atleta exitosa; es una mujer emprendedora que ha entregado su corazón a los niños. Todos los ingresos que obtiene de su gran pasión, el buceo, los dedica a mantener en pie las escuelas que fundó, incluyendo aquellas que atienden a niños con necesidades educativas especiales. Uno de esos colegios le traerá a su vida a F?rat y al comisario Kerem. Uno de los principales patrocinadores de Aydan Türker es Alt?nordu Holding, uno de los grupos empresariales más grandes del país. Bajo el liderazgo de Osman Alt?nordu y con el impulso de sus hijas Ebru, Ceyda y Sema, la empresa crece día a día con una imagen impecable. Sin embargo, detrás de ese brillante rostro se esconden luchas de poder, conflictos familiares y un pasado oscuro. Como todo gran poder, Alt?nordu Holding también tiene grandes enemigos. Su adversario más peligroso es Mahir Beyo?lu, cómplice de aquel pasado oscuro. El viejo amigo y compañero de Osman, Zakir, tendrá que jugar con astucia para detener a Mahir. En medio de este caos, Osman descubre que padece una enfermedad incurable. Al borde de una ruptura total, se encuentra frente a la necesidad de enfrentarse al secreto mejor guardado de su vida: su hija, y con ello, a toda su familia. Para esa confrontación, Osman elige el mismo día en que Aydan romperá su nuevo récord. Ese día marcará el inicio de un viaje sin retorno para todos.",
      "pais": "Turquía",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/holding.jpeg",
      "estado": "finalizada",
      "id": 1759548810927,
      "createdAt": "2025-10-04T03:33:30.927Z",
      "updatedAt": "2025-10-04T03:41:48.825Z"
    },
    {
      "titulo": "La realeza",
      "genero": "Romance",
      "capitulos": 8,
      "año": 2025,
      "descripcion": "'La realeza' presenta una historia romántica que trasciende clichés. La trama gira en torno al encuentro entre Sophia, una empresaria moderna, y Aviraaj, un príncipe con un legado en decadencia. Él posee una mansión ancestral que necesita ser restaurada, pero carece de los fondos necesarios. Ella ve en ese lugar la oportunidad perfecta para lanzar su nueva empresa. Así, ambos deciden colaborar, aunque sus diferencias culturales y personales amenazan con arruinar todo. \n\nEl encantador príncipe Aviraaj conoce a Sofía, una empresaria hecha a sí misma, y los mundos de la realeza y las startups chocan en una apasionada tormenta de romance y ambición",
      "pais": "India",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/la+realeza.jpeg",
      "estado": "finalizada",
      "id": 1759548887343,
      "createdAt": "2025-10-04T03:34:47.343Z",
      "updatedAt": "2025-10-04T03:34:47.343Z"
    },
    {
      "titulo": "Valentina, mi amor especial",
      "genero": "Romance",
      "capitulos": 39,
      "año": 2024,
      "descripcion": "En Valentina, mi amor especial, Herrera encarna a una joven en el espectro autista, quien es un genio en el mundo de la tecnología. El papel masculino principal es interpretado por Mauricio Novoa, un actor mexicano en ascenso, conocido por sus actuaciones en las últimas telenovelas producidas en Miami.\n\nValentina ha crecido protegida de la sociedad por su madre adoptiva en el pequeño pueblo de Chiquilistlán, donde destacó académicamente. Mudarse a la gran ciudad de Guadalajara después de que su madre fallece en un accidente será muy difícil, ya que se enfrentará lo peor y lo mejor de la humanidad: se enamorará por primera vez, conocerá nuevos amigos, pero también la envidia y los celos de aquellos que eligen no aceptarla.",
      "pais": "México",
      "imagen": "https://f005.backblazeb2.com/file/120000/tvalacarta/valentina+mi+amor+especial.jpeg",
      "estado": "finalizada",
      "id": 1759549070923,
      "createdAt": "2025-10-04T03:37:50.923Z",
      "updatedAt": "2025-10-04T03:37:50.923Z"
    }
  ],
  "settings": {
    "version": "2.1.0",
    "autoSync": true,
    "syncInterval": 300000,
    "enableNotifications": true,
    "maxNotifications": 100,
    "metadata": {
      "totalOrders": 0,
      "totalRevenue": 0,
      "lastOrderDate": "",
      "systemUptime": "2025-10-04T02:55:36.295Z"
    }
  },
  "syncStatus": {
    "lastSync": "2025-10-04T03:49:03.729Z",
    "isOnline": true,
    "pendingChanges": 1
  },
  "exportDate": "2025-10-04T03:49:10.992Z"
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

      // Importar dinámicamente el generador de código fuente
      try {
        const { generateCompleteSourceCode } = await import('../utils/sourceCodeGenerator');
        await generateCompleteSourceCode(state.systemConfig);
      } catch (importError) {
        console.error('Error importing source code generator:', importError);
        throw new Error('No se pudo cargar el generador de código fuente');
      }

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