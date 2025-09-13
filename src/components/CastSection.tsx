import React from 'react';
import { Users, Star } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/api';
import type { CastMember } from '../types/movie';

interface CastSectionProps {
  cast: CastMember[];
  title?: string;
}

export function CastSection({ cast, title = "Reparto Principal" }: CastSectionProps) {
  if (!cast || cast.length === 0) {
    return null;
  }

  // Show only main cast (first 12 members)
  const mainCast = cast.slice(0, 12);

  const getProfileUrl = (profilePath: string | null) => {
    return profilePath
      ? `${IMAGE_BASE_URL}/w185${profilePath}`
      : 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=185&h=278&fit=crop&crop=face';
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl mr-4 shadow-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {mainCast.map((actor) => (
          <div
            key={actor.id}
            className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:scale-105"
          >
            <div className="relative overflow-hidden">
              <img
                src={getProfileUrl(actor.profile_path)}
                alt={actor.name}
                className="w-full h-32 sm:h-40 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {actor.name}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                {actor.character}
              </p>
              {actor.known_for_department && (
                <div className="mt-2">
                  <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                    {actor.known_for_department}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {cast.length > 12 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full border border-indigo-200">
            <Star className="h-4 w-4 text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-indigo-700">
              +{cast.length - 12} actores más en el reparto completo
            </span>
          </div>
        </div>
      )}
    </div>
  );
}