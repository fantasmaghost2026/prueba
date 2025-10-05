import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Toast } from '../components/Toast';
import type { CartItem, NovelCartItem, AllCartItems } from '../types/movie';

// PRECIOS EMBEBIDOS - Generados automáticamente
const EMBEDDED_PRICES = {
  "moviePrice": 80,
  "seriesPrice": 300,
  "transferFeePercentage": 10,
  "novelPricePerChapter": 5
};

interface SeriesCartItem extends CartItem {
  selectedSeasons?: number[];
  paymentType?: 'cash' | 'transfer';
}

interface CartState {
  items: (SeriesCartItem | NovelCartItem)[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: SeriesCartItem | NovelCartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_SEASONS'; payload: { id: number; seasons: number[] } }
  | { type: 'UPDATE_PAYMENT_TYPE'; payload: { id: number; paymentType: 'cash' | 'transfer' } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: (SeriesCartItem | NovelCartItem)[] }
  | { type: 'UPDATE_PRICES'; payload: any };

interface CartContextType {
  state: CartState;
  addItem: (item: SeriesCartItem | NovelCartItem) => void;
  addNovel: (novel: NovelCartItem) => void;
  removeItem: (id: number) => void;
  updateSeasons: (id: number, seasons: number[]) => void;
  updatePaymentType: (id: number, paymentType: 'cash' | 'transfer') => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  getItemSeasons: (id: number) => number[];
  getItemPaymentType: (id: number) => 'cash' | 'transfer';
  calculateItemPrice: (item: SeriesCartItem | NovelCartItem) => number;
  calculateTotalPrice: () => number;
  calculateTotalByPaymentType: () => { cash: number; transfer: number };
  getCurrentPrices: () => any;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.some(item => item.id === action.payload.id && item.type === action.payload.type)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + 1
      };
    case 'UPDATE_SEASONS':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id && item.type !== 'novel'
            ? { ...item, selectedSeasons: action.payload.seasons }
            : item
        )
      };
    case 'UPDATE_PAYMENT_TYPE':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id 
            ? { ...item, paymentType: action.payload.paymentType }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - 1
      };
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };
    case 'LOAD_CART':
      return {
        items: action.payload,
        total: action.payload.length
      };
    case 'UPDATE_PRICES':
      // Prices are now embedded, no need to update state
      return state;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const [currentPrices, setCurrentPrices] = React.useState(EMBEDDED_PRICES);
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  // Listen for admin price updates
  useEffect(() => {
    const handleAdminStateChange = (event: CustomEvent) => {
      if (event.detail.type === 'prices') {
        setCurrentPrices(event.detail.data);
      }
    };

    const handleAdminFullSync = (event: CustomEvent) => {
      if (event.detail.config?.prices) {
        setCurrentPrices(event.detail.config.prices);
      }
    };

    window.addEventListener('admin_state_change', handleAdminStateChange as EventListener);
    window.addEventListener('admin_full_sync', handleAdminFullSync as EventListener);

    // Check for stored admin config
    try {
      const adminConfig = localStorage.getItem('system_config');
      if (adminConfig) {
        const config = JSON.parse(adminConfig);
        if (config.prices) {
          setCurrentPrices(config.prices);
        }
      }
    } catch (error) {
      console.error('Error loading admin prices:', error);
    }

    return () => {
      window.removeEventListener('admin_state_change', handleAdminStateChange as EventListener);
      window.removeEventListener('admin_full_sync', handleAdminFullSync as EventListener);
    };
  }, []);

  // Clear cart on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('pageRefreshed', 'true');
    };

    const handleLoad = () => {
      if (sessionStorage.getItem('pageRefreshed') === 'true') {
        localStorage.removeItem('movieCart');
        dispatch({ type: 'CLEAR_CART' });
        sessionStorage.removeItem('pageRefreshed');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    if (sessionStorage.getItem('pageRefreshed') === 'true') {
      localStorage.removeItem('movieCart');
      dispatch({ type: 'CLEAR_CART' });
      sessionStorage.removeItem('pageRefreshed');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('pageRefreshed') !== 'true') {
      const savedCart = localStorage.getItem('movieCart');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: items });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('movieCart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: SeriesCartItem | NovelCartItem) => {
    const itemWithDefaults = { 
      ...item, 
      paymentType: 'cash' as const,
      selectedSeasons: item.type === 'tv' && 'selectedSeasons' in item && !item.selectedSeasons ? [1] : 'selectedSeasons' in item ? item.selectedSeasons : undefined
    };
    dispatch({ type: 'ADD_ITEM', payload: itemWithDefaults });
    
    setToast({
      message: `"${item.title}" agregado al carrito`,
      type: 'success',
      isVisible: true
    });
  };

  const addNovel = (novel: NovelCartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: novel });
    
    setToast({
      message: `"${novel.title}" agregada al carrito`,
      type: 'success',
      isVisible: true
    });
  };
  const removeItem = (id: number) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    if (item) {
      setToast({
        message: `"${item.title}" retirado del carrito`,
        type: 'error',
        isVisible: true
      });
    }
  };

  const updateSeasons = (id: number, seasons: number[]) => {
    dispatch({ type: 'UPDATE_SEASONS', payload: { id, seasons } });
  };

  const updatePaymentType = (id: number, paymentType: 'cash' | 'transfer') => {
    dispatch({ type: 'UPDATE_PAYMENT_TYPE', payload: { id, paymentType } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (id: number) => {
    return state.items.some(item => item.id === id);
  };

  const getItemSeasons = (id: number): number[] => {
    const item = state.items.find(item => item.id === id);
    return (item && 'selectedSeasons' in item) ? item.selectedSeasons || [] : [];
  };

  const getItemPaymentType = (id: number): 'cash' | 'transfer' => {
    const item = state.items.find(item => item.id === id);
    return item?.paymentType || 'cash';
  };

  const getCurrentPrices = () => {
    return currentPrices;
  };

  const calculateItemPrice = (item: SeriesCartItem | NovelCartItem): number => {
    const moviePrice = currentPrices.moviePrice;
    const seriesPrice = currentPrices.seriesPrice;
    const novelPricePerChapter = currentPrices.novelPricePerChapter;
    const transferFeePercentage = currentPrices.transferFeePercentage;
    
    if (item.type === 'novel') {
      const novelItem = item as NovelCartItem;
      const basePrice = novelItem.chapters * novelPricePerChapter;
      return item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
    } else if (item.type === 'movie') {
      const basePrice = moviePrice;
      return item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
    } else {
      const seriesItem = item as SeriesCartItem;
      const seasons = seriesItem.selectedSeasons?.length || 1;
      const basePrice = seasons * seriesPrice;
      return item.paymentType === 'transfer' ? Math.round(basePrice * (1 + transferFeePercentage / 100)) : basePrice;
    }
  };

  const calculateTotalPrice = (): number => {
    return state.items.reduce((total, item) => {
      return total + calculateItemPrice(item);
    }, 0);
  };

  const calculateTotalByPaymentType = (): { cash: number; transfer: number } => {
    const moviePrice = currentPrices.moviePrice;
    const seriesPrice = currentPrices.seriesPrice;
    const novelPricePerChapter = currentPrices.novelPricePerChapter;
    const transferFeePercentage = currentPrices.transferFeePercentage;
    
    return state.items.reduce((totals, item) => {
      let basePrice: number;
      if (item.type === 'novel') {
        const novelItem = item as NovelCartItem;
        basePrice = novelItem.chapters * novelPricePerChapter;
      } else if (item.type === 'movie') {
        basePrice = moviePrice;
      } else {
        const seriesItem = item as SeriesCartItem;
        basePrice = (seriesItem.selectedSeasons?.length || 1) * seriesPrice;
      }
      
      if (item.paymentType === 'transfer') {
        totals.transfer += Math.round(basePrice * (1 + transferFeePercentage / 100));
      } else {
        totals.cash += basePrice;
      }
      return totals;
    }, { cash: 0, transfer: 0 });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <CartContext.Provider value={{ 
      state, 
      addItem, 
      addNovel,
      removeItem, 
      updateSeasons, 
      updatePaymentType,
      clearCart, 
      isInCart, 
      getItemSeasons,
      getItemPaymentType,
      calculateItemPrice,
      calculateTotalPrice,
      calculateTotalByPaymentType,
      getCurrentPrices
    }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}