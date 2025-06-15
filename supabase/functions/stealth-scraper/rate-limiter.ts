
export class RateLimiter {
  private domainTimestamps: Map<string, number[]> = new Map();
  private readonly maxRequestsPerMinute = 10;
  private readonly minDelayMs = 1000;
  private readonly maxDelayMs = 3000;

  constructor() {
    console.log('⏱️ RateLimiter initialized');
  }

  async waitForRateLimit(url: string): Promise<void> {
    const domain = new URL(url).hostname;
    const now = Date.now();
    
    // Get timestamps for this domain
    const timestamps = this.domainTimestamps.get(domain) || [];
    
    // Remove timestamps older than 1 minute
    const recentTimestamps = timestamps.filter(t => now - t < 60000);
    
    // Check if we're hitting rate limits
    if (recentTimestamps.length >= this.maxRequestsPerMinute) {
      const oldestTimestamp = Math.min(...recentTimestamps);
      const waitTime = 60000 - (now - oldestTimestamp) + Math.random() * 2000;
      console.log(`⏱️ Rate limit reached for ${domain}, waiting ${Math.round(waitTime)}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Add random delay between requests
    const randomDelay = this.minDelayMs + Math.random() * (this.maxDelayMs - this.minDelayMs);
    console.log(`⏱️ Random delay for ${domain}: ${Math.round(randomDelay)}ms`);
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    // Update timestamps
    recentTimestamps.push(now);
    this.domainTimestamps.set(domain, recentTimestamps);
  }

  async respectRobotsTxt(url: string): Promise<boolean> {
    try {
      const domain = new URL(url).origin;
      const robotsUrl = `${domain}/robots.txt`;
      
      console.log(`🤖 Checking robots.txt for ${domain}`);
      
      const response = await fetch(robotsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StealthBot/1.0)'
        }
      });

      if (!response.ok) {
        console.log(`🤖 No robots.txt found for ${domain}, proceeding`);
        return true;
      }

      const robotsText = await response.text();
      const lines = robotsText.split('\n');
      
      let currentUserAgent = '';
      let blocked = false;

      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        
        if (trimmedLine.startsWith('user-agent:')) {
          currentUserAgent = trimmedLine.substring(11).trim();
        } else if (trimmedLine.startsWith('disallow:') && 
                   (currentUserAgent === '*' || currentUserAgent.includes('bot'))) {
          const disallowPath = trimmedLine.substring(9).trim();
          const urlPath = new URL(url).pathname;
          
          if (disallowPath === '/' || urlPath.startsWith(disallowPath)) {
            blocked = true;
            break;
          }
        }
      }

      if (blocked) {
        console.log(`🚫 URL blocked by robots.txt: ${url}`);
        return false;
      }

      console.log(`✅ URL allowed by robots.txt: ${url}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Error checking robots.txt, proceeding: ${error.message}`);
      return true;
    }
  }
}
