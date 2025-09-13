import { BASE_URL, API_OPTIONS } from '../config/api';
import { apiService } from './api';
import { contentFilterService } from './contentFilter';
import type { Movie, TVShow, MovieDetails, TVShowDetails, Video, APIResponse, Genre, Cast, CastMember } from '../types/movie';

class TMDBService {
  private readonly FRESH_CONTENT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for fresh content
  private readonly DETAILS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for details

  private async fetchData<T>(endpoint: string, useCache: boolean = true): Promise<T> {
    // For fresh content, use shorter cache duration
    if (endpoint.includes('/popular') || endpoint.includes('/trending') || endpoint.includes('/now_playing')) {
      return this.fetchWithFreshCache<T>(endpoint, useCache);
    }
    return apiService.fetchWithCache<T>(endpoint, useCache);
  }

  private async fetchWithFreshCache<T>(endpoint: string, useCache: boolean = true): Promise<T> {
    // Use a separate cache with shorter duration for fresh content
    const cacheKey = `fresh_${endpoint}`;
    
    if (useCache) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > this.FRESH_CONTENT_CACHE_DURATION;
          
          if (!isExpired) {
            return data;
          }
        } catch (error) {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, API_OPTIONS);
      
      if (!response.ok) {
        if (response.status === 404 && endpoint.includes('/videos')) {
          console.warn(`Videos not found for endpoint: ${endpoint}`);
          return { results: [] } as T;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (useCache) {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }
      
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      
      if (endpoint.includes('/videos')) {
        return { results: [] } as T;
      }
      
      // Try to return cached data even if expired
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          console.warn(`Using expired cache for ${endpoint}`);
          return data;
        } catch (parseError) {
          localStorage.removeItem(cacheKey);
        }
      }
      
