
import { StealthProfile } from './types.ts';

export class BrowserFingerprintManager {
  private static profiles: StealthProfile[] = [
    {
      name: 'Windows-Chrome-Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
      locale: 'en-US',
      timezone: 'America/New_York',
      platformType: 'desktop',
      priority: 100
    },
    {
      name: 'MacOS-Safari-Desktop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
      locale: 'en-US',
      timezone: 'America/Los_Angeles',
      platformType: 'desktop',
      priority: 90
    },
    {
      name: 'Linux-Firefox-Desktop',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
      locale: 'en-US',
      timezone: 'America/Chicago',
      platformType: 'desktop',
      priority: 80
    },
    {
      name: 'iPhone-Safari-Mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
      locale: 'en-US',
      timezone: 'America/New_York',
      platformType: 'mobile',
      priority: 70
    },
    {
      name: 'Android-Chrome-Mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
      locale: 'en-US',
      timezone: 'America/Denver',
      platformType: 'mobile',
      priority: 75
    },
    {
      name: 'iPad-Safari-Tablet',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      viewport: { width: 1024, height: 1366 },
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: true,
      isLandscape: false,
      locale: 'en-US',
      timezone: 'America/Los_Angeles',
      platformType: 'tablet',
      priority: 65
    },
    {
      name: 'Windows-Edge-Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      viewport: { width: 1536, height: 864 },
      deviceScaleFactor: 1.25,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
      locale: 'en-US',
      timezone: 'America/Chicago',
      platformType: 'desktop',
      priority: 85
    }
  ];

  // URL-based profile mapping for optimal compatibility
  private static urlPatterns = [
    {
      patterns: ['instagram.com', 'facebook.com', 'twitter.com', 'tiktok.com'],
      preferredProfiles: ['iPhone-Safari-Mobile', 'Android-Chrome-Mobile'],
      reason: 'Social media sites work better with mobile profiles'
    },
    {
      patterns: ['amazon.com', 'ebay.com', 'shopify.com', 'aliexpress.com'],
      preferredProfiles: ['Windows-Chrome-Desktop', 'MacOS-Safari-Desktop'],
      reason: 'E-commerce sites optimized for desktop browsing'
    },
    {
      patterns: ['github.com', 'stackoverflow.com', 'developer.', 'docs.'],
      preferredProfiles: ['MacOS-Safari-Desktop', 'Linux-Firefox-Desktop'],
      reason: 'Developer sites commonly accessed from dev environments'
    },
    {
      patterns: ['netflix.com', 'youtube.com', 'spotify.com', 'twitch.tv'],
      preferredProfiles: ['Windows-Chrome-Desktop', 'iPad-Safari-Tablet'],
      reason: 'Media sites benefit from larger screens'
    },
    {
      patterns: ['linkedin.com', 'indeed.com', 'glassdoor.com'],
      preferredProfiles: ['Windows-Chrome-Desktop', 'Windows-Edge-Desktop'],
      reason: 'Professional sites commonly accessed from corporate environments'
    }
  ];

  static getRandomProfile(): StealthProfile {
    const randomIndex = Math.floor(Math.random() * this.profiles.length);
    return { ...this.profiles[randomIndex] };
  }

  static getOptimalProfile(url: string): StealthProfile {
    console.log(`🎯 Selecting optimal profile for URL: ${url}`);
    
    // Find matching URL pattern
    for (const pattern of this.urlPatterns) {
      if (pattern.patterns.some(p => url.toLowerCase().includes(p))) {
        console.log(`📍 Found matching pattern: ${pattern.reason}`);
        
        // Select random profile from preferred profiles
        const availableProfiles = this.profiles.filter(profile => 
          pattern.preferredProfiles.includes(profile.name)
        );
        
        if (availableProfiles.length > 0) {
          const selectedProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
          console.log(`✅ Selected optimized profile: ${selectedProfile.name}`);
          return { ...selectedProfile };
        }
      }
    }
    
    // Fallback to weighted random selection based on priority
    const weightedProfiles = this.profiles.map(profile => ({
      ...profile,
      weight: profile.priority / 100
    }));
    
    const totalWeight = weightedProfiles.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const profile of weightedProfiles) {
      random -= profile.weight;
      if (random <= 0) {
        console.log(`✅ Selected weighted random profile: ${profile.name}`);
        return { ...profile };
      }
    }
    
    // Ultimate fallback
    return { ...this.profiles[0] };
  }

  static getAllProfiles(): StealthProfile[] {
    return [...this.profiles];
  }

  static getProfileByName(name: string): StealthProfile | null {
    const profile = this.profiles.find(p => p.name === name);
    return profile ? { ...profile } : null;
  }

  static getProfilesByPlatform(platformType: string): StealthProfile[] {
    return this.profiles
      .filter(profile => profile.platformType === platformType)
      .map(profile => ({ ...profile }));
  }

  static addCustomProfile(profile: StealthProfile): void {
    this.profiles.push({ ...profile });
    console.log(`➕ Added custom profile: ${profile.name}`);
  }

  static getProfileStats(): any {
    const stats = {
      total: this.profiles.length,
      byPlatform: {} as any,
      byBrowser: {} as any,
      avgPriority: 0
    };
    
    this.profiles.forEach(profile => {
      // Platform stats
      stats.byPlatform[profile.platformType] = (stats.byPlatform[profile.platformType] || 0) + 1;
      
      // Browser stats (extract from user agent)
      if (profile.userAgent.includes('Chrome')) {
        stats.byBrowser.chrome = (stats.byBrowser.chrome || 0) + 1;
      } else if (profile.userAgent.includes('Safari') && !profile.userAgent.includes('Chrome')) {
        stats.byBrowser.safari = (stats.byBrowser.safari || 0) + 1;
      } else if (profile.userAgent.includes('Firefox')) {
        stats.byBrowser.firefox = (stats.byBrowser.firefox || 0) + 1;
      } else if (profile.userAgent.includes('Edge')) {
        stats.byBrowser.edge = (stats.byBrowser.edge || 0) + 1;
      }
    });
    
    stats.avgPriority = this.profiles.reduce((sum, p) => sum + p.priority, 0) / this.profiles.length;
    
    return stats;
  }
}
