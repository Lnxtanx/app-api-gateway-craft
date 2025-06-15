
import puppeteer, { Browser, Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import { StealthProfile } from './types.ts';
import { BrowserFingerprintManager } from './browser-fingerprint-manager.ts';
import { HumanBehaviorSimulator } from './human-behavior-simulator.ts';
import { AdvancedScrapingEngine } from './advanced-scraping-engine.ts';
import { ProxyManager } from './proxy-manager.ts';
import { RateLimiter } from './rate-limiter.ts';
import { HeaderManager } from './header-manager.ts';
import { Level2StealthController } from './level2-stealth-controller.ts';

/**
 * Enhanced Stealth Browser Controller with Level 1 & 2 Support
 */
export class StealthBrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private profile: StealthProfile;
  private humanBehavior: HumanBehaviorSimulator | null = null;
  private scrapingEngine: AdvancedScrapingEngine | null = null;
  private proxyManager: ProxyManager;
  private rateLimiter: RateLimiter;
  private level2Controller: Level2StealthController | null = null;
  private currentUrl: string = '';
  private previousUrl: string = '';
  private stealthLevel: 1 | 2 = 1;

  constructor(profile?: StealthProfile, stealthLevel: 1 | 2 = 1) {
    this.profile = profile || BrowserFingerprintManager.getRandomProfile();
    this.proxyManager = new ProxyManager();
    this.rateLimiter = new RateLimiter();
    this.stealthLevel = stealthLevel;
    
    if (stealthLevel === 2) {
      this.level2Controller = new Level2StealthController(this.profile);
    }
  }

  async initialize(): Promise<void> {
    if (this.stealthLevel === 2 && this.level2Controller) {
      console.log('🚀 Initializing Level 2 stealth browser...');
      await this.level2Controller.initialize();
      return;
    }

    console.log(`🚀 Initializing Level ${this.stealthLevel} stealth browser with profile: ${this.profile.name}`);
    
    // Get proxy for this session
    const proxy = this.proxyManager.getNextProxy();
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-blink-features=AutomationControlled',
      '--disable-automation',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-ipc-flooding-protection',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-client-side-phishing-detection',
      '--disable-component-extensions-with-background-pages',
      '--disable-features=TranslateUI',
      '--disable-hang-monitor',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--no-crash-upload',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-zygote',
      '--password-store=basic',
      '--use-mock-keychain',
      '--user-agent=' + this.profile.userAgent,
      `--window-size=${this.profile.viewport.width},${this.profile.viewport.height}`,
      '--lang=' + this.profile.locale
    ];

    // Add proxy if available
    if (proxy) {
      launchArgs.push(this.proxyManager.getProxyString(proxy));
      console.log(`🔄 Using proxy: ${proxy.host}:${proxy.port}`);
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: launchArgs,
    });

    this.page = await this.browser.newPage();
    await this.applyLevel1StealthTechniques();
    this.humanBehavior = new HumanBehaviorSimulator(this.page);
    this.scrapingEngine = new AdvancedScrapingEngine(this.page, this.profile);
  }

  private async applyLevel1StealthTechniques(): Promise<void> {
    if (!this.page) return;

    console.log('🛡️ Applying Level 1 stealth techniques...');

    // Set viewport
    await this.page.setViewport({
      width: this.profile.viewport.width,
      height: this.profile.viewport.height,
      deviceScaleFactor: this.profile.deviceScaleFactor,
      isMobile: this.profile.isMobile,
      hasTouch: this.profile.hasTouch,
      isLandscape: this.profile.isLandscape,
    });

    // Set user agent
    await this.page.setUserAgent(this.profile.userAgent);

    // Generate realistic headers
    const headers = HeaderManager.generateRealisticHeaders(this.profile.userAgent);
    await this.page.setExtraHTTPHeaders(headers);

    // Apply advanced stealth techniques
    await this.page.evaluateOnNewDocument(() => {
      // Override webdriver detection
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Mock chrome object
      if (!window.chrome) {
        window.chrome = {
          runtime: {},
          app: {},
          csi: () => {},
          loadTimes: () => ({}),
        };
      }

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Override plugins to look more realistic
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'ppapi_cpp' }
        ],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Remove webdriver traces
      delete window.navigator.__proto__.webdriver;
      
      // Mock hardware concurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 4,
      });

      // Mock device memory
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
      });

      // Override screen properties to match viewport
      Object.defineProperty(screen, 'availHeight', {
        get: () => window.screen.height,
      });
      
      Object.defineProperty(screen, 'availWidth', {
        get: () => window.screen.width,
      });

      // Add realistic timing behavior
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function(callback, delay) {
        const jitter = Math.random() * 10 - 5; // Add small random delay
        return originalSetTimeout(callback, delay + jitter);
      };
    });

    console.log('✅ Level 1 stealth techniques applied successfully');
  }

  async navigateWithStealth(url: string): Promise<void> {
    if (this.stealthLevel === 2 && this.level2Controller) {
      await this.level2Controller.navigateWithLevel2Stealth(url);
      return;
    }

    if (!this.page || !this.humanBehavior) throw new Error('Browser not initialized');

    console.log(`🌐 Level ${this.stealthLevel} stealth navigation to ${url}...`);

    // Check robots.txt compliance
    const robotsAllowed = await this.rateLimiter.respectRobotsTxt(url);
    if (!robotsAllowed) {
      console.log('🚫 Navigation blocked by robots.txt');
      throw new Error('Navigation blocked by robots.txt compliance');
    }

    // Apply rate limiting
    await this.rateLimiter.waitForRateLimit(url);

    // Update navigation headers
    const navigationHeaders = HeaderManager.addNavigationHeaders(url, this.previousUrl);
    await this.page.setExtraHTTPHeaders({
      ...HeaderManager.generateRealisticHeaders(this.profile.userAgent, this.previousUrl),
      ...navigationHeaders
    });

    // Navigate with multiple fallback strategies
    const timeout = Math.random() * 5000 + 25000; // 25-30s random timeout
    
    try {
      await this.page.goto(url, { 
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
        timeout: timeout
      });
    } catch (error) {
      console.log('⚠️ Initial navigation timeout, trying networkidle2...');
      try {
        await this.page.goto(url, { 
          waitUntil: ['networkidle2', 'domcontentloaded'],
          timeout: 20000
        });
      } catch (secondError) {
        console.log('⚠️ Second navigation attempt failed, trying basic load...');
        await this.page.goto(url, { 
          waitUntil: 'load',
          timeout: 15000
        });
      }
    }

    // Update URL tracking
    this.previousUrl = this.currentUrl;
    this.currentUrl = url;

    // Simulate realistic human behavior
    await this.humanBehavior.simulateRandomInteractions();
    
    // Wait for dynamic content with random delay
    const contentWait = Math.random() * 2000 + 2000; // 2-4s wait
    await new Promise(resolve => setTimeout(resolve, contentWait));

    console.log(`✅ Level ${this.stealthLevel} stealth navigation completed`);
  }

  async getPageContent(): Promise<string> {
    if (this.stealthLevel === 2 && this.level2Controller) {
      // For Level 2, we don't expose raw page content
      return 'Level 2 content access through structured extraction only';
    }
    
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.content();
  }

  async extractStructuredData(): Promise<any> {
    if (this.stealthLevel === 2 && this.level2Controller) {
      return await this.level2Controller.extractDataWithLevel2Intelligence();
    }

    if (!this.page || !this.scrapingEngine) throw new Error('Browser not initialized');
    
    console.log(`🧠 Starting Level ${this.stealthLevel} logical scraping flow...`);
    
    try {
      const advancedResult = await this.scrapingEngine.executeLogicalFlow(this.page.url());
      const basicResult = await this.performBasicExtraction();
      
      return {
        ...basicResult,
        advanced: advancedResult,
        extraction_method: `level_${this.stealthLevel}_stealth_scraping`,
        stealth_level: this.stealthLevel,
        confidence: advancedResult.enhancement?.confidence || 0.7
      };
      
    } catch (error) {
      console.log(`⚠️ Level ${this.stealthLevel} advanced extraction failed, falling back to basic extraction:`, error);
      return await this.performBasicExtraction();
    }
  }

  private async performBasicExtraction(): Promise<any> {
    if (!this.page) throw new Error('Page not initialized');
    
    return await this.page.evaluate(() => {
      const data: any = {};
      
      data.title = document.title || 'No title found';
      
      const metaDescription = document.querySelector('meta[name="description"]');
      data.description = metaDescription ? metaDescription.getAttribute('content') || '' : '';
      
      data.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim() || '',
        level: parseInt(h.tagName.substring(1))
      })).filter(h => h.text.length > 0).slice(0, 20);
      
      data.links = Array.from(document.querySelectorAll('a[href]')).map(a => {
        const href = a.getAttribute('href') || '';
        return {
          href: href,
          text: a.textContent?.trim() || '',
          title: a.getAttribute('title') || '',
          target: a.getAttribute('target') || '',
          rel: a.getAttribute('rel') || '',
          isExternal: href.startsWith('http') && !href.includes(window.location.hostname),
          isEmail: href.startsWith('mailto:'),
          isPhone: href.startsWith('tel:')
        };
      }).filter(link => link.text.length > 0 || link.href.length > 0).slice(0, 50);
      
      data.images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        width: img.getAttribute('width') || img.naturalWidth || '',
        height: img.getAttribute('height') || img.naturalHeight || '',
        loading: img.getAttribute('loading') || '',
        srcset: img.getAttribute('srcset') || ''
      })).filter(img => img.src.length > 0).slice(0, 20);

      data.structuredContent = {
        quotes: this.extractQuotes?.() || [],
        articles: this.extractArticles?.() || [],
        products: this.extractProducts?.() || [],
        events: this.extractEvents?.() || [],
        reviews: this.extractReviews?.() || [],
        breadcrumbs: this.extractBreadcrumbs?.() || [],
        socialMedia: this.extractSocialMediaLinks?.() || [],
        contactInfo: this.extractContactInfo?.() || []
      };

      data.forms = Array.from(document.querySelectorAll('form')).map(form => ({
        action: form.getAttribute('action') || '',
        method: form.getAttribute('method') || 'GET',
        inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
          type: input.getAttribute('type') || input.tagName.toLowerCase(),
          name: input.getAttribute('name') || '',
          id: input.getAttribute('id') || '',
          placeholder: input.getAttribute('placeholder') || '',
          required: input.hasAttribute('required')
        }))
      }));

      data.metadata = {
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
        charset: document.querySelector('meta[charset]')?.getAttribute('charset') || 
                document.characterSet || '',
        lang: document.documentElement.lang || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || ''
      };

      console.log('📊 Basic extraction completed:', {
        title: data.title,
        headingsFound: data.headings?.length || 0,
        linksFound: data.links?.length || 0,
        imagesFound: data.images?.length || 0,
        formsFound: data.forms?.length || 0
      });
      
      return data;
    });
  }

  getProfile(): StealthProfile {
    return this.profile;
  }

  getStealthStats(): any {
    if (this.stealthLevel === 2 && this.level2Controller) {
      return this.level2Controller.getLevel2Stats();
    }

    return {
      level: 1,
      name: 'Basic Stealth',
      features: {
        user_agent_rotation: true,
        header_normalization: true,
        basic_rate_limiting: true,
        simple_proxy_usage: true,
        human_behavior_simulation: true
      },
      expected_success_rate: '60-70%',
      profile_used: this.profile.name,
      proxy_active: true
    };
  }

  async close(): Promise<void> {
    if (this.stealthLevel === 2 && this.level2Controller) {
      await this.level2Controller.close();
      return;
    }

    if (this.browser) {
      await this.browser.close();
    }
  }
}
