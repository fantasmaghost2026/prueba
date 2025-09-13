// Content filtering service to exclude unwanted titles
export class ContentFilterService {
  private static instance: ContentFilterService;
  
  // Lista de títulos y personas a filtrar
  private readonly FILTERED_TITLES = [
    'Gavin Casalegno',
    'Jonah Hauer-King', 
    'Leah McKendrick',
    'Sean Kaufman',
    'Frank Marino',
    'Stephen Stanton'
  ];

  // Palabras clave adicionales para filtrar
  private readonly FILTERED_KEYWORDS = [
    'documentary',
    'documental',
    'reality',
    'news',
    'noticias',
    'talk show'
  ];

  // Géneros a filtrar (IDs de TMDB)
  private readonly FILTERED_GENRE_IDS = [
    99, // Documentary
    10763, // News
    10767 // Talk Show
  ];

  static getInstance(): ContentFilterService {
    if (!ContentFilterService.instance) {
      ContentFilterService.instance = new ContentFilterService();
    }
    return ContentFilterService.instance;
  }

  // Filtrar contenido basado en múltiples criterios
  filterContent<T extends { 
    id: number; 
    title?: string; 
    name?: string; 
    overview?: string;
    genre_ids?: number[];
    original_language?: string;
  }>(items: T[]): T[] {
    return items.filter(item => {
      const title = item.title || item.name || '';
      const overview = item.overview || '';
      
      // Filtrar por títulos específicos
      if (this.isFilteredTitle(title)) {
        return false;
      }
      
      // Filtrar por palabras clave en título o descripción
      if (this.containsFilteredKeywords(title, overview)) {
        return false;
      }
      
      // Filtrar por géneros no deseados
      if (this.hasFilteredGenres(item.genre_ids || [])) {
        return false;
      }
      
      // Filtrar contenido de muy baja calidad (sin descripción y sin géneros)
      if (!overview.trim() && (!item.genre_ids || item.genre_ids.length === 0)) {
        return false;
      }
      
      return true;
    });
  }

  private isFilteredTitle(title: string): boolean {
    const normalizedTitle = title.toLowerCase().trim();
    
    return this.FILTERED_TITLES.some(filteredTitle => {
      const normalizedFiltered = filteredTitle.toLowerCase().trim();
      return normalizedTitle.includes(normalizedFiltered) || 
             normalizedFiltered.includes(normalizedTitle);
    });
  }

  private containsFilteredKeywords(title: string, overview: string): boolean {
    const combinedText = `${title} ${overview}`.toLowerCase();
    
    return this.FILTERED_KEYWORDS.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
  }

  private hasFilteredGenres(genreIds: number[]): boolean {
    return genreIds.some(id => this.FILTERED_GENRE_IDS.includes(id));
  }

  // Método para agregar nuevos filtros dinámicamente
  addFilteredTitle(title: string): void {
    if (!this.FILTERED_TITLES.includes(title)) {
      this.FILTERED_TITLES.push(title);
    }
  }

  // Método para remover filtros
  removeFilteredTitle(title: string): void {
    const index = this.FILTERED_TITLES.indexOf(title);
    if (index > -1) {
      this.FILTERED_TITLES.splice(index, 1);
    }
  }

  // Obtener lista de filtros actuales
  getFilteredTitles(): string[] {
    return [...this.FILTERED_TITLES];
  }
}

export const contentFilterService = ContentFilterService.getInstance();