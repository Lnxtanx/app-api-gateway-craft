
export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hash: string;
  hitCount: number;
  lastAccessed: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  refreshThreshold: number;
  preloadEnabled: boolean;
}

export interface ChangeDetectionResult {
  hasChanged: boolean;
  changeType: 'content' | 'structure' | 'data' | 'none';
  confidence: number;
  changedElements: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface RefreshJob {
  apiId: string;
  url: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledAt: number;
  attempts: number;
  maxAttempts: number;
}

export class RealTimeDataServingEngine {
  private cache = new Map<string, CacheEntry>();
  private refreshQueue: RefreshJob[] = [];
  private isRefreshing = new Set<string>();
  
  private static readonly DEFAULT_CONFIG: CacheConfig = {
    defaultTTL: 300000, // 5 minutes
    maxSize: 1000,
    refreshThreshold: 0.8, // Refresh when 80% of TTL elapsed
    preloadEnabled: true
  };

  private static readonly WEBSITE_CACHE_STRATEGIES = {
    'ecommerce': { ttl: 600000, refreshRate: 'medium' }, // 10 minutes
    'news': { ttl: 180000, refreshRate: 'high' }, // 3 minutes
    'blog': { ttl: 1800000, refreshRate: 'low' }, // 30 minutes
    'job-board': { ttl: 900000, refreshRate: 'medium' }, // 15 minutes
    'real-estate': { ttl: 3600000, refreshRate: 'low' }, // 1 hour
    'social': { ttl: 60000, refreshRate: 'high' }, // 1 minute
    'default': { ttl: 300000, refreshRate: 'medium' }
  };

  static async serveData(apiId: string, query: any, websiteType: string = 'default'): Promise<any> {
    console.log(`🚀 Serving data for API: ${apiId}`);
    
    const engine = new RealTimeDataServingEngine();
    const cacheKey = this.generateCacheKey(apiId, query);
    
    // Check cache first
    const cachedData = engine.getCachedData(cacheKey);
    if (cachedData && !engine.shouldRefresh(cachedData, websiteType)) {
      console.log(`✅ Cache hit for ${apiId}`);
      engine.updateAccessMetrics(cacheKey);
      return cachedData.data;
    }

    // If cache miss or stale, fetch fresh data
    console.log(`🔄 Cache miss/stale for ${apiId}, fetching fresh data`);
    const freshData = await engine.fetchFreshData(apiId, query);
    
    // Cache the fresh data
    engine.cacheData(cacheKey, freshData, websiteType);
    
    // Schedule background refresh if needed
    engine.scheduleBackgroundRefresh(apiId, websiteType);
    
    return freshData;
  }

  static detectChanges(previousData: any, currentData: any): ChangeDetectionResult {
    console.log(`🔍 Detecting changes in data`);
    
    if (!previousData || !currentData) {
      return {
        hasChanged: true,
        changeType: 'content',
        confidence: 1.0,
        changedElements: ['entire-dataset'],
        severity: 'high'
      };
    }

    const previousHash = this.generateDataHash(previousData);
    const currentHash = this.generateDataHash(currentData);
    
    if (previousHash === currentHash) {
      return {
        hasChanged: false,
        changeType: 'none',
        confidence: 1.0,
        changedElements: [],
        severity: 'low'
      };
    }

    // Detailed change analysis
    const changeAnalysis = this.analyzeDataChanges(previousData, currentData);
    
    return {
      hasChanged: true,
      changeType: changeAnalysis.type,
      confidence: changeAnalysis.confidence,
      changedElements: changeAnalysis.elements,
      severity: changeAnalysis.severity
    };
  }

  private static generateCacheKey(apiId: string, query: any): string {
    const queryString = JSON.stringify(query, Object.keys(query).sort());
    return `${apiId}:${this.hashString(queryString)}`;
  }

  private getCachedData(cacheKey: string): CacheEntry | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry;
  }

