import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Home, CreditCard, DollarSign, Send, Calculator, Truck, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
}

export interface OrderData {
  orderId: string;
  customerInfo: CustomerInfo;
  deliveryZone: string;
  deliveryCost: number;
  items: any[];
  subtotal: number;
  transferFee: number;
  total: number;
  cashTotal?: number;
  transferTotal?: number;
  pickupLocation?: boolean;
  showLocationMap?: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (orderData: OrderData) => void;
  items: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}

// Validador de números de teléfono cubanos
const validateCubanPhone = (phone: string): boolean => {
  // Remover espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Patrones válidos para números cubanos
  const patterns = [
    /^(\+53|53)?[5-9]\d{7}$/, // Móviles: 5xxxxxxx, 6xxxxxxx, 7xxxxxxx, 8xxxxxxx, 9xxxxxxx
    /^(\+53|53)?[2-4]\d{6,7}$/, // Fijos: 2xxxxxxx, 3xxxxxxx, 4xxxxxxx (7-8 dígitos)
    /^(\+53|53)?7[0-9]\d{6}$/, // Números especiales que empiezan con 7
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

export function CheckoutModal({ isOpen, onClose, onCheckout, items, total }: CheckoutModalProps) {
  const { getCurrentPrices } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    address: ''
  });
  const [selectedZone, setSelectedZone] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [pickupLocation, setPickupLocation] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [errors, setErrors] = useState<Partial<CustomerInfo & { zone: string }>>({});
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  // Load delivery zones from admin config
  useEffect(() => {
    const loadDeliveryZones = () => {
      try {
        const adminConfig = localStorage.getItem('system_config');
        if (adminConfig) {
          const config = JSON.parse(adminConfig);
          if (config.deliveryZones) {
            setDeliveryZones(config.deliveryZones);
          }
        }
      } catch (error) {
        console.error('Error loading delivery zones:', error);
      }
    };

    loadDeliveryZones();

    // Listen for admin updates
    const handleAdminStateChange = (event: CustomEvent) => {
      if (event.detail.type === 'delivery_zone_add' || 
          event.detail.type === 'delivery_zone_update' || 
          event.detail.type === 'delivery_zone_delete') {
        loadDeliveryZones();
      }
    };

    const handleAdminFullSync = (event: CustomEvent) => {
      if (event.detail.config?.deliveryZones) {
        setDeliveryZones(event.detail.config.deliveryZones);
      }
    };

    window.addEventListener('admin_state_change', handleAdminStateChange as EventListener);
    window.addEventListener('admin_full_sync', handleAdminFullSync as EventListener);

    return () => {
      window.removeEventListener('admin_state_change', handleAdminStateChange as EventListener);
      window.removeEventListener('admin_full_sync', handleAdminFullSync as EventListener);
    };
  }, []);

  // Agregar opción de recogida en el local
  const pickupOption = {
    id: 'pickup',
    name: 'Recogida en TV a la Carta',
    cost: 0
  };

  const allDeliveryOptions = [pickupOption, ...deliveryZones];

  useEffect(() => {
    if (selectedZone === 'pickup') {
      setDeliveryCost(0);
      setPickupLocation(true);
    } else if (selectedZone) {
      const zone = deliveryZones.find(z => z.name === selectedZone);
      setDeliveryCost(zone ? zone.cost : 0);
      setPickupLocation(false);
    }
  }, [selectedZone, deliveryZones]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo & { zone: string }> = {};

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!validateCubanPhone(customerInfo.phone)) {
      newErrors.phone = 'Número de teléfono cubano inválido (ej: +53 5469 0878, 54690878, 22345678)';
    }

    if (!pickupLocation && !customerInfo.address.trim()) {
      newErrors.address = 'La dirección es requerida para entrega a domicilio';
    }

    if (!selectedZone) {
      newErrors.zone = 'Debe seleccionar una opción de entrega';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const orderId = `TV-${Date.now()}`;
    const orderData: OrderData = {
      orderId,
      customerInfo,
      deliveryZone: selectedZone,
      deliveryCost,
      items,
      subtotal: total,
      transferFee: 0,
      total: total + deliveryCost,
      pickupLocation,
      showLocationMap
    };

    onCheckout(orderData);
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleZoneChange = (value: string) => {
    setSelectedZone(value);
    if (errors.zone) {
      setErrors(prev => ({ ...prev, zone: undefined }));
    }
  };

  const openLocationMap = () => {
    const mapUrl = 'https://www.google.com/maps/place/20%C2%B002\'22.5%22N+75%C2%B050\'58.8%22W/@20.0394604,-75.8495414,180m/data=!3m1!1e3!4m4!3m3!8m2!3d20.039585!4d-75.849663?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D';
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl my-4 sm:my-6 lg:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 sm:p-3 rounded-xl mr-2 sm:mr-4">
                <Send className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">Finalizar Pedido</h2>
                <p className="text-xs sm:text-sm lg:text-base text-blue-100">Completa tus datos para proceder</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 text-blue-600" />
                Información Personal
              </h3>

              <div className="space-y-4 lg:space-y-5">
                <div>
                  <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 lg:py-4 text-base lg:text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa tu nombre completo"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm lg:text-base mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 lg:py-4 text-base lg:text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+53 5469 0878 o 54690878"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm lg:text-base mt-1">{errors.phone}</p>
                  )}
                  <p className="text-gray-500 text-xs lg:text-sm mt-1">
                    Formatos válidos: +53 5469 0878, 54690878, 22345678
                  </p>
                </div>

                <div>
                  <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
                    Dirección Completa {!pickupLocation && '*'}
                  </label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 lg:py-4 text-base lg:text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={pickupLocation ? "Dirección opcional para contacto" : "Calle, número, entre calles, referencias..."}
                    disabled={pickupLocation}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm lg:text-base mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 text-green-600" />
                Opciones de Entrega *
              </h3>
              
              {errors.zone && (
                <p className="text-red-500 text-sm mb-4">{errors.zone}</p>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                {/* Pickup Option */}
                <label
                  className={`group flex flex-col p-4 sm:p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] space-y-3 ${
                    selectedZone === 'pickup'
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg scale-[1.02]'
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center w-full">
                    <div className={`mr-4 p-3 rounded-full transition-all duration-300 ${
                      selectedZone === 'pickup'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
                    }`}>
                      <Home className="h-5 w-5" />
                    </div>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="pickup"
                      checked={selectedZone === 'pickup'}
                      onChange={(e) => handleZoneChange(e.target.value)}
                      className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5 text-green-600 focus:ring-green-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <p className={`font-bold text-lg transition-colors ${
                        selectedZone === 'pickup' ? 'text-green-800' : 'text-gray-900 group-hover:text-green-700'
                      }`}>
                        🏪 Recogida en TV a la Carta
                      </p>
                      <p className={`text-sm transition-colors ${
                        selectedZone === 'pickup' ? 'text-green-700' : 'text-gray-600 group-hover:text-green-600'
                      }`}>
                        📍 Reparto Nuevo Vista Alegre, Santiago de Cuba
                      </p>
                      <p className={`text-xs mt-1 transition-colors ${
                        selectedZone === 'pickup' ? 'text-green-600' : 'text-gray-500 group-hover:text-green-500'
                      }`}>
                        ⏰ Disponible de 9:00 AM a 8:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="text-center flex flex-col items-center w-full">
                    <div className={`px-4 py-2 rounded-full font-bold text-lg transition-all duration-300 ${
                      selectedZone === 'pickup'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-green-100 text-green-700 group-hover:bg-green-200'
                    }`}>
                      ✨ GRATIS
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Sin costo adicional</p>
                  </div>
                </label>

                {/* Home Delivery Option */}
                {deliveryZones.length > 0 && (
                  <div className="border-2 border-gray-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 border-b border-gray-300">
                      <h4 className="font-bold text-blue-900 flex items-center text-base sm:text-lg">
                        <div className="bg-blue-500 p-2 rounded-lg mr-3 shadow-sm">
                          <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        Entrega a Domicilio
                      </h4>
                      <p className="text-sm text-blue-700 ml-10 sm:ml-12 mt-1">Selecciona tu zona de entrega</p>
                    </div>
                    <div className="max-h-64 sm:max-h-80 overflow-y-auto bg-white">
                      {deliveryZones.map((zone) => (
                        <label
                          key={zone.id}
                          className={`group flex flex-col p-3 sm:p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 space-y-3 ${
                            selectedZone === zone.name
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-inner'
                              : ''
                          }`}
                        >
                          <div className="flex items-center w-full">
                            <div className={`mr-4 p-2 rounded-full transition-all duration-300 ${
                              selectedZone === zone.name
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <input
                              type="radio"
                              name="deliveryOption"
                              value={zone.name}
                              checked={selectedZone === zone.name}
                              onChange={(e) => handleZoneChange(e.target.value)}
                              className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            />
                            <div className="flex-1">
                              <p className={`font-bold text-base transition-colors ${
                                selectedZone === zone.name ? 'text-blue-800' : 'text-gray-900 group-hover:text-blue-700'
                              }`}>
                                🚚 {zone.name}
                              </p>
                              <p className={`text-sm mt-1 transition-colors ${
                                selectedZone === zone.name ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
                              }`}>
                                ⏰ Entrega en 24-48 horas
                              </p>
                            </div>
                          </div>
                          <div className="text-center flex flex-col items-center w-full">
                            <div className={`px-4 py-2 rounded-full font-bold text-base transition-all duration-300 ${
                              selectedZone === zone.name
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
                            }`}>
                              ${zone.cost.toLocaleString()} CUP
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Costo de entrega</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Map Option */}
              {pickupLocation && (
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <h4 className="font-bold text-blue-900 text-base flex items-center justify-center sm:justify-start">
                        <div className="bg-blue-500 p-2 rounded-lg mr-3 shadow-sm">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        📍 Ubicación del Local
                      </h4>
                      <p className="text-sm text-blue-700 text-center sm:text-left sm:ml-11 mt-2">Ver ubicación exacta en Google Maps (opcional)</p>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <label className="flex items-center justify-center w-full">
                        <input
                          type="checkbox"
                          checked={showLocationMap}
                          onChange={(e) => setShowLocationMap(e.target.checked)}
                          className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-blue-700">📍 Incluir ubicación en el pedido</span>
                      </label>
                      <button
                        type="button"
                        onClick={openLocationMap}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        🗺️ Ver Mapa
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deliveryZones.length === 0 && (
                <div className="text-center py-6 sm:py-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
                  <div className="bg-yellow-100 p-4 rounded-full w-fit mx-auto mb-6">
                    <Truck className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-yellow-800 mb-3">
                    Solo disponible recogida en el local
                  </h3>
                  <p className="text-sm sm:text-base text-yellow-700 max-w-md mx-auto px-4">
                    Contacta con el administrador para configurar zonas de entrega adicionales.
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-blue-200 shadow-xl">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 sm:p-3 rounded-xl mr-2 sm:mr-3 shadow-lg">
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                Resumen del Pedido
              </h3>
              
              {/* Items breakdown */}
              <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 lg:mb-4 flex items-center text-sm sm:text-base lg:text-lg">
                  <span className="text-base sm:text-lg lg:text-xl mr-2">📦</span>
                  Elementos del Pedido ({items.length})
                </h4>
                <div className="space-y-3 lg:space-y-4 max-h-40 sm:max-h-48 md:max-h-56 lg:max-h-80 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex flex-col py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 mb-2">{item.title}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                          <span className={`px-2 py-1 rounded-full ${
                            item.type === 'movie' ? 'bg-blue-100 text-blue-700' :
                            item.type === 'tv' ? 'bg-purple-100 text-purple-700' :
                            'bg-pink-100 text-pink-700'
                          }`}>
                            {item.type === 'movie' ? '🎬 Película' : 
                             item.type === 'tv' ? '📺 Serie' : 
                             '📚 Novela'}
                          </span>
                          {item.selectedSeasons && item.selectedSeasons.length > 0 && (
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              {item.selectedSeasons.length} temp.
                            </span>
                          )}
                          {item.chapters && (
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              {item.chapters} cap.
                            </span>
                          )}
                          {item.type === 'tv' && item.episodeCount && item.episodeCount > 50 && (
                            <span className="bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">
                              📊 Serie Extensa
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full font-medium text-xs ${
                            item.paymentType === 'cash' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.paymentType === 'cash' ? '💵 Efectivo' : '💳 Transferencia'}
                          </span>
                        </div>
                      </div>
                      <div className="text-center w-full border-t border-gray-200 pt-2 sm:pt-3">
                        <p className={`font-bold text-base sm:text-lg ${
                          item.paymentType === 'cash' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          ${item.price.toLocaleString()} CUP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment method breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {/* Cash payments */}
                {items.filter(item => item.paymentType === 'cash').length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-sm">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <h5 className="font-bold text-green-800 text-sm sm:text-base">Pago en Efectivo</h5>
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-green-700 mb-1">
                        {items.filter(item => item.paymentType === 'cash').length} elementos
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-green-800">
                        ${items.filter(item => item.paymentType === 'cash')
                          .reduce((sum, item) => sum + item.price, 0).toLocaleString()} CUP
                      </p>
                    </div>
                  </div>
                )}

                {/* Transfer payments */}
                {items.filter(item => item.paymentType === 'transfer').length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 sm:p-4 border-2 border-orange-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-orange-500 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 shadow-sm">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <h5 className="font-bold text-orange-800 text-sm sm:text-base">Transferencia Bancaria</h5>
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-orange-700 mb-1">
                        {items.filter(item => item.paymentType === 'transfer').length} elementos (+10%)
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-orange-800">
                        ${items.filter(item => item.paymentType === 'transfer')
                          .reduce((sum, item) => sum + item.price, 0).toLocaleString()} CUP
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Totals breakdown */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col justify-between items-center py-3 sm:py-4 px-3 sm:px-4 bg-white rounded-lg border border-gray-200 space-y-2">
                  <span className="text-gray-700 font-medium flex items-center text-center text-sm sm:text-base">
                    <span className="mr-2">🛒</span>
                    Subtotal ({items.length} elementos)
                  </span>
                  <span className="font-bold text-gray-900 text-lg sm:text-xl">${total.toLocaleString()} CUP</span>
                </div>

                {selectedZone && (
                  <div className="flex flex-col justify-between items-center py-3 sm:py-4 px-3 sm:px-4 bg-white rounded-lg border border-gray-200 space-y-2">
                    <span className="text-gray-700 font-medium flex items-center text-center text-sm sm:text-base">
                      <span className="mr-2">{pickupLocation ? '🏪' : '🚚'}</span>
                      {pickupLocation ? 'Recogida en local' : `Entrega a ${selectedZone}`}
                    </span>
                    <span className={`font-bold text-lg sm:text-xl ${deliveryCost === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                      {deliveryCost === 0 ? '✨ GRATIS' : `$${deliveryCost.toLocaleString()} CUP`}
                    </span>
                  </div>
                )}

                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 sm:p-6 border-2 border-green-300 shadow-lg">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-base sm:text-xl font-bold text-gray-900 flex items-center">
                      <span className="mr-2">💰</span>
                      TOTAL A PAGAR
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-green-600">
                      ${(total + deliveryCost).toLocaleString()} CUP
                    </span>
                  </div>
                  {deliveryCost > 0 && (
                    <div className="mt-3 text-xs sm:text-sm text-gray-600 text-center">
                      Incluye ${deliveryCost.toLocaleString()} CUP de entrega
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700 text-white px-6 py-5 lg:py-6 rounded-2xl font-bold text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center touch-manipulation"
            >
              <div className="bg-white/20 p-2 lg:p-3 rounded-lg mr-3">
                <Send className="h-6 w-6 lg:h-7 lg:w-7" />
              </div>
              📱 Enviar Pedido por WhatsApp
            </button>
            
            <div className="text-center mt-3 sm:mt-4 p-3 sm:p-4 lg:p-5 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs sm:text-sm lg:text-base text-green-700 font-medium flex items-center justify-center flex-wrap">
                <span className="mr-2">ℹ️</span>
                <span className="text-center">Al enviar el pedido serás redirigido a WhatsApp para completar la transacción</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}