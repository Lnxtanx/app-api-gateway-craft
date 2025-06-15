
/**
 * Level 3: Traffic Distribution Manager
 * Manages global traffic distribution and failover mechanisms
 */
export class TrafficDistributionManager {
  private serverLocations: Map<string, any> = new Map();
  private proxyProviders: Map<string, any> = new Map();
  private trafficPatterns: Map<string, any> = new Map();
  private failoverHistory: any[] = [];

  constructor() {
    this.initializeServerLocations();
    this.initializeProxyProviders();
    this.initializeTrafficPatterns();
  }

  private initializeServerLocations(): void {
    const locations = [
      {
        region: 'us-east-1',
        country: 'United States',
        city: 'Virginia',
        timezone: 'America/New_York',
        load: 0,
        maxLoad: 100,
        latency: 15,
        status: 'active'
      },
      {
        region: 'us-west-2',
        country: 'United States', 
        city: 'Oregon',
        timezone: 'America/Los_Angeles',
        load: 0,
        maxLoad: 100,
        latency: 12,
        status: 'active'
      },
      {
        region: 'eu-west-1',
        country: 'Ireland',
        city: 'Dublin',
        timezone: 'Europe/Dublin',
        load: 0,
        maxLoad: 100,
        latency: 8,
        status: 'active'
      },
      {
        region: 'eu-central-1',
        country: 'Germany',
        city: 'Frankfurt',
        timezone: 'Europe/Berlin',
        load: 0,
        maxLoad: 100,
        latency: 10,
        status: 'active'
      },
      {
        region: 'ap-southeast-1',
        country: 'Singapore',
        city: 'Singapore',
        timezone: 'Asia/Singapore',
        load: 0,
        maxLoad: 100,
        latency: 20,
        status: 'active'
      },
      {
        region: 'ap-northeast-1',
        country: 'Japan',
        city: 'Tokyo',
        timezone: 'Asia/Tokyo',
        load: 0,
        maxLoad: 100,
        latency: 25,
        status: 'active'
      }
    ];

    locations.forEach(location => {
      this.serverLocations.set(location.region, location);
    });
  }

  private initializeProxyProviders(): void {
    const providers = [
      {
        name: 'residential_pool_1',
        type: 'residential',
        locations: ['US', 'GB', 'DE', 'FR', 'CA'],
        reliability: 0.95,
        speed: 'medium',
        cost: 'high',
        maxConcurrent: 50,
        currentLoad: 0,
        status: 'active'
      },
      {
        name: 'datacenter_pool_1',
        type: 'datacenter',
        locations: ['US', 'GB', 'DE', 'SG', 'JP'],
        reliability: 0.90,
        speed: 'fast',
        cost: 'medium',
        maxConcurrent: 200,
        currentLoad: 0,
        status: 'active'
      },
      {
        name: 'mobile_pool_1',
        type: 'mobile',
        locations: ['US', 'GB', 'FR'],
        reliability: 0.85,
        speed: 'slow',
        cost: 'very_high',
        maxConcurrent: 20,
        currentLoad: 0,
        status: 'active'
      },
      {
        name: 'rotating_pool_1',
        type: 'rotating',
        locations: ['Global'],
        reliability: 0.88,
        speed: 'medium',
        cost: 'medium',
        maxConcurrent: 100,
        currentLoad: 0,
        status: 'active'
      }
    ];

    providers.forEach(provider => {
      this.proxyProviders.set(provider.name, provider);
    });
  }

  private initializeTrafficPatterns(): void {
    // Common traffic patterns by region and time
    const patterns = [
      {
        region: 'US',
        timezone: 'America/New_York',
        peakHours: [9, 10, 11, 14, 15, 16, 20, 21],
        lowHours: [1, 2, 3, 4, 5, 6],
        weekendMultiplier: 0.7,
        workdayMultiplier: 1.2
      },
      {
        region: 'EU',
        timezone: 'Europe/London',
        peakHours: [8, 9, 10, 13, 14, 15, 19, 20],
        lowHours: [0, 1, 2, 3, 4, 5],
        weekendMultiplier: 0.6,
        workdayMultiplier: 1.3
      },
      {
        region: 'APAC',
        timezone: 'Asia/Tokyo',
        peakHours: [9, 10, 11, 12, 13, 14, 19, 20, 21],
        lowHours: [2, 3, 4, 5, 6],
        weekendMultiplier: 0.8,
        workdayMultiplier: 1.1
      }
    ];

    patterns.forEach(pattern => {
      this.trafficPatterns.set(pattern.region, pattern);
    });
  }

  selectOptimalServer(targetUrl: string): any {
    const urlDomain = new URL(targetUrl).hostname;
    console.log(`🌐 Selecting optimal server for: ${urlDomain}`);

    // Determine target region based on domain
    const targetRegion = this.determineTargetRegion(urlDomain);
    
    // Get available servers in preferred order
    const availableServers = Array.from(this.serverLocations.values())
      .filter(server => server.status === 'active')
      .sort((a, b) => {
        // Prefer servers in same region as target
        const aRegionMatch = this.isRegionMatch(a.country, targetRegion) ? 0 : 1;
        const bRegionMatch = this.isRegionMatch(b.country, targetRegion) ? 0 : 1;
        
        if (aRegionMatch !== bRegionMatch) {
          return aRegionMatch - bRegionMatch;
        }
        
        // Then sort by load and latency
        const aScore = (a.load / a.maxLoad) + (a.latency / 100);
        const bScore = (b.load / b.maxLoad) + (b.latency / 100);
        return aScore - bScore;
      });

    const selectedServer = availableServers[0];
    if (selectedServer) {
      console.log(`✅ Selected server: ${selectedServer.region} (${selectedServer.city})`);
      selectedServer.load += 1;
    }

    return selectedServer;
  }

  selectOptimalProxyProvider(serverLocation: any, targetUrl: string): any {
    console.log(`🔄 Selecting optimal proxy for server: ${serverLocation.region}`);

    const urlDomain = new URL(targetUrl).hostname;
    const requiredRegion = this.determineTargetRegion(urlDomain);

    const availableProviders = Array.from(this.proxyProviders.values())
      .filter(provider => {
        return provider.status === 'active' && 
               provider.currentLoad < provider.maxConcurrent &&
               (provider.locations.includes(requiredRegion) || provider.locations.includes('Global'));
      })
      .sort((a, b) => {
        // Score based on reliability, speed, and current load
        const aScore = a.reliability * 0.4 + 
                      (a.speed === 'fast' ? 0.3 : a.speed === 'medium' ? 0.2 : 0.1) * 0.3 +
                      (1 - a.currentLoad / a.maxConcurrent) * 0.3;
        
        const bScore = b.reliability * 0.4 + 
                      (b.speed === 'fast' ? 0.3 : b.speed === 'medium' ? 0.2 : 0.1) * 0.3 +
                      (1 - b.currentLoad / b.maxConcurrent) * 0.3;
        
        return bScore - aScore; // Higher score first
      });

    const selectedProvider = availableProviders[0];
    if (selectedProvider) {
      console.log(`✅ Selected proxy provider: ${selectedProvider.name} (${selectedProvider.type})`);
      selectedProvider.currentLoad += 1;
    }

    return selectedProvider;
  }

  private determineTargetRegion(domain: string): string {
    // Simple domain-based region detection
    if (domain.includes('.uk') || domain.includes('.de') || domain.includes('.fr')) {
      return 'EU';
    }
    if (domain.includes('.jp') || domain.includes('.sg') || domain.includes('.au')) {
      return 'APAC';
    }
    if (domain.includes('.ca')) {
      return 'CA';
    }
    return 'US'; // Default to US
  }

  private isRegionMatch(serverCountry: string, targetRegion: string): boolean {
    const regionMap = {
      'US': ['United States'],
      'EU': ['Ireland', 'Germany', 'United Kingdom', 'France'],
      'APAC': ['Singapore', 'Japan', 'Australia'],
      'CA': ['Canada']
    };

    return regionMap[targetRegion]?.includes(serverCountry) || false;
  }

  handleFailover(failedServer: any, failedProvider: any): any {
    console.log(`⚠️ Handling failover from server: ${failedServer?.region}, provider: ${failedProvider?.name}`);

    const failoverEvent = {
      timestamp: new Date().toISOString(),
      failedServer: failedServer?.region,
      failedProvider: failedProvider?.name,
      reason: 'connection_failure'
    };

    this.failoverHistory.push(failoverEvent);

    // Mark failed resources as temporarily unavailable
    if (failedServer) {
      failedServer.status = 'degraded';
      setTimeout(() => {
        failedServer.status = 'active';
        console.log(`✅ Server ${failedServer.region} restored to active status`);
      }, 300000); // 5 minutes
    }

    if (failedProvider) {
      failedProvider.status = 'degraded';
      setTimeout(() => {
        failedProvider.status = 'active';
        console.log(`✅ Provider ${failedProvider.name} restored to active status`);
      }, 600000); // 10 minutes
    }

    // Select alternative resources
    const alternativeServer = this.selectOptimalServer('https://example.com');
    const alternativeProvider = alternativeServer ? 
      this.selectOptimalProxyProvider(alternativeServer, 'https://example.com') : null;

    return {
      server: alternativeServer,
      provider: alternativeProvider,
      failoverEvent
    };
  }

  getTrafficDistributionStats(): any {
    const serverStats = Array.from(this.serverLocations.values()).map(server => ({
      region: server.region,
      load: server.load,
      maxLoad: server.maxLoad,
      utilization: Math.round((server.load / server.maxLoad) * 100),
      status: server.status
    }));

    const providerStats = Array.from(this.proxyProviders.values()).map(provider => ({
      name: provider.name,
      type: provider.type,
      load: provider.currentLoad,
      maxLoad: provider.maxConcurrent,
      utilization: Math.round((provider.currentLoad / provider.maxConcurrent) * 100),
      reliability: provider.reliability,
      status: provider.status
    }));

    return {
      servers: serverStats,
      providers: providerStats,
      failover_events: this.failoverHistory.length,
      total_regions: this.serverLocations.size,
      total_providers: this.proxyProviders.size
    };
  }
}
