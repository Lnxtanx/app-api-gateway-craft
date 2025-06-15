
import puppeteer, { Browser, Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import { StealthProfile } from './types.ts';
import { BrowserFingerprintManager } from './browser-fingerprint-manager.ts';
import { HumanBehaviorSimulator } from './human-behavior-simulator.ts';
import { AdvancedScrapingEngine } from './advanced-scraping-engine.ts';

/**
 * Enhanced Stealth Browser Controller with Advanced Logical Scraping
 */
export class StealthBrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private profile: StealthProfile;
  private humanBehavior: HumanBehaviorSimulator | null = null;
  private scrapingEngine: AdvancedScrapingEngine | null = null;

  constructor(profile?: StealthProfile) {
    this.profile = profile || BrowserFingerprintManager.getRandomProfile();
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing advanced stealth browser with profile: ${this.profile.name}`);
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
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
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-features=TranslateUI',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
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
      ],
    });

    this.page = await this.browser.newPage();
    await this.applyAdvancedStealthTechniques();
    this.humanBehavior = new HumanBehaviorSimulator(this.page);
    this.scrapingEngine = new AdvancedScrapingEngine(this.page, this.profile);
  }

  private async applyAdvancedStealthTechniques(): Promise<void> {
    if (!this.page) return;

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

    // Set headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': this.profile.locale,
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    });

    // Advanced stealth techniques
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

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
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

      // Override screen properties
      Object.defineProperty(screen, 'availHeight', {
        get: () => window.screen.height,
      });
      
      Object.defineProperty(screen, 'availWidth', {
        get: () => window.screen.width,
      });
    });

    console.log('🛡️ Advanced stealth techniques applied successfully');
  }

  async navigateWithStealth(url: string): Promise<void> {
    if (!this.page || !this.humanBehavior) throw new Error('Browser not initialized');

    console.log(`🌐 Navigating to ${url} with enhanced stealth mode...`);

    // Random delay before navigation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));

    // Navigate with extended timeout and multiple wait conditions
    const timeout = Math.random() * 15000 + 30000;
    
    try {
      await this.page.goto(url, { 
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
        timeout: timeout
      });
    } catch (error) {
      console.log('⚠️ Initial navigation timeout, trying with networkidle2...');
      await this.page.goto(url, { 
        waitUntil: ['networkidle2', 'domcontentloaded'],
        timeout: 20000
      });
    }

    // Simulate human behavior
    await this.humanBehavior.simulateRandomInteractions();
    
    // Additional wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
  }

  async getPageContent(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.content();
  }

  async extractStructuredData(): Promise<any> {
    if (!this.page || !this.scrapingEngine) throw new Error('Browser not initialized');
    
    console.log('🧠 Starting advanced logical scraping flow...');
    
    try {
      // Use the advanced scraping engine
      const advancedResult = await this.scrapingEngine.executeLogicalFlow(this.page.url());
      
      // Merge with basic extraction for completeness
      const basicResult = await this.performBasicExtraction();
      
      return {
        ...basicResult,
        advanced: advancedResult,
        extraction_method: 'advanced_logical_flow',
        confidence: advancedResult.enhancement?.confidence || 0.7
      };
      
    } catch (error) {
      console.log('⚠️ Advanced extraction failed, falling back to basic extraction:', error);
      return await this.performBasicExtraction();
    }
  }

  private async performBasicExtraction(): Promise<any> {
    if (!this.page) throw new Error('Page not initialized');
    
    return await this.page.evaluate(() => {
      const data: any = {};
      
      // Basic page information
      data.title = document.title || 'No title found';
      
      const metaDescription = document.querySelector('meta[name="description"]');
      data.description = metaDescription ? metaDescription.getAttribute('content') || '' : '';
      
      // Extract headings with hierarchy
      data.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim() || '',
        level: parseInt(h.tagName.substring(1))
      })).filter(h => h.text.length > 0).slice(0, 20);
      
      // Extract links with more metadata
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
      
      // Extract images with more details
      data.images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        width: img.getAttribute('width') || img.naturalWidth || '',
        height: img.getAttribute('height') || img.naturalHeight || '',
        loading: img.getAttribute('loading') || '',
        srcset: img.getAttribute('srcset') || ''
      })).filter(img => img.src.length > 0).slice(0, 20);

      // Enhanced extraction for structured content
      data.structuredContent = {
        quotes: this.extractQuotes(),
        articles: this.extractArticles(),
        products: this.extractProducts(),
        events: this.extractEvents(),
        reviews: this.extractReviews(),
        breadcrumbs: this.extractBreadcrumbs(),
        socialMedia: this.extractSocialMediaLinks(),
        contactInfo: this.extractContactInfo()
      };

      // Extract forms and inputs
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

      // Extract metadata
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

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
