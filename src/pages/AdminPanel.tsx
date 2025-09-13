import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Settings, DollarSign, MapPin, BookOpen, Bell, Download, Upload, FolderSync as Sync, BarChart3, Users, Package, TrendingUp, AlertCircle, CheckCircle, Clock, Trash2, Plus, Edit, Save, X, Home, ArrowLeft, LogOut, Lock, User } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import type { PriceConfig, DeliveryZone, Novel } from '../context/AdminContext';

export function AdminPanel() {
  const {
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
    clearNotifications,
    exportSystemConfig,
    exportCompleteSourceCode,
    syncWithRemote,
    syncAllSections
  } = useAdmin();

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active section state
  const [activeSection, setActiveSection] = useState<'dashboard' | 'prices' | 'delivery' | 'novels' | 'notifications' | 'system'>('dashboard');

  // Form states
  const [priceForm, setPriceForm] = useState<PriceConfig>(state.prices);
  const [deliveryForm, setDeliveryForm] = useState({ name: '', cost: 0 });
  const [novelForm, setNovelForm] = useState({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
  const [editingDeliveryZone, setEditingDeliveryZone] = useState<DeliveryZone | null>(null);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);

  // UI states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Update price form when state changes
  useEffect(() => {
    setPriceForm(state.prices);
  }, [state.prices]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const success = login(loginForm.username, loginForm.password);
      if (!success) {
        setLoginError('Credenciales incorrectas. Acceso denegado.');
      }
    } catch (error) {
      setLoginError('Error de autenticación. Intente nuevamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    setActiveSection('dashboard');
  };

  // Handle price update
  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrices(priceForm);
  };

  // Handle delivery zone operations
  const handleAddDeliveryZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryForm.name.trim() && deliveryForm.cost >= 0) {
      addDeliveryZone(deliveryForm);
      setDeliveryForm({ name: '', cost: 0 });
    }
  };

  const handleUpdateDeliveryZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeliveryZone) {
      updateDeliveryZone(editingDeliveryZone);
      setEditingDeliveryZone(null);
    }
  };

  // Handle novel operations
  const handleAddNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (novelForm.titulo.trim() && novelForm.genero.trim() && novelForm.capitulos > 0) {
      addNovel(novelForm);
      setNovelForm({ titulo: '', genero: '', capitulos: 0, año: new Date().getFullYear(), descripcion: '' });
    }
  };

  const handleUpdateNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNovel) {
      updateNovel(editingNovel);
      setEditingNovel(null);
    }
  };

  // Handle sync operations
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithRemote();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllSections();
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle export operations
  const handleExportConfig = async () => {
    setIsExporting(true);
    try {
      await exportSystemConfig();
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSourceCode = async () => {
    setIsExporting(true);
    try {
      await exportCompleteSourceCode();
    } finally {
      setIsExporting(false);
    }
  };

  // Login screen
  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Navigation back to home */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/"
            className="flex items-center text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Link>
        </div>

        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-white/70">Acceso restringido - Solo personal autorizado</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Usuario
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Ingrese su usuario"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent pr-12"
                  placeholder="Ingrese su contraseña"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <span className="text-red-200 text-sm">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Acceder al Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-white/60 text-xs mb-2">Sistema de Gestión TV a la Carta</p>
              <div className="flex items-center justify-center text-white/40 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Versión {state.systemConfig.version}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-500">TV a la Carta - Sistema de Gestión</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation buttons */}
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-blue-50 px-4 py-2 rounded-lg"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ir al Inicio</span>
              </Link>
              
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">En línea</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'prices', label: 'Gestión de Precios', icon: DollarSign },
                  { id: 'delivery', label: 'Zonas de Entrega', icon: MapPin },
                  { id: 'novels', label: 'Gestión de Novelas', icon: BookOpen },
                  { id: 'notifications', label: 'Notificaciones', icon: Bell },
                  { id: 'system', label: 'Sistema', icon: Settings }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Rápidas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Zonas de Entrega</span>
                  <span className="font-semibold text-blue-600">{state.deliveryZones.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Novelas Administradas</span>
                  <span className="font-semibold text-purple-600">{state.novels.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Notificaciones</span>
                  <span className="font-semibold text-green-600">{state.notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cambios Pendientes</span>
                  <span className="font-semibold text-orange-600">{state.syncStatus.pendingChanges}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
                    Dashboard Principal
                  </h2>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Precio Películas</p>
                          <p className="text-2xl font-bold">${state.prices.moviePrice}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Precio Series</p>
                          <p className="text-2xl font-bold">${state.prices.seriesPrice}</p>
                        </div>
                        <Package className="h-8 w-8 text-purple-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Zonas Entrega</p>
                          <p className="text-2xl font-bold">{state.deliveryZones.length}</p>
                        </div>
                        <MapPin className="h-8 w-8 text-green-200" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Recargo Transfer.</p>
                          <p className="text-2xl font-bold">{state.prices.transferFeePercentage}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-200" />
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Sistema en línea</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Sincronización activa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Base de datos conectada</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prices Section */}
            {activeSection === 'prices' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <DollarSign className="h-6 w-6 mr-3 text-green-600" />
                  Gestión de Precios
                </h2>
                
                <form onSubmit={handlePriceUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Películas (CUP)
                      </label>
                      <input
                        type="number"
                        value={priceForm.moviePrice}
                        onChange={(e) => setPriceForm({ ...priceForm, moviePrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Series por Temporada (CUP)
                      </label>
                      <input
                        type="number"
                        value={priceForm.seriesPrice}
                        onChange={(e) => setPriceForm({ ...priceForm, seriesPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recargo por Transferencia (%)
                      </label>
                      <input
                        type="number"
                        value={priceForm.transferFeePercentage}
                        onChange={(e) => setPriceForm({ ...priceForm, transferFeePercentage: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Novelas por Capítulo (CUP)
                      </label>
                      <input
                        type="number"
                        value={priceForm.novelPricePerChapter}
                        onChange={(e) => setPriceForm({ ...priceForm, novelPricePerChapter: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Actualizar Precios
                  </button>
                </form>
              </div>
            )}

            {/* Delivery Zones Section */}
            {activeSection === 'delivery' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-blue-600" />
                    Zonas de Entrega
                  </h2>
                  
                  {/* Add new zone form */}
                  <form onSubmit={editingDeliveryZone ? handleUpdateDeliveryZone : handleAddDeliveryZone} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Zona
                        </label>
                        <input
                          type="text"
                          value={editingDeliveryZone ? editingDeliveryZone.name : deliveryForm.name}
                          onChange={(e) => {
                            if (editingDeliveryZone) {
                              setEditingDeliveryZone({ ...editingDeliveryZone, name: e.target.value });
                            } else {
                              setDeliveryForm({ ...deliveryForm, name: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ej: Santiago de Cuba > Santiago de Cuba > Vista Alegre"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Costo (CUP)
                        </label>
                        <input
                          type="number"
                          value={editingDeliveryZone ? editingDeliveryZone.cost : deliveryForm.cost}
                          onChange={(e) => {
                            const cost = parseInt(e.target.value) || 0;
                            if (editingDeliveryZone) {
                              setEditingDeliveryZone({ ...editingDeliveryZone, cost });
                            } else {
                              setDeliveryForm({ ...deliveryForm, cost });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center"
                      >
                        {editingDeliveryZone ? (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Actualizar Zona
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5 mr-2" />
                            Agregar Zona
                          </>
                        )}
                      </button>
                      
                      {editingDeliveryZone && (
                        <button
                          type="button"
                          onClick={() => setEditingDeliveryZone(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center"
                        >
                          <X className="h-5 w-5 mr-2" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                  
                  {/* Zones list */}
                  <div className="space-y-3">
                    {state.deliveryZones.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{zone.name}</h3>
                          <p className="text-sm text-gray-600">${zone.cost.toLocaleString()} CUP</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingDeliveryZone(zone)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteDeliveryZone(zone.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Novels Section */}
            {activeSection === 'novels' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-purple-600" />
                    Gestión de Novelas
                  </h2>
                  
                  {/* Add new novel form */}
                  <form onSubmit={editingNovel ? handleUpdateNovel : handleAddNovel} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={editingNovel ? editingNovel.titulo : novelForm.titulo}
                          onChange={(e) => {
                            if (editingNovel) {
                              setEditingNovel({ ...editingNovel, titulo: e.target.value });
                            } else {
                              setNovelForm({ ...novelForm, titulo: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Género
                        </label>
                        <input
                          type="text"
                          value={editingNovel ? editingNovel.genero : novelForm.genero}
                          onChange={(e) => {
                            if (editingNovel) {
                              setEditingNovel({ ...editingNovel, genero: e.target.value });
                            } else {
                              setNovelForm({ ...novelForm, genero: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capítulos
                        </label>
                        <input
                          type="number"
                          value={editingNovel ? editingNovel.capitulos : novelForm.capitulos}
                          onChange={(e) => {
                            const capitulos = parseInt(e.target.value) || 0;
                            if (editingNovel) {
                              setEditingNovel({ ...editingNovel, capitulos });
                            } else {
                              setNovelForm({ ...novelForm, capitulos });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Año
                        </label>
                        <input
                          type="number"
                          value={editingNovel ? editingNovel.año : novelForm.año}
                          onChange={(e) => {
                            const año = parseInt(e.target.value) || new Date().getFullYear();
                            if (editingNovel) {
                              setEditingNovel({ ...editingNovel, año });
                            } else {
                              setNovelForm({ ...novelForm, año });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="1900"
                          max={new Date().getFullYear() + 5}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (Opcional)
                      </label>
                      <textarea
                        value={editingNovel ? editingNovel.descripcion || '' : novelForm.descripcion}
                        onChange={(e) => {
                          if (editingNovel) {
                            setEditingNovel({ ...editingNovel, descripcion: e.target.value });
                          } else {
                            setNovelForm({ ...novelForm, descripcion: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="Descripción opcional de la novela..."
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center"
                      >
                        {editingNovel ? (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Actualizar Novela
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5 mr-2" />
                            Agregar Novela
                          </>
                        )}
                      </button>
                      
                      {editingNovel && (
                        <button
                          type="button"
                          onClick={() => setEditingNovel(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center"
                        >
                          <X className="h-5 w-5 mr-2" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                  
                  {/* Novels list */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {state.novels.map((novel) => (
                      <div key={novel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{novel.titulo}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{novel.genero}</span>
                            <span>{novel.capitulos} capítulos</span>
                            <span>{novel.año}</span>
                            <span>${(novel.capitulos * state.prices.novelPricePerChapter).toLocaleString()} CUP</span>
                          </div>
                          {novel.descripcion && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{novel.descripcion}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setEditingNovel(novel)}
                            className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteNovel(novel.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Bell className="h-6 w-6 mr-3 text-yellow-600" />
                    Notificaciones del Sistema
                  </h2>
                  <button
                    onClick={clearNotifications}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Todo
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {state.notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay notificaciones</p>
                    </div>
                  ) : (
                    state.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          notification.type === 'success' ? 'bg-green-50 border-green-500' :
                          notification.type === 'error' ? 'bg-red-50 border-red-500' :
                          notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{notification.section}</span>
                              <span>{notification.action}</span>
                              <span>{new Date(notification.timestamp).toLocaleString('es-ES')}</span>
                            </div>
                          </div>
                          <div className={`p-2 rounded-full ${
                            notification.type === 'success' ? 'text-green-600' :
                            notification.type === 'error' ? 'text-red-600' :
                            notification.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                             notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> :
                             notification.type === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                             <Bell className="h-5 w-5" />}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* System Section */}
            {activeSection === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Settings className="h-6 w-6 mr-3 text-gray-600" />
                    Configuración del Sistema
                  </h2>
                  
                  {/* System Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white p-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                    >
                      {isSyncing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Sync className="h-6 w-6 mr-3" />
                          Sincronizar Sistema
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleFullSync}
                      disabled={isSyncing}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 text-white p-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                    >
                      {isSyncing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Sync className="h-6 w-6 mr-3" />
                          Sincronización Completa
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleExportConfig}
                      disabled={isExporting}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white p-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="h-6 w-6 mr-3" />
                          Exportar Configuración
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleExportSourceCode}
                      disabled={isExporting}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white p-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="h-6 w-6 mr-3" />
                          Exportar Código Fuente
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* System Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Versión del Sistema</p>
                        <p className="font-semibold text-gray-900">{state.systemConfig.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Última Sincronización</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(state.syncStatus.lastSync).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estado de Conexión</p>
                        <p className={`font-semibold ${state.syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                          {state.syncStatus.isOnline ? 'En línea' : 'Desconectado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cambios Pendientes</p>
                        <p className="font-semibold text-orange-600">{state.syncStatus.pendingChanges}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}