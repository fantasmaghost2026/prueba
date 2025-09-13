import { tmdbService } from './tmdb';
import { contentFilterService } from '../services/contentFilter';
import type { Movie, TVShow } from '../types/movie';

class ContentSyncService {
  private lastDailyUpdate: Date | null = null;
  private lastWeeklyUpdate: Date | null = null;
  private syncInProgress = false;

  constructor() {
    this.initializeAutoSync();
  }

  private initializeAutoSync() {
    // Check for updates every hour
    setInterval(() => {
      this.checkAndSync();
    }, 60 * 60 * 1000); // 1 hour

    // Initial check
    this.checkAndSync();
  }

  private async checkAndSync() {
    if (this.syncInProgress) return;

    const now = new Date();
    const shouldDailyUpdate = this.shouldPerformDailyUpdate(now);
    const shouldWeeklyUpdate = this.shouldPerformWeeklyUpdate(now);

    if (shouldDailyUpdate || shouldWeeklyUpdate) {
      await this.performSync(shouldWeeklyUpdate);
    }
  }

  private shouldPerformDailyUpdate(now: Date): boolean {
    if (!this.lastDailyUpdate) return true;
    
    const timeDiff = now.getTime() - this.lastDailyUpdate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  }

  private shouldPerformWeeklyUpdate(now: Date): boolean {
    if (!this.lastWeeklyUpdate) return true;
    
    const timeDiff = now.getTime() - this.lastWeeklyUpdate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    return daysDiff >= 7;
  }

  private async performSync(isWeeklyUpdate: boolean = false) {
    try {
      this.syncInProgress = true;
      console.log(`Performing ${isWeeklyUpdate ? 'weekly' : 'daily'} content sync...`);

      // Enhanced sync with comprehensive content fetching
      await Promise.all([
        this.syncTrendingContent('day'),
        this.syncTrendingContent('week'),
        this.syncPopularContent(),
        this.syncCurrentContent(),
        this.syncAnimeContent(),
        this.syncVideosForPopularContent()
      ]);

      const now = new Date();
      this.lastDailyUpdate = now;
      
      if (isWeeklyUpdate) {
        this.lastWeeklyUpdate = now;
      }

      console.log('Content sync completed successfully');
    } catch (error) {
      console.error('Error during content sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncCurrentContent() {
    try {
      // Sync current/now playing content for the most up-to-date titles
      const [nowPlayingMovies, airingTodayTV, onTheAirTV] = await Promise.all([
        tmdbService.getNowPlayingMovies(1),
        tmdbService.getAiringTodayTVShows(1),
        tmdbService.getOnTheAirTVShows(1)
      ]);

      localStorage.setItem('now_playing_movies', JSON.stringify({
        content: nowPlayingMovies.results,
        lastUpdate: new Date().toISOString()
      }));

      localStorage.setItem('airing_today_tv', JSON.stringify({
        content: airingTodayTV.results,
        lastUpdate: new Date().toISOString()
      }));

      localStorage.setItem('on_the_air_tv', JSON.stringify({
        content: onTheAirTV.results,
        lastUpdate: new Date().toISOString()
      }));

      return { nowPlayingMovies: nowPlayingMovies.results, airingTodayTV: airingTodayTV.results, onTheAirTV: onTheAirTV.results };
    } catch (error) {
      console.error('Error syncing current content:', error);
      return { nowPlayingMovies: [], airingTodayTV: [], onTheAirTV: [] };
    }
  }

  private async syncVideosForPopularContent() {
    try {
      // Get comprehensive content to sync videos including current content
      const [moviesRes, tvRes, animeRes, nowPlayingRes, airingTodayRes] = await Promise.all([
        tmdbService.getPopularMovies(1),
        tmdbService.getPopularTVShows(1),
        tmdbService.getAnimeFromMultipleSources(1),
        tmdbService.getNowPlayingMovies(1),
        tmdbService.getAiringTodayTVShows(1)
      ]);

      // Prepare items for batch video fetching
      const items = [
        ...moviesRes.results.slice(0, 8).map(movie => ({ id: movie.id, type: 'movie' as const })),
        ...tvRes.results.slice(0, 8).map(tv => ({ id: tv.id, type: 'tv' as const })),
        ...animeRes.results.slice(0, 6).map(anime => ({ id: anime.id, type: 'tv' as const })),
        ...nowPlayingRes.results.slice(0, 8).map(movie => ({ id: movie.id, type: 'movie' as const })),
        ...airingTodayRes.results.slice(0, 6).map(tv => ({ id: tv.id, type: 'tv' as const }))
      ];

      // Remove duplicates from items list
      const uniqueItems = items.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id && t.type === item.type)
      );

      // Batch fetch videos with error handling
      try {
        const videoMap = await tmdbService.batchFetchVideos(uniqueItems);
        
        // Store video data
        const videoData: { [key: string]: any[] } = {};
        videoMap.forEach((videos, key) => {
          videoData[key] = videos;
        });

        localStorage.setItem('content_videos', JSON.stringify({
          videos: videoData,
          lastUpdate: new Date().toISOString()
        }));

        console.log(`Synced videos for ${uniqueItems.length} unique items`);
      } catch (videoError) {
        console.warn('Some videos could not be synced:', videoError);
        // Continue without failing the entire sync
      }
    } catch (error) {
      console.error('Error syncing videos:', error);
      // Don't throw, just log the error
    }
  }

  private async syncTrendingContent(timeWindow: 'day' | 'week') {
    try {
      const response = await tmdbService.getTrendingAll(timeWindow, 1);
      const filteredContent = contentFilterService.filterContent(response.results);
      const uniqueContent = tmdbService.removeDuplicates(filteredContent);
      
      // Store in localStorage for quick access
      localStorage.setItem(`trending_${timeWindow}`, JSON.stringify({
        content: uniqueContent,
        lastUpdate: new Date().toISOString()
      }));
      
      return uniqueContent;
    } catch (error) {
      console.error(`Error syncing trending ${timeWindow} content:`, error);
      return [];
    }
  }

  private async syncPopularContent() {
    try {
      const [movies, tvShows] = await Promise.all([
        tmdbService.getPopularMovies(1),
        tmdbService.getPopularTVShows(1)
      ]);

      const filteredMovies = contentFilterService.filterContent(movies.results);
      const filteredTVShows = contentFilterService.filterContent(tvShows.results);

      localStorage.setItem('popular_movies', JSON.stringify({
        content: filteredMovies,
        lastUpdate: new Date().toISOString()
      }));

      localStorage.setItem('popular_tv', JSON.stringify({
        content: filteredTVShows,
        lastUpdate: new Date().toISOString()
      }));

      return { movies: filteredMovies, tvShows: filteredTVShows };
    } catch (error) {
      console.error('Error syncing popular content:', error);
      return { movies: [], tvShows: [] };
    }
  }

  private async syncAnimeContent() {
    try {
      const anime = await tmdbService.getAnimeFromMultipleSources(1);
      const filteredAnime = contentFilterService.filterContent(anime.results);
      
      localStorage.setItem('popular_anime', JSON.stringify({
        content: filteredAnime,
        lastUpdate: new Date().toISOString()
      }));

      return filteredAnime;
    } catch (error) {
      console.error('Error syncing anime content:', error);
      return [];
    }
  }

  // Public methods for components to use
  async getTrendingContent(timeWindow: 'day' | 'week'): Promise<(Movie | TVShow)[]> {
    const cached = localStorage.getItem(`trending_${timeWindow}`);
    
    if (cached) {
      try {
        const { content, lastUpdate } = JSON.parse(cached);
        const updateTime = new Date(lastUpdate);
        const now = new Date();
        const hoursDiff = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
        
        // Use cached content if less than 6 hours old
        if (hoursDiff < 6) {
          return content;
        }
      } catch (error) {
        console.error('Error parsing cached content:', error);
      }
    }

    // Fetch fresh content
    return await this.syncTrendingContent(timeWindow);
  }

  async getPopularContent(): Promise<{ movies: Movie[]; tvShows: TVShow[]; anime: TVShow[] }> {
    const [movies, tvShows, anime] = await Promise.all([
      this.getCachedOrFresh('popular_movies', () => tmdbService.getPopularMovies(1)),
      this.getCachedOrFresh('popular_tv', () => tmdbService.getPopularTVShows(1)),
      this.getCachedOrFresh('popular_anime', () => tmdbService.getAnimeFromMultipleSources(1))
    ]);

    return {
      movies: movies.results || movies,
      tvShows: tvShows.results || tvShows,
      anime: anime.results || anime
    };
  }

  // Get cached videos for content
  getCachedVideos(id: number, type: 'movie' | 'tv'): any[] {
    try {
      const cached = localStorage.getItem('content_videos');
      if (cached) {
        const { videos } = JSON.parse(cached);
        const key = `${type}-${id}`;
        return videos[key] || [];
      }
    } catch (error) {
      console.error('Error getting cached videos:', error);
    }
    return [];
  }

  private async getCachedOrFresh(key: string, fetchFn: () => Promise<any>) {
    const cached = localStorage.getItem(key);
    
    if (cached) {
      try {
        const { content, lastUpdate } = JSON.parse(cached);
        const updateTime = new Date(lastUpdate);
        const now = new Date();
        const hoursDiff = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 12) {
          return content;
        }
      } catch (error) {
        console.error(`Error parsing cached ${key}:`, error);
      }
    }

    // Fetch fresh content
    const fresh = await fetchFn();
    localStorage.setItem(key, JSON.stringify({
      content: fresh.results || fresh,
      lastUpdate: new Date().toISOString()
    }));

    return fresh.results || fresh;
  }

  // Force refresh all content
  async forceRefresh(): Promise<void> {
    this.lastDailyUpdate = null;
    this.lastWeeklyUpdate = null;
    
    // Clear all content caches
    await tmdbService.forceRefreshAllContent();
    
    // Clear cached videos
    localStorage.removeItem('content_videos');
    
    // Clear all content caches
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('trending') || key.includes('popular') || key.includes('now_playing') || key.includes('airing')) {
        localStorage.removeItem(key);
      }
    });
    
    await this.performSync(true);
  }

  // Get sync status
  getSyncStatus(): { lastDaily: Date | null; lastWeekly: Date | null; inProgress: boolean } {
    return {
      lastDaily: this.lastDailyUpdate,
      lastWeekly: this.lastWeeklyUpdate,
      inProgress: this.syncInProgress
    };
  }
}

export const contentSyncService = new ContentSyncService();