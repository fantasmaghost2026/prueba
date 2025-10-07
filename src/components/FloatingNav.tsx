import React, { useState } from 'react';
import { Menu, X, Flame, Clapperboard, Monitor, Sparkles, Radio, CheckCircle2 } from 'lucide-react';

interface FloatingNavProps {
  sections: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

export function FloatingNav({ sections }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Navigation Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 w-64">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
              <h3 className="text-white font-bold text-lg">Navegar a</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0"
                >
                  <div className="mr-3 text-blue-500">
                    {section.icon}
                  </div>
                  <span className="text-gray-800 font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
