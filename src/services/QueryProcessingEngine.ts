
export interface QueryParams {
  search?: string;
  filters?: { [key: string]: any };
  sort?: SortConfig;
  pagination?: PaginationConfig;
  fields?: string[];
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
  type?: 'string' | 'number' | 'date';
}

export interface PaginationConfig {
  page: number;
  limit: number;
  offset?: number;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startswith' | 'endswith' | 'between';
  value: any;
  dataType: 'string' | 'number' | 'date' | 'boolean';
}

export interface QueryResult {
  data: any[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    executionTime: number;
    cacheHit: boolean;
  };
  filters: FilterConfig[];
  sort: SortConfig | null;
}

export interface SearchConfig {
  fields: string[];
  weights: { [field: string]: number };
  fuzzyThreshold: number;
  boostFactors: { [field: string]: number };
}

export class QueryProcessingEngine {
  private static readonly DEFAULT_PAGINATION = { page: 1, limit: 20 };
  private static readonly MAX_LIMIT = 100;
  
  private static readonly SEARCH_CONFIGS: { [websiteType: string]: SearchConfig } = {
    'ecommerce': {
      fields: ['title', 'description', 'category', 'brand'],
      weights: { title: 3, description: 1, category: 2, brand: 2 },
      fuzzyThreshold: 0.7,
      boostFactors: { price: 1.5, rating: 1.2 }
    },
    'blog': {
      fields: ['title', 'content', 'author', 'tags'],
      weights: { title: 3, content: 1, author: 1.5, tags: 2 },
      fuzzyThreshold: 0.8,
      boostFactors: { date: 1.3, author: 1.1 }
    },
    'news': {
      fields: ['title', 'summary', 'author', 'category'],
      weights: { title: 3, summary: 2, author: 1, category: 1.5 },
      fuzzyThreshold: 0.75,
      boostFactors: { date: 2.0, source: 1.2 }
    },
    'job-board': {
      fields: ['title', 'description', 'company', 'location'],
      weights: { title: 3, description: 1.5, company: 2, location: 2 },
      fuzzyThreshold: 0.8,
      boostFactors: { salary: 1.8, experience: 1.3 }
    }
  };

  static async processQuery(
    data: any[], 
    params: QueryParams, 
    websiteType: string = 'default'
  ): Promise<QueryResult> {
    const startTime = Date.now();
    console.log(`🔍 Processing query with ${Object.keys(params).length} parameters`);
    
    let processedData = [...data];
    const appliedFilters: FilterConfig[] = [];
    
    // Step 1: Apply Search
    if (params.search) {
      processedData = this.applySearch(processedData, params.search, websiteType);
      console.log(`🔎 Search reduced data to ${processedData.length} items`);
    }
    
    // Step 2: Apply Filters
    if (params.filters) {
      const filterResult = this.applyFilters(processedData, params.filters);
      processedData = filterResult.data;
      appliedFilters.push(...filterResult.filters);
      console.log(`🎛️ Filters reduced data to ${processedData.length} items`);
    }
    
    // Step 3: Apply Sorting
    let sortConfig: SortConfig | null = null;
    if (params.sort) {
      processedData = this.applySorting(processedData, params.sort);
      sortConfig = params.sort;
      console.log(`📊 Applied sorting by ${params.sort.field}`);
    }
    
    // Step 4: Field Selection
    if (params.fields && params.fields.length > 0) {
      processedData = this.selectFields(processedData, params.fields);
      console.log(`📋 Selected ${params.fields.length} fields`);
    }
    
    // Step 5: Pagination
    const pagination = params.pagination || this.DEFAULT_PAGINATION;
    const paginationResult = this.applyPagination(processedData, pagination);
    
    const executionTime = Date.now() - startTime;
    
    return {
      data: paginationResult.data,
      metadata: {
        total: processedData.length,
        page: pagination.page,
        limit: pagination.limit,
        hasMore: paginationResult.hasMore,
        executionTime,
        cacheHit: false // Would be set by caching layer
      },
      filters: appliedFilters,
      sort: sortConfig
    };
  }

  private static applySearch(data: any[], searchTerm: string, websiteType: string): any[] {
    const config = this.SEARCH_CONFIGS[websiteType] || this.SEARCH_CONFIGS['blog'];
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    if (!normalizedSearch) return data;
    
    return data
      .map(item => ({
        item,
        score: this.calculateSearchScore(item, normalizedSearch, config)
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }

  private static calculateSearchScore(item: any, searchTerm: string, config: SearchConfig): number {
    let totalScore = 0;
    
    config.fields.forEach(field => {
      const fieldValue = this.getNestedValue(item, field);
      if (!fieldValue) return;
      
      const normalizedValue = String(fieldValue).toLowerCase();
      const weight = config.weights[field] || 1;
      
      // Exact match
      if (normalizedValue.includes(searchTerm)) {
        totalScore += weight * 10;
      }
      
      // Fuzzy match
      const similarity = this.calculateStringSimilarity(normalizedValue, searchTerm);
      if (similarity > config.fuzzyThreshold) {
        totalScore += weight * similarity * 5;
      }
      
      // Word match
      const words = searchTerm.split(' ');
      const matchedWords = words.filter(word => normalizedValue.includes(word));
      if (matchedWords.length > 0) {
        totalScore += weight * (matchedWords.length / words.length) * 3;
      }
    });
    
    // Apply boost factors
    Object.entries(config.boostFactors).forEach(([field, boost]) => {
      if (this.getNestedValue(item, field)) {
        totalScore *= boost;
      }
    });
    
    return totalScore;
  }

  private static applyFilters(data: any[], filters: { [key: string]: any }): {
    data: any[];
    filters: FilterConfig[];
  } {
    const appliedFilters: FilterConfig[] = [];
    let filteredData = data;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      
      const filterConfig = this.parseFilterValue(key, value);
      appliedFilters.push(filterConfig);
      
      filteredData = filteredData.filter(item => 
        this.applyFilter(item, filterConfig)
      );
    });
    
    return { data: filteredData, filters: appliedFilters };
  }

  private static parseFilterValue(field: string, value: any): FilterConfig {
    // Handle range filters (e.g., price_min, price_max)
    if (field.endsWith('_min')) {
      return {
        field: field.replace('_min', ''),
        operator: 'gte',
        value: this.parseNumber(value),
        dataType: 'number'
      };
    }
    
    if (field.endsWith('_max')) {
      return {
        field: field.replace('_max', ''),
        operator: 'lte',
        value: this.parseNumber(value),
        dataType: 'number'
      };
    }
    
    // Handle array filters
    if (Array.isArray(value)) {
      return {
        field,
        operator: 'in',
        value,
        dataType: 'string'
      };
    }
    
    // Handle string contains
    if (typeof value === 'string' && value.includes('*')) {
      return {
        field,
        operator: 'contains',
        value: value.replace(/\*/g, ''),
        dataType: 'string'
      };
    }
    
    // Default equality filter
    return {
      field,
      operator: 'eq',
      value,
      dataType: this.inferDataType(value)
    };
  }

  private static applyFilter(item: any, filter: FilterConfig): boolean {
    const fieldValue = this.getNestedValue(item, filter.field);
    
    if (fieldValue === undefined || fieldValue === null) return false;
    
    const normalizedValue = this.normalizeValue(fieldValue, filter.dataType);
    const filterValue = this.normalizeValue(filter.value, filter.dataType);
    
    switch (filter.operator) {
      case 'eq': return normalizedValue === filterValue;
      case 'ne': return normalizedValue !== filterValue;
      case 'gt': return normalizedValue > filterValue;
      case 'gte': return normalizedValue >= filterValue;
      case 'lt': return normalizedValue < filterValue;
      case 'lte': return normalizedValue <= filterValue;
      case 'in': return Array.isArray(filter.value) && filter.value.includes(normalizedValue);
      case 'nin': return Array.isArray(filter.value) && !filter.value.includes(normalizedValue);
      case 'contains': return String(normalizedValue).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'startswith': return String(normalizedValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'endswith': return String(normalizedValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
      default: return true;
    }
  }

  private static applySorting(data: any[], sort: SortConfig): any[] {
    return [...data].sort((a, b) => {
      const aVal = this.getNestedValue(a, sort.field);
      const bVal = this.getNestedValue(b, sort.field);
      
      const normalizedA = this.normalizeValue(aVal, sort.type || 'string');
      const normalizedB = this.normalizeValue(bVal, sort.type || 'string');
      
      let comparison = 0;
      
      if (normalizedA < normalizedB) comparison = -1;
      else if (normalizedA > normalizedB) comparison = 1;
      
      return sort.order === 'desc' ? -comparison : comparison;
    });
  }

  private static selectFields(data: any[], fields: string[]): any[] {
    return data.map(item => {
      const selected: any = {};
      fields.forEach(field => {
        const value = this.getNestedValue(item, field);
        if (value !== undefined) {
          this.setNestedValue(selected, field, value);
        }
      });
      return selected;
    });
  }

  private static applyPagination(data: any[], pagination: PaginationConfig): {
    data: any[];
    hasMore: boolean;
  } {
    const limit = Math.min(pagination.limit, this.MAX_LIMIT);
    const offset = pagination.offset || ((pagination.page - 1) * limit);
    
    const paginatedData = data.slice(offset, offset + limit);
    const hasMore = offset + limit < data.length;
    
    return { data: paginatedData, hasMore };
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private static normalizeValue(value: any, type: string): any {
    switch (type) {
      case 'number':
        return this.parseNumber(value);
      case 'date':
        return new Date(value).getTime();
      case 'boolean':
        return Boolean(value);
      default:
        return String(value);
    }
  }

  private static parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  private static inferDataType(value: any): 'string' | 'number' | 'date' | 'boolean' {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';
    if (typeof value === 'string' && !isNaN(parseFloat(value))) return 'number';
    return 'string';
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1.0;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLen);
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}