  private shouldRefresh(entry: CacheEntry, websiteType: string): boolean {
    const strategy = RealTimeDataServingEngine.WEBSITE_CACHE_STRATEGIES[websiteType] || 
                    RealTimeDataServingEngine.WEBSITE_CACHE_STRATEGIES.default;
    
    const age = Date.now() - entry.timestamp;
    const refreshThreshold = strategy.ttl * RealTimeDataServingEngine.DEFAULT_CONFIG.refreshThreshold;
    
    return age > refreshThreshold;
  }

  private async fetchFreshData(apiId: string, query: any): Promise<any> {
    try {
      // This would integrate with your extract-api edge function
      const response = await fetch(`/api/extract/${apiId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch fresh data:', error);
      throw error;
    }
  }

  private cacheData(cacheKey: string, data: any, websiteType: string): void {
    const strategy = RealTimeDataServingEngine.WEBSITE_CACHE_STRATEGIES[websiteType] || 
                    RealTimeDataServingEngine.WEBSITE_CACHE_STRATEGIES.default;
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: strategy.ttl,
      hash: RealTimeDataServingEngine.generateDataHash(data),
      hitCount: 0,
      lastAccessed: Date.now()
    };
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= RealTimeDataServingEngine.DEFAULT_CONFIG.maxSize) {
      this.evictOldestEntry();
    }
    
    this.cache.set(cacheKey, entry);
    console.log(`💾 Cached data for ${cacheKey}`);
  }

  private updateAccessMetrics(cacheKey: string): void {
    const entry = this.cache.get(cacheKey);
    if (entry) {
      entry.hitCount++;
      entry.lastAccessed = Date.now();
    }
  }

  private scheduleBackgroundRefresh(apiId: string, websiteType: string): void {
    const strategy = RealTimeDataServingEngine.WEBSITE_CACHE_STRATEGIES[websiteType] || 
                    RealTimeDataServingEngine.WEBSITE_CACHE_STRATEGIES.default;
    
    if (!RealTimeDataServingEngine.DEFAULT_CONFIG.preloadEnabled) return;
    
    const job: RefreshJob = {
      apiId,
      url: '', // Would be populated from database
      priority: strategy.refreshRate as any,
      scheduledAt: Date.now() + (strategy.ttl * 0.9), // Refresh at 90% of TTL
      attempts: 0,
      maxAttempts: 3
    };
    
    this.refreshQueue.push(job);
    console.log(`⏰ Scheduled background refresh for ${apiId}`);
  }

  private evictOldestEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Evicted cache entry: ${oldestKey}`);
    }
  }

  private static analyzeDataChanges(previous: any, current: any): {
    type: 'content' | 'structure' | 'data';
    confidence: number;
    elements: string[];
    severity: 'low' | 'medium' | 'high';
  } {
    const changedElements: string[] = [];
    let changeCount = 0;
    let totalFields = 0;
    
    // Compare array lengths
    if (Array.isArray(previous) && Array.isArray(current)) {
      totalFields++;
      if (previous.length !== current.length) {
        changeCount++;
        changedElements.push('array-length');
      }
      
      // Sample comparison of first few items
      const sampleSize = Math.min(5, previous.length, current.length);
      for (let i = 0; i < sampleSize; i++) {
        if (JSON.stringify(previous[i]) !== JSON.stringify(current[i])) {
          changeCount++;
          changedElements.push(`item-${i}`);
        }
        totalFields++;
      }
    }
    
    const changeRatio = totalFields > 0 ? changeCount / totalFields : 0;
    
    return {
      type: changeRatio > 0.5 ? 'structure' : 'content',
      confidence: Math.min(0.95, changeRatio + 0.1),
      elements: changedElements,
      severity: changeRatio > 0.7 ? 'high' : changeRatio > 0.3 ? 'medium' : 'low'
    };
  }

  private static generateDataHash(data: any): string {
    return RealTimeDataServingEngine.hashString(JSON.stringify(data));
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
