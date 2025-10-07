import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, DollarSign, MapPin, BookOpen, Bell, Download, Upload, Trash2, CreditCard as Edit, Plus, Save, X, Eye, EyeOff, LogOut, Home, Monitor, Smartphone, Globe, Calendar, Image, Camera, Check, AlertCircle, Info, RefreshCw, Database, FolderSync as Sync, Activity, TrendingUp, Users, ShoppingCart, Clock, Zap, Heart, Star, PackageOpen } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { generateCompleteSourceCode } from '../utils/sourceCodeGenerator';

interface NovelForm {
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion: string;
  pais: string;
  imagen: string;
  estado: 'transmision' | 'finalizada';
}

interface DeliveryZoneForm {
  name: string;
  cost: number;
}

export function AdminPanel() {
  const { 
    state, 
    login, 
    logout, 
    addNovel, 
    updateNovel, 
    deleteNovel,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    updatePrices,
    addNotification,
    markNotificationRead,
    clearNotifications,
    updateSystemConfig,
    exportSystemConfig,
    importSystemConfig,
    getAvailableCountries
  } = useAdmin();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState<'novels' | 'zones' | 'prices' | 'notifications' | 'system'>('novels');
  const [novelForm, setNovelForm] = useState<NovelForm>({
    titulo: '',
    genero: '',
    capitulos: 0,
    año: new Date().getFullYear(),
    descripcion: '',
    pais: '',
    imagen: '',
    estado: 'transmision'
  });
  const [zoneForm, setZoneForm] = useState<DeliveryZoneForm>({ name: '', cost: 0 });
  const [editingNovel, setEditingNovel] = useState<number | null>(null);
  const [editingZone, setEditingZone] = useState<number | null>(null);
  const [showNovelForm, setShowNovelForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [importData, setImportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Géneros disponibles para novelas
  const availableGenres = [
    'Drama',
    'Romance',
    'Acción',
    'Comedia',
    'Familia',
    'Thriller',
    'Misterio',
    'Histórico',
    'Fantasía',
    'Ciencia Ficción'
  ];

  // Países disponibles (ahora incluye Cuba)
  const availableCountries = getAvailableCountries();

  // Real-time sync effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isAuthenticated) {
        // Refresh data when tab becomes visible
        const event = new CustomEvent('admin_refresh_request', {
          detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginForm.username, loginForm.password);
    if (!success) {
      addNotification({
        type: 'error',
        title: 'Error de autenticación',
        message: 'Credenciales incorrectas',
        section: 'Autenticación',
        action: 'login_error'
      });
    }
  };

  const handleNovelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novelForm.titulo.trim() || !novelForm.genero || !novelForm.pais || novelForm.capitulos <= 0) {
      addNotification({
        type: 'error',
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos requeridos',
        section: 'Gestión de Novelas',
        action: 'validation_error'
      });
      return;
    }

    if (editingNovel) {
      const existingNovel = state.novels.find(n => n.id === editingNovel);
      if (existingNovel) {
        updateNovel({
          ...existingNovel,
          ...novelForm,
          updatedAt: new Date().toISOString()
        });
      }
      setEditingNovel(null);
    } else {
      addNovel(novelForm);
    }
    
    resetNovelForm();
    setShowNovelForm(false);
  };

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zoneForm.name.trim() || zoneForm.cost < 0) {
      addNotification({
        type: 'error',
        title: 'Campos incorrectos',
        message: 'Por favor completa todos los campos correctamente',
        section: 'Zonas de Entrega',
        action: 'validation_error'
      });
      return;
    }

    if (editingZone) {
      const existingZone = state.deliveryZones.find(z => z.id === editingZone);
      if (existingZone) {
        updateDeliveryZone({
          ...existingZone,
          ...zoneForm,
          updatedAt: new Date().toISOString()
        });
      }
      setEditingZone(null);
    } else {
      addDeliveryZone(zoneForm);
    }
    
    resetZoneForm();
    setShowZoneForm(false);
  };

  const resetNovelForm = () => {
    setNovelForm({
      titulo: '',
      genero: '',
      capitulos: 0,
      año: new Date().getFullYear(),
      descripcion: '',
      pais: '',
      imagen: '',
      estado: 'transmision'
    });
  };

  const resetZoneForm = () => {
    setZoneForm({ name: '', cost: 0 });
  };

  const startEditingNovel = (novel: any) => {
    setNovelForm({
      titulo: novel.titulo,
      genero: novel.genero,
      capitulos: novel.capitulos,
      año: novel.año,
      descripcion: novel.descripcion || '',
      pais: novel.pais || '',
      imagen: novel.imagen || '',
      estado: novel.estado || 'transmision'
    });
    setEditingNovel(novel.id);
    setShowNovelForm(true);
  };

  const startEditingZone = (zone: any) => {
    setZoneForm({
      name: zone.name,
      cost: zone.cost
    });
    setEditingZone(zone.id);
    setShowZoneForm(true);
  };

  const handlePricesUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      type: 'success',
      title: 'Precios actualizados',
      message: 'Precios actualizados correctamente',
      section: 'Configuración de Precios',
      action: 'update'
    });
  };

  const handleExport = () => {
    const configJson = exportSystemConfig();
    if (!configJson) return;
    
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tv-a-la-carta-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importData.trim()) {
      addNotification({
        type: 'error',
        title: 'Datos faltantes',
        message: 'Por favor pega la configuración a importar',
        section: 'Sistema',
        action: 'import_validation_error'
      });
      return;
    }

    const success = importSystemConfig(importData);
    if (success) {
      setImportData('');
      setShowImportModal(false);
    }
  };

  const handleFullBackupExport = async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Backup en progreso',
        message: 'Generando backup completo del sistema...',
        section: 'Sistema',
        action: 'backup_start'
      });

      const fullSystemConfig = {
        version: state.systemConfig.version,
        prices: state.prices,
        deliveryZones: state.deliveryZones,
        novels: state.novels,
        settings: state.systemConfig,
        syncStatus: state.syncStatus,
        exportDate: new Date().toISOString(),
      };

      await generateCompleteSourceCode(fullSystemConfig);
      addNotification({
        type: 'success',
        title: 'Backup completado',
        message: 'Backup completo generado exitosamente',
        section: 'Sistema',
        action: 'backup_success'
      });
    } catch (error) {
      console.error('Error al generar backup completo:', error);
      addNotification({
        type: 'error',
        title: 'Error en backup',
        message: 'Error al generar el backup completo',
        section: 'Sistema',
        action: 'backup_error'
      });
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Cuba': '🇨🇺',
      'Turquía': '🇹🇷',
      'México': '🇲🇽',
      'Brasil': '🇧🇷',
      'Colombia': '🇨🇴',
      'Argentina': '🇦🇷',
      'España': '🇪🇸',
      'Estados Unidos': '🇺🇸',
      'Corea del Sur': '🇰🇷',
      'India': '🇮🇳',
      'Reino Unido': '🇬🇧',
      'Francia': '🇫🇷',
      'Italia': '🇮🇹',
      'Alemania': '🇩🇪',
      'Japón': '🇯🇵',
      'China': '🇨🇳',
      'Rusia': '🇷🇺'
    };
    return flags[country] || '🌍';
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-fit mx-auto mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
            <p className="text-gray-600">TV a la Carta</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <Settings className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-blue-100">TV a la Carta - Sistema de Gestión</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm opacity-90">Versión {state.systemConfig.version}</p>
              <p className="text-xs opacity-75">
                Última sincronización: {new Date(state.syncStatus.lastSync).toLocaleTimeString()}
              </p>
            </div>
            <Link
              to="/"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al sitio
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Novelas Totales</p>
                <p className="text-2xl font-bold text-blue-800">{state.novels.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Zonas de Entrega</p>
                <p className="text-2xl font-bold text-green-800">{state.deliveryZones.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Notificaciones</p>
                <p className="text-2xl font-bold text-purple-800">
                  {state.notifications.filter(n => !n.read).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Estado del Sistema</p>
                <p className="text-sm font-bold text-orange-800">
                  {state.syncStatus.isOnline ? '🟢 En Línea' : '🔴 Desconectado'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'novels', label: 'Gestión de Novelas', icon: BookOpen },
              { id: 'zones', label: 'Zonas de Entrega', icon: MapPin },
              { id: 'prices', label: 'Configuración de Precios', icon: DollarSign },
              { id: 'notifications', label: 'Notificaciones', icon: Bell },
              { id: 'system', label: 'Sistema', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Novels Management */}
        {activeTab === 'novels' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-purple-600" />
                  Gestión de Novelas
                </h2>
                <button
                  onClick={() => {
                    resetNovelForm();
                    setEditingNovel(null);
                    setShowNovelForm(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Novela
                </button>
              </div>

              {/* Novel Form */}
              {showNovelForm && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingNovel ? 'Editar Novela' : 'Agregar Nueva Novela'}
                  </h3>
                  
                  <form onSubmit={handleNovelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título *
                      </label>
                      <input
                        type="text"
                        value={novelForm.titulo}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, titulo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Género *
                      </label>
                      <select
                        value={novelForm.genero}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, genero: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Seleccionar género</option>
                        {availableGenres.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capítulos *
                      </label>
                      <input
                        type="number"
                        value={novelForm.capitulos}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, capitulos: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Año *
                      </label>
                      <input
                        type="number"
                        value={novelForm.año}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País *
                      </label>
                      <select
                        value={novelForm.pais}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, pais: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Seleccionar país</option>
                        {availableCountries.map(country => (
                          <option key={country} value={country}>
                            {getCountryFlag(country)} {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <select
                        value={novelForm.estado}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, estado: e.target.value as 'transmision' | 'finalizada' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="transmision">📡 En Transmisión</option>
                        <option value="finalizada">✅ Finalizada</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL de Imagen
                      </label>
                      <input
                        type="url"
                        value={novelForm.imagen}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, imagen: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={novelForm.descripcion}
                        onChange={(e) => setNovelForm(prev => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                        placeholder="Descripción de la novela..."
                      />
                    </div>
                    
                    <div className="md:col-span-2 flex space-x-4">
                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingNovel ? 'Actualizar' : 'Agregar'} Novela
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNovelForm(false);
                          setEditingNovel(null);
                          resetNovelForm();
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Novels List */}
              <div className="space-y-4">
                {state.novels.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay novelas</h3>
                    <p className="text-gray-600">Agrega la primera novela al catálogo</p>
                  </div>
                ) : (
                  state.novels.map((novel) => (
                    <div key={novel.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-bold text-gray-900 mr-3">{novel.titulo}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              novel.estado === 'transmision' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {novel.estado === 'transmision' ? '📡 En Transmisión' : '✅ Finalizada'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Género:</span> {novel.genero}
                            </div>
                            <div>
                              <span className="font-medium">Capítulos:</span> {novel.capitulos}
                            </div>
                            <div>
                              <span className="font-medium">Año:</span> {novel.año}
                            </div>
                            <div>
                              <span className="font-medium">País:</span> {getCountryFlag(novel.pais || 'No especificado')} {novel.pais || 'No especificado'}
                            </div>
                          </div>
                          {novel.descripcion && (
                            <p className="text-gray-600 mt-2 text-sm">{novel.descripcion}</p>
                          )}
                          <div className="mt-3 text-sm">
                            <span className="font-medium text-green-600">
                              Precio: ${(novel.capitulos * state.prices.novelPricePerChapter).toLocaleString()} CUP
                            </span>
                            <span className="text-gray-500 ml-2">
                              (${state.prices.novelPricePerChapter} CUP × {novel.capitulos} cap.)
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => startEditingNovel(novel)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar "${novel.titulo}"?`)) {
                                deleteNovel(novel.id);
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Zones Management */}
        {activeTab === 'zones' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-green-600" />
                  Zonas de Entrega
                </h2>
                <button
                  onClick={() => {
                    resetZoneForm();
                    setEditingZone(null);
                    setShowZoneForm(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Zona
                </button>
              </div>

              {/* Zone Form */}
              {showZoneForm && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingZone ? 'Editar Zona' : 'Agregar Nueva Zona'}
                  </h3>
                  
                  <form onSubmit={handleZoneSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Zona *
                      </label>
                      <input
                        type="text"
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Centro de la Ciudad"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo de Entrega (CUP) *
                      </label>
                      <input
                        type="number"
                        value={zoneForm.cost}
                        onChange={(e) => setZoneForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2 flex space-x-4">
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingZone ? 'Actualizar' : 'Agregar'} Zona
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowZoneForm(false);
                          setEditingZone(null);
                          resetZoneForm();
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Zones List */}
              <div className="space-y-4">
                {state.deliveryZones.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay zonas de entrega</h3>
                    <p className="text-gray-600">Agrega la primera zona de entrega</p>
                  </div>
                ) : (
                  state.deliveryZones.map((zone) => (
                    <div key={zone.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{zone.name}</h3>
                          <p className="text-green-600 font-semibold">
                            Costo: ${zone.cost.toLocaleString()} CUP
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingZone(zone)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar la zona "${zone.name}"?`)) {
                                deleteDeliveryZone(zone.id);
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prices Configuration */}
        {activeTab === 'prices' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-600" />
              Configuración de Precios
            </h2>
            
            <form onSubmit={handlePricesUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Películas (CUP)
                </label>
                <input
                  type="number"
                  value={state.prices.moviePrice}
                  onChange={(e) => updatePrices({ ...state.prices, moviePrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Series por Temporada (CUP)
                </label>
                <input
                  type="number"
                  value={state.prices.seriesPrice}
                  onChange={(e) => updatePrices({ ...state.prices, seriesPrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Novelas por Capítulo (CUP)
                </label>
                <input
                  type="number"
                  value={state.prices.novelPricePerChapter}
                  onChange={(e) => updatePrices({ ...state.prices, novelPricePerChapter: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recargo por Transferencia (%)
                </label>
                <input
                  type="number"
                  value={state.prices.transferFeePercentage}
                  onChange={(e) => updatePrices({ ...state.prices, transferFeePercentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  max="100"
                />
              </div>
            </form>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Bell className="h-6 w-6 mr-2 text-yellow-600" />
                Notificaciones ({state.notifications.filter(n => !n.read).length} sin leer)
              </h2>
              <button
                onClick={clearNotifications}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Todo
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {state.notifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
                  <p className="text-gray-600">Las notificaciones del sistema aparecerán aquí</p>
                </div>
              ) : (
                state.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      notification.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-500'
                    } ${
                      notification.type === 'success' ? 'border-green-500 bg-green-50' :
                      notification.type === 'error' ? 'border-red-500 bg-red-50' :
                      notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{notification.message}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 ml-4"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* System Configuration */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-blue-600" />
                Configuración del Sistema
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Información del Sistema</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Versión:</span>
                        <span>{state.systemConfig.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Estado:</span>
                        <span className={state.syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                          {state.syncStatus.isOnline ? '🟢 En Línea' : '🔴 Desconectado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Última Sincronización:</span>
                        <span>{new Date(state.syncStatus.lastSync).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Cambios Pendientes:</span>
                        <span className={state.syncStatus.pendingChanges > 0 ? 'text-orange-600' : 'text-green-600'}>
                          {state.syncStatus.pendingChanges}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Acciones del Sistema</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleExport}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Configuración
                    </button>

                    <button
                      onClick={() => setShowImportModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Configuración
                    </button>

                    <button
                      onClick={handleFullBackupExport}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-lg"
                    >
                      <PackageOpen className="h-4 w-4 mr-2" />
                      Exportar Backup Full
                    </button>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                      <p className="text-xs text-amber-800">
                        <Info className="h-3 w-3 inline mr-1" />
                        El Backup Full incluye todos los archivos del sistema con la configuración aplicada
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Importar Configuración</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuración JSON
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                    placeholder="Pega aquí la configuración JSON exportada..."
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleImport}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportData('');
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}