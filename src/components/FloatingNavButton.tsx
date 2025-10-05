import React, { useState } from 'react';
import { Menu, X, TrendingUp, Film, Monitor, Sparkles, Radio, CheckCircle2, ArrowUp } from 'lucide-react';

interface FloatingNavButtonProps {
  onNavigate: (section: string) => void;
}

export function FloatingNavButton({ onNavigate }: FloatingNavButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: 'hero', label: 'Inicio', icon: ArrowUp, color: 'from-gray-500 to-gray-600' },
    { id: 'trending', label: 'Tendencias', icon: TrendingUp, color: 'from-red-500 to-pink-500' },
    { id: 'novelas-transmision', label: 'Novelas en Vivo', icon: Radio, color: 'from-red-500 to-pink-500' },
    { id: 'novelas-finalizadas', label: 'Novelas Completas', icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { id: 'peliculas', label: 'Películas', icon: Film, color: 'from-blue-500 to-blue-600' },
    { id: 'series', label: 'Series', icon: Monitor, color: 'from-purple-500 to-purple-600' },
    { id: 'anime', label: 'Anime', icon: Sparkles, color: 'from-pink-500 to-pink-600' },
  ];

  const handleSectionClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="p-2 max-h-[70vh] overflow-y-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors rounded-xl text-left group"
                  >
                    <div className={`bg-gradient-to-r ${section.color} p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 whitespace-nowrap">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            isOpen ? 'rotate-90' : ''
          }`}
          aria-label="Menú de navegación"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
    </>
  );
}
