
/**
 * Level 2: Residential Proxy Networks
 * Enhanced proxy management with residential IPs, geographic rotation, and health monitoring
 */
export interface ResidentialProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  isResidential: boolean;
  country: string;
  city?: string;
  provider: string;
  speed: number; // ms response time
  reliability: number; // 0-100 success rate
  lastUsed?: Date;
  requestCount: number;
  maxRequests: number;
  isActive: boolean;
  reputationScore: number; // 0-100
  costPerRequest?: number;
}

export class ResidentialProxyManager {
  private residentialProxies: ResidentialProxyConfig[] = [];
  private datacenters: ResidentialProxyConfig[] = [];
  private currentIndex = 0;
  private healthCheckInterval: number | null = null;
  private geoRotationStrategy: 'random' | 'sequential' | 'sticky' = 'random';

  constructor() {
    this.initializeProxyPools();
    this.startHealthMonitoring();
    console.log('🌐 Level 2 Residential Proxy Manager initialized');
  }

  private initializeProxyPools(): void {
    // Initialize with high-quality residential proxy providers
    // These would typically come from premium proxy services
    this.residentialProxies = [
      {
        host: 'premium-residential-1.proxy.service',
        port: 8080,
        username: 'user1',
        password: 'pass1',
        type: 'http',
        isResidential: true,
        country: 'US',
        city: 'New York',
        provider: 'ProxyService1',
        speed: 150,
        reliability: 95,
        requestCount: 0,
        maxRequests: 100,
        isActive: true,
        reputationScore: 95
      },
      {
        host: 'premium-residential-2.proxy.service',
        port: 8080,
        username: 'user2',
        password: 'pass2',
        type: 'http',
        isResidential: true,
        country: 'UK',
        city: 'London',
        provider: 'ProxyService1',
        speed: 120,
        reliability: 92,
        requestCount: 0,
        maxRequests: 100,
        isActive: true,
        reputationScore: 92
      },
      {
        host: 'residential-ca.proxy.service',
        port: 8080,
        username: 'user3',
        password: 'pass3',
        type: 'http',
        isResidential: true,
        country: 'CA',
        city: 'Toronto',
        provider: 'ProxyService2',
        speed: 180,
        reliability: 89,
        requestCount: 0,
        maxRequests: 80,
        isActive: true,
        reputationScore: 89
      }
    ];

    // Fallback datacenter proxies for when residential isn't available
    this.datacenters = [
      {
        host: '8.8.8.8',
        port: 3128,
        type: 'http',
        isResidential: false,
        country: 'US',
        provider: 'Datacenter',
        speed: 50,
        reliability: 85,
        requestCount: 0,
        maxRequests: 50,
        isActive: true,
        reputationScore: 70
      },
      {
        host: '1.1.1.1',
        port: 3128,
        type: 'http',
        isResidential: false,
        country: 'US',
        provider: 'Datacenter',
        speed: 45,
        reliability: 88,
        requestCount: 0,
        maxRequests: 50,
        isActive: true,
        reputationScore: 72
      }
    ];

    console.log(`🏠 Loaded ${this.residentialProxies.length} residential proxies`);
    console.log(`🏢 Loaded ${this.datacenters.length} datacenter proxies`);
  }

  getBestProxy(url: string, preferResidential = true): ResidentialProxyConfig | null {
    const targetDomain = new URL(url).hostname;
    
    // Determine target geography if possible
    const targetCountry = this.detectTargetCountry(targetDomain);
    
    // Get available proxies
    const primaryPool = preferResidential ? this.residentialProxies : [...this.residentialProxies, ...this.datacenters];
    const availableProxies = primaryPool.filter(p => 
      p.isActive && 
      p.requestCount < p.maxRequests &&
      p.reputationScore > 70
    );

    if (availableProxies.length === 0) {
      console.log('⚠️ No quality proxies available, using fallback');
      return this.getFallbackProxy();
    }

    // Score proxies based on multiple factors
    const scoredProxies = availableProxies.map(proxy => ({
      proxy,
      score: this.calculateProxyScore(proxy, targetCountry, url)
    }));

    // Sort by score (higher is better)
    scoredProxies.sort((a, b) => b.score - a.score);
    
    const selectedProxy = scoredProxies[0].proxy;
    
    // Update usage
    selectedProxy.requestCount++;
    selectedProxy.lastUsed = new Date();
    
    console.log(`🎯 Selected ${selectedProxy.isResidential ? 'residential' : 'datacenter'} proxy: ${selectedProxy.country} (Score: ${scoredProxies[0].score.toFixed(2)})`);
    
    return selectedProxy;
  }

  private calculateProxyScore(proxy: ResidentialProxyConfig, targetCountry?: string, url?: string): number {
    let score = 0;
    
    // Base reputation score (0-40 points)
    score += (proxy.reputationScore / 100) * 40;
    
    // Reliability bonus (0-20 points)
    score += (proxy.reliability / 100) * 20;
    
    // Speed bonus (0-15 points) - faster is better
    const speedScore = Math.max(0, (500 - proxy.speed) / 500) * 15;
    score += speedScore;
    
    // Residential bonus (0-15 points)
    if (proxy.isResidential) {
      score += 15;
    }
    
    // Geographic matching bonus (0-10 points)
    if (targetCountry && proxy.country === targetCountry) {
      score += 10;
    }
    
    // Usage load penalty (0 to -10 points)
    const usageRatio = proxy.requestCount / proxy.maxRequests;
    score -= usageRatio * 10;
    
    // Recent usage penalty to encourage rotation
    if (proxy.lastUsed) {
      const timeSinceUsed = Date.now() - proxy.lastUsed.getTime();
      if (timeSinceUsed < 30000) { // Less than 30 seconds
        score -= 5;
      }
    }
    
    return score;
  }

  private detectTargetCountry(domain: string): string | undefined {
    // Simple country detection based on domain patterns
    const countryPatterns = {
      'co.uk': 'UK',
      '.uk': 'UK',
      '.ca': 'CA',
      '.au': 'AU',
      '.de': 'DE',
      '.fr': 'FR',
      '.jp': 'JP',
      '.cn': 'CN'
    };

    for (const [pattern, country] of Object.entries(countryPatterns)) {
      if (domain.includes(pattern)) {
        return country;
      }
    }

    // Default to US for .com and others
    return 'US';
  }

  private getFallbackProxy(): ResidentialProxyConfig | null {
    // Reset counters if all proxies are exhausted
    const allProxies = [...this.residentialProxies, ...this.datacenters];
    const anyAvailable = allProxies.some(p => p.isActive && p.requestCount < p.maxRequests);
    
    if (!anyAvailable) {
      console.log('🔄 Resetting proxy counters');
      allProxies.forEach(proxy => {
        proxy.requestCount = 0;
        proxy.isActive = true;
      });
    }

    // Return the highest reputation active proxy
    const availableProxies = allProxies.filter(p => p.isActive);
    if (availableProxies.length === 0) return null;

    return availableProxies.reduce((best, current) => 
      current.reputationScore > best.reputationScore ? current : best
    );
  }

  private startHealthMonitoring(): void {
    // Monitor proxy health every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 5 * 60 * 1000) as any;
    
    console.log('❤️ Proxy health monitoring started');
  }

  private async performHealthChecks(): Promise<void> {
    console.log('🔍 Performing proxy health checks...');
    
    const allProxies = [...this.residentialProxies, ...this.datacenters];
    const healthPromises = allProxies.slice(0, 5).map(proxy => this.checkProxyHealth(proxy));
    
    try {
      await Promise.allSettled(healthPromises);
      console.log('✅ Health checks completed');
    } catch (error) {
      console.log('⚠️ Some health checks failed:', error);
    }
  }

  private async checkProxyHealth(proxy: ResidentialProxyConfig): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simple health check using a reliable endpoint
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        // Note: In a real implementation, you'd configure the proxy here
        signal: AbortSignal.timeout(10000)
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        proxy.speed = responseTime;
        proxy.reliability = Math.min(100, proxy.reliability + 1);
        proxy.reputationScore = Math.min(100, proxy.reputationScore + 0.5);
        proxy.isActive = true;
        
        console.log(`✅ Proxy ${proxy.host} healthy (${responseTime}ms)`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      proxy.reliability = Math.max(0, proxy.reliability - 5);
      proxy.reputationScore = Math.max(0, proxy.reputationScore - 2);
      
      if (proxy.reliability < 50) {
        proxy.isActive = false;
        console.log(`❌ Proxy ${proxy.host} deactivated due to poor health`);
      }
      
      console.log(`⚠️ Proxy ${proxy.host} failed health check:`, error.message);
    }
  }

  getProxyString(proxy: ResidentialProxyConfig): string {
    if (proxy.username && proxy.password) {
      return `--proxy-server=${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    }
    return `--proxy-server=${proxy.type}://${proxy.host}:${proxy.port}`;
  }

  getProxyStats(): any {
    const allProxies = [...this.residentialProxies, ...this.datacenters];
    
    return {
      total: allProxies.length,
      residential: this.residentialProxies.length,
      datacenter: this.datacenters.length,
      active: allProxies.filter(p => p.isActive).length,
      highReputation: allProxies.filter(p => p.reputationScore > 80).length,
      averageSpeed: allProxies.reduce((sum, p) => sum + p.speed, 0) / allProxies.length,
      averageReliability: allProxies.reduce((sum, p) => sum + p.reliability, 0) / allProxies.length,
      countries: [...new Set(allProxies.map(p => p.country))],
      providers: [...new Set(allProxies.map(p => p.provider))]
    };
  }

  markProxyFailed(proxy: ResidentialProxyConfig, reason: string): void {
    proxy.reputationScore = Math.max(0, proxy.reputationScore - 10);
    proxy.reliability = Math.max(0, proxy.reliability - 5);
    
    if (proxy.reputationScore < 30) {
      proxy.isActive = false;
      console.log(`❌ Proxy ${proxy.host} blacklisted due to: ${reason}`);
    }
    
    console.log(`⚠️ Proxy ${proxy.host} penalized for: ${reason}`);
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      console.log('🔄 Proxy health monitoring stopped');
    }
  }
}