      throw error;
    }
  }

  // Enhanced video fetching with better filtering
  private async getVideosWithFallback(endpoint: string): Promise<{ results: Video[] }> {
    try {
      // Try Spanish first with error handling
      try {
        const spanishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=es-ES`);
        
        if (spanishVideos.results && spanishVideos.results.length > 0) {
          // If Spanish videos exist but no trailers, try to combine with English
          const spanishTrailers = spanishVideos.results.filter(
            video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
          );
          
          if (spanishTrailers.length === 0) {
            try {
              const englishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=en-US`);
              const englishTrailers = englishVideos.results.filter(
                video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
              );
              
              return {
                results: [...spanishVideos.results, ...englishTrailers]
              };
            } catch (englishError) {
              // If English also fails, return Spanish videos
              return spanishVideos;
            }
          }
          
          return spanishVideos;
        }
      } catch (spanishError) {
        // If Spanish fails, try English
        console.warn('Spanish videos not available, trying English');
      }
      
      // Try English as fallback
      try {
        const englishVideos = await this.fetchData<{ results: Video[] }>(`${endpoint}?language=en-US`);
        return englishVideos;
      } catch (englishError) {
        console.warn('English videos not available either');
        // Return empty results instead of throwing
        return { results: [] };
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { results: [] };
    }
  }

  // Movies
  async getPopularMovies(page: number = 1): Promise<APIResponse<Movie>> {
    // Get both Spanish and English results for better coverage
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/movie/popular?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/movie/popular?language=en-US&page=${page}&region=US`, page === 1)
    ]);
    
    // Combine results and remove duplicates, prioritizing Spanish
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(movie => 
        !spanishResults.results.some(spanishMovie => spanishMovie.id === movie.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async getTopRatedMovies(page: number = 1): Promise<APIResponse<Movie>> {
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/movie/top_rated?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/movie/top_rated?language=en-US&page=${page}&region=US`, page === 1)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(movie => 
        !spanishResults.results.some(spanishMovie => spanishMovie.id === movie.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async getUpcomingMovies(page: number = 1): Promise<APIResponse<Movie>> {
    // Get upcoming movies from multiple regions for better coverage
    const [spanishResults, englishResults, nowPlayingResults] = await Promise.all([
      this.fetchData(`/movie/upcoming?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/movie/upcoming?language=en-US&page=${page}&region=US`, page === 1),
      this.fetchData(`/movie/now_playing?language=es-ES&page=${page}&region=ES`, page === 1)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(movie => 
        !spanishResults.results.some(spanishMovie => spanishMovie.id === movie.id)
      ),
      ...nowPlayingResults.results.filter(movie => 
        !spanishResults.results.some(spanishMovie => spanishMovie.id === movie.id) &&
        !englishResults.results.some(englishMovie => englishMovie.id === movie.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  // Add method to get now playing movies
  async getNowPlayingMovies(page: number = 1): Promise<APIResponse<Movie>> {
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/movie/now_playing?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/movie/now_playing?language=en-US&page=${page}&region=US`, page === 1)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(movie => 
        !spanishResults.results.some(spanishMovie => spanishMovie.id === movie.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async searchMovies(query: string, page: number = 1): Promise<APIResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    // Search in both Spanish and English for better coverage
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/search/movie?query=${encodedQuery}&language=es-ES&page=${page}&include_adult=false`),
      this.fetchData(`/search/movie?query=${encodedQuery}&language=en-US&page=${page}&include_adult=false`)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(movie => 
        !spanishResults.results.some(spanishMovie => spanishMovie.id === movie.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async getMovieDetails(id: number): Promise<MovieDetails | null> {
    // Try Spanish first, fallback to English if needed
    try {
      const spanishDetails = await this.fetchData<MovieDetails | null>(`/movie/${id}?language=es-ES&append_to_response=credits,videos,images`, true);
      if (spanishDetails) {
        return spanishDetails;
      }
    } catch (error) {
      console.warn(`Spanish details not available for movie ${id}, trying English`);
    }
    
    const englishDetails = await this.fetchData<MovieDetails | null>(`/movie/${id}?language=en-US&append_to_response=credits,videos,images`, true);
    if (englishDetails) {
      return englishDetails;
    }
    
    return null;
  }

  async getMovieVideos(id: number): Promise<{ results: Video[] }> {
    return this.getVideosWithFallback(`/movie/${id}/videos`);
  }

  async getMovieCredits(id: number): Promise<Cast> {
    const credits = await this.fetchData<Cast | null>(`/movie/${id}/credits?language=es-ES`, true);
    return credits || { cast: [], crew: [] };
  }

  // TV Shows
  async getPopularTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    // Get TV shows from multiple regions and sources
    const [spanishResults, englishResults, airingTodayResults] = await Promise.all([
      this.fetchData(`/tv/popular?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/tv/popular?language=en-US&page=${page}&region=US`, page === 1),
      this.fetchData(`/tv/airing_today?language=es-ES&page=${page}&region=ES`, page === 1)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(show => 
        !spanishResults.results.some(spanishShow => spanishShow.id === show.id)
      ),
      ...airingTodayResults.results.filter(show => 
        !spanishResults.results.some(spanishShow => spanishShow.id === show.id) &&
        !englishResults.results.some(englishShow => englishShow.id === show.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async getTopRatedTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/tv/top_rated?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/tv/top_rated?language=en-US&page=${page}&region=US`, page === 1)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(show => 
        !spanishResults.results.some(spanishShow => spanishShow.id === show.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  // Add method to get airing today TV shows
  async getAiringTodayTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/tv/airing_today?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/tv/airing_today?language=en-US&page=${page}&region=US`, page === 1)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(show => 
        !spanishResults.results.some(spanishShow => spanishShow.id === show.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  // Add method to get on the air TV shows
  async getOnTheAirTVShows(page: number = 1): Promise<APIResponse<TVShow>> {
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/tv/on_the_air?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/tv/on_the_air?language=en-US&page=${page}&region=US`, page === 1)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(show => 
        !spanishResults.results.some(spanishShow => spanishShow.id === show.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async searchTVShows(query: string, page: number = 1): Promise<APIResponse<TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    // Search in both Spanish and English for better coverage
    const [spanishResults, englishResults] = await Promise.all([
      this.fetchData(`/search/tv?query=${encodedQuery}&language=es-ES&page=${page}&include_adult=false`),
      this.fetchData(`/search/tv?query=${encodedQuery}&language=en-US&page=${page}&include_adult=false`)
    ]);
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(show => 
        !spanishResults.results.some(spanishShow => spanishShow.id === show.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async getTVShowDetails(id: number): Promise<TVShowDetails | null> {
    // Try Spanish first, fallback to English if needed
    try {
      const spanishDetails = await this.fetchData<TVShowDetails | null>(`/tv/${id}?language=es-ES&append_to_response=credits,videos,images`, true);
      if (spanishDetails) {
        return spanishDetails;
      }
    } catch (error) {
      console.warn(`Spanish details not available for TV show ${id}, trying English`);
    }
    
    const englishDetails = await this.fetchData<TVShowDetails | null>(`/tv/${id}?language=en-US&append_to_response=credits,videos,images`, true);
    if (englishDetails) {
      return englishDetails;
    }
    
    return null;
  }

  async getTVShowVideos(id: number): Promise<{ results: Video[] }> {
    return this.getVideosWithFallback(`/tv/${id}/videos`);
  }

  async getTVShowCredits(id: number): Promise<Cast> {
    const credits = await this.fetchData<Cast | null>(`/tv/${id}/credits?language=es-ES`, true);
    return credits || { cast: [], crew: [] };
  }

  // Anime (using discover with Japanese origin)
  async getPopularAnime(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchData(`/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`, page === 1);
  }

  async getTopRatedAnime(page: number = 1): Promise<APIResponse<TVShow>> {
    return this.fetchData(`/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=vote_average.desc&vote_count.gte=100&include_adult=false`, page === 1);
  }

  async searchAnime(query: string, page: number = 1): Promise<APIResponse<TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData(`/search/tv?query=${encodedQuery}&language=es-ES&page=${page}&with_genres=16&with_origin_country=JP`);
  }

  // Enhanced anime discovery with multiple sources
  async getAnimeFromMultipleSources(page: number = 1): Promise<APIResponse<TVShow>> {
    try {
      const [japaneseAnime, animationGenre, koreanAnimation] = await Promise.all([
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_origin_country=JP&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`, page === 1),
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`, page === 1),
        this.fetchData<APIResponse<TVShow>>(`/discover/tv?with_origin_country=KR&with_genres=16&language=es-ES&page=${page}&sort_by=popularity.desc&include_adult=false`, page === 1)
      ]);

      // Combine and remove duplicates
      const combinedResults = [
        ...japaneseAnime.results,
        ...animationGenre.results.filter(item => 
          !japaneseAnime.results.some(jp => jp.id === item.id)
        ),
        ...koreanAnimation.results.filter(item => 
          !japaneseAnime.results.some(jp => jp.id === item.id) &&
          !animationGenre.results.some(an => an.id === item.id)
        )
      ];

      return {
        ...japaneseAnime,
        results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
      };
    } catch (error) {
      console.error('Error fetching anime from multiple sources:', error);
      return this.getPopularAnime(page);
    }
  }

  // Genres
  async getMovieGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchData('/genre/movie/list?language=es-ES', true);
  }

  async getTVGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchData('/genre/tv/list?language=es-ES', true);
  }

  // Multi search
  async searchMulti(query: string, page: number = 1): Promise<APIResponse<Movie | TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    // Enhanced multi-search with better coverage
    const [spanishResults, englishResults, personResults] = await Promise.all([
      this.fetchData(`/search/multi?query=${encodedQuery}&language=es-ES&page=${page}&include_adult=false`),
      this.fetchData(`/search/multi?query=${encodedQuery}&language=en-US&page=${page}&include_adult=false`),
      this.fetchData(`/search/person?query=${encodedQuery}&language=es-ES&page=${page}&include_adult=false`)
    ]);
    
    // If searching for a person, get their known_for content
    let personContent: (Movie | TVShow)[] = [];
    if (personResults.results.length > 0) {
      personContent = personResults.results.flatMap(person => 
        person.known_for || []
      );
    }
    
    const combinedResults = [
      ...spanishResults.results,
      ...englishResults.results.filter(item => 
        !spanishResults.results.some(spanishItem => spanishItem.id === item.id)
      ),
      ...personContent.filter(item => 
        !spanishResults.results.some(spanishItem => spanishItem.id === item.id) &&
        !englishResults.results.some(englishItem => englishItem.id === item.id)
      )
    ];
    
    return {
      ...spanishResults,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  // Trending content - synchronized with TMDB
  async getTrendingAll(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<Movie | TVShow>> {
    // Get trending from multiple regions for comprehensive coverage
    const [globalTrending, spanishTrending, usTrending] = await Promise.all([
      this.fetchData(`/trending/all/${timeWindow}?page=${page}`, page === 1),
      this.fetchData(`/trending/all/${timeWindow}?language=es-ES&page=${page}&region=ES`, page === 1),
      this.fetchData(`/trending/all/${timeWindow}?language=en-US&page=${page}&region=US`, page === 1)
    ]);
    
    const combinedResults = [
      ...globalTrending.results,
      ...spanishTrending.results.filter(item => 
        !globalTrending.results.some(globalItem => globalItem.id === item.id)
      ),
      ...usTrending.results.filter(item => 
        !globalTrending.results.some(globalItem => globalItem.id === item.id) &&
        !spanishTrending.results.some(spanishItem => spanishItem.id === item.id)
      )
    ];
    
    return {
      ...globalTrending,
      results: contentFilterService.filterContent(this.removeDuplicates(combinedResults))
    };
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<Movie>> {
    const response = await this.fetchData<APIResponse<Movie>>(`/trending/movie/${timeWindow}?language=es-ES&page=${page}`, page === 1);
    return {
      ...response,
      results: contentFilterService.filterContent(response.results)
    };
  }

  async getTrendingTV(timeWindow: 'day' | 'week' = 'day', page: number = 1): Promise<APIResponse<TVShow>> {
    const response = await this.fetchData<APIResponse<TVShow>>(`/trending/tv/${timeWindow}?language=es-ES&page=${page}`, page === 1);
    return {
      ...response,
      results: contentFilterService.filterContent(response.results)
    };
  }

  // Enhanced content discovery methods
  async getDiscoverMovies(params: {
    genre?: number;
    year?: number;
    sortBy?: string;
    page?: number;
  } = {}): Promise<APIResponse<Movie>> {
    const { genre, year, sortBy = 'popularity.desc', page = 1 } = params;
    let endpoint = `/discover/movie?language=es-ES&page=${page}&sort_by=${sortBy}&include_adult=false`;
    
    if (genre) endpoint += `&with_genres=${genre}`;
    if (year) endpoint += `&year=${year}`;
    
    const response = await this.fetchData<APIResponse<Movie>>(endpoint);
    return {
      ...response,
      results: contentFilterService.filterContent(response.results)
    };
  }

  async getDiscoverTVShows(params: {
    genre?: number;
    year?: number;
    sortBy?: string;
    page?: number;
    country?: string;
  } = {}): Promise<APIResponse<TVShow>> {
    const { genre, year, sortBy = 'popularity.desc', page = 1, country } = params;
    let endpoint = `/discover/tv?language=es-ES&page=${page}&sort_by=${sortBy}&include_adult=false`;
    
    if (genre) endpoint += `&with_genres=${genre}`;
    if (year) endpoint += `&first_air_date_year=${year}`;
    if (country) endpoint += `&with_origin_country=${country}`;
    
    const response = await this.fetchData<APIResponse<TVShow>>(endpoint);
    return {
      ...response,
      results: contentFilterService.filterContent(response.results)
    };
  }

  // Utility method to remove duplicates from combined results
  removeDuplicates<T extends { id: number }>(items: T[]): T[] {
    const seen = new Set<number>();
    return items.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  // Get fresh trending content for hero carousel (no duplicates)
  async getHeroContent(): Promise<(Movie | TVShow)[]> {
    try {
      // Get the most current and diverse content for hero
      const [trendingDay, trendingWeek, popularMovies, popularTV, nowPlayingMovies, airingTodayTV] = await Promise.all([
        this.getTrendingAll('day', 1),
        this.getTrendingAll('week', 1),
        this.getPopularMovies(1),
        this.getPopularTVShows(1),
        this.getNowPlayingMovies(1),
        this.getAiringTodayTVShows(1)
      ]);

      // Combine and prioritize trending content
      const combinedItems = [
        ...trendingDay.results.slice(0, 6),
        ...trendingWeek.results.slice(0, 4),
        ...nowPlayingMovies.results.slice(0, 3),
        ...airingTodayTV.results.slice(0, 3),
        ...popularMovies.results.slice(0, 2),
        ...popularTV.results.slice(0, 2)
      ];

      // Remove duplicates and return top items
      return contentFilterService.filterContent(this.removeDuplicates(combinedItems)).slice(0, 12);
    } catch (error) {
      console.error('Error fetching hero content:', error);
      return [];
    }
  }

  // Enhanced search for people and their content
  async searchPeople(query: string, page: number = 1): Promise<any> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchData(`/search/person?query=${encodedQuery}&language=es-ES&page=${page}&include_adult=false`);
  }

  // Get person details and their filmography
  async getPersonDetails(id: number): Promise<any> {
    try {
      const [personDetails, movieCredits, tvCredits] = await Promise.all([
        this.fetchData(`/person/${id}?language=es-ES`),
        this.fetchData(`/person/${id}/movie_credits?language=es-ES`),
        this.fetchData(`/person/${id}/tv_credits?language=es-ES`)
      ]);
      
      return {
        ...personDetails,
        movie_credits: movieCredits,
        tv_credits: tvCredits
      };
    } catch (error) {
      console.error(`Error fetching person details for ${id}:`, error);
      throw error;
    }
  }

  // Force refresh all cached content
  async forceRefreshAllContent(): Promise<void> {
    // Clear all caches
    this.clearCache();
    
    // Clear fresh content cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('fresh_') || key.includes('trending') || key.includes('popular')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All content caches cleared, fresh data will be fetched');
  }

  // Batch fetch videos for multiple items
  async batchFetchVideos(items: { id: number; type: 'movie' | 'tv' }[]): Promise<Map<string, Video[]>> {
    const videoMap = new Map<string, Video[]>();
    
    try {
      const videoPromises = items.map(async (item) => {
        const key = `${item.type}-${item.id}`;
        try {
          const videos = item.type === 'movie' 
            ? await this.getMovieVideos(item.id)
            : await this.getTVShowVideos(item.id);
          
          const trailers = videos.results.filter(
            video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
          );
          
          return { key, videos: trailers };
        } catch (error) {
          console.warn(`No videos available for ${key}`);
          return { key, videos: [] };
        }
      });

      const results = await Promise.allSettled(videoPromises);
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { key, videos } = result.value;
          videoMap.set(key, videos);
        }
      });
    } catch (error) {
      console.error('Error in batch fetch videos:', error);
    }
    
    return videoMap;
  }

  // Clear API cache
  clearCache(): void {
    apiService.clearCache();
  }

  // Get cache statistics
  getCacheStats(): { size: number; items: { key: string; age: number }[] } {
    return {
      size: apiService.getCacheSize(),
      items: apiService.getCacheInfo()
    };
  }

  // Enhanced sync method for better content freshness
  async syncAllContent(): Promise<{
    movies: Movie[];
    tvShows: TVShow[];
    anime: TVShow[];
    trending: (Movie | TVShow)[];
  }> {
    try {
      const [
        popularMovies,
        topRatedMovies,
        upcomingMovies,
        popularTV,
        topRatedTV,
        popularAnime,
        topRatedAnime,
        trendingDay,
        trendingWeek
      ] = await Promise.all([
        this.getPopularMovies(1),
        this.getTopRatedMovies(1),
        this.getUpcomingMovies(1),
        this.getPopularTVShows(1),
        this.getTopRatedTVShows(1),
        this.getAnimeFromMultipleSources(1),
        this.getTopRatedAnime(1),
        this.getTrendingAll('day', 1),
        this.getTrendingAll('week', 1)
      ]);

      // Combine and deduplicate content
      const movies = this.removeDuplicates([
        ...popularMovies.results,
        ...topRatedMovies.results,
        ...upcomingMovies.results
      ]);

      const tvShows = this.removeDuplicates([
        ...popularTV.results,
        ...topRatedTV.results
      ]);

      const anime = this.removeDuplicates([
        ...popularAnime.results,
        ...topRatedAnime.results
      ]);

      const trending = this.removeDuplicates([
        ...trendingDay.results,
        ...trendingWeek.results
      ]);

      return { movies, tvShows, anime, trending };
    } catch (error) {
      console.error('Error syncing all content:', error);
      return { movies: [], tvShows: [], anime: [], trending: [] };
    }
  }
}

export const tmdbService = new TMDBService();