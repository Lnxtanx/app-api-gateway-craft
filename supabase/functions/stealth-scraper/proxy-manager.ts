
export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks4' | 'socks5';
  lastUsed?: Date;
  requestCount: number;
  maxRequests: number;
  isActive: boolean;
}

export class ProxyManager {
  private proxies: ProxyConfig[] = [
    // Free datacenter proxies for basic rotation
    { host: '8.8.8.8', port: 3128, type: 'http', requestCount: 0, maxRequests: 20, isActive: true },
    { host: '1.1.1.1', port: 3128, type: 'http', requestCount: 0, maxRequests: 20, isActive: true },
  ];
  
  private currentProxyIndex = 0;

  constructor() {
    console.log('🔄 ProxyManager initialized with', this.proxies.length, 'proxies');
  }

  getNextProxy(): ProxyConfig | null {
    const availableProxies = this.proxies.filter(p => 
      p.isActive && p.requestCount < p.maxRequests
    );

    if (availableProxies.length === 0) {
      console.log('⚠️ No available proxies, resetting counters');
      this.resetProxyCounters();
      return this.proxies[0] || null;
    }

    const proxy = availableProxies[this.currentProxyIndex % availableProxies.length];
    this.currentProxyIndex++;
    proxy.requestCount++;
    proxy.lastUsed = new Date();

    console.log(`🔄 Using proxy: ${proxy.host}:${proxy.port} (${proxy.requestCount}/${proxy.maxRequests})`);
    return proxy;
  }

  private resetProxyCounters(): void {
    this.proxies.forEach(proxy => {
      proxy.requestCount = 0;
      proxy.isActive = true;
    });
    this.currentProxyIndex = 0;
  }

  markProxyFailed(proxy: ProxyConfig): void {
    proxy.isActive = false;
    console.log(`❌ Proxy marked as failed: ${proxy.host}:${proxy.port}`);
  }

  getProxyString(proxy: ProxyConfig): string {
    if (proxy.username && proxy.password) {
      return `--proxy-server=${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    }
    return `--proxy-server=${proxy.type}://${proxy.host}:${proxy.port}`;
  }
}
