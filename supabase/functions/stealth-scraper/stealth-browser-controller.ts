
import puppeteer, { Browser, Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import { StealthProfile } from './types.ts';
import { BrowserFingerprintManager } from './browser-fingerprint-manager.ts';
import { HumanBehaviorSimulator } from './human-behavior-simulator.ts';

/**
 * Enhanced Stealth Browser Controller
 */
export class StealthBrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private profile: StealthProfile;
  private humanBehavior: HumanBehaviorSimulator | null = null;

  constructor(profile?: StealthProfile) {
    this.profile = profile || BrowserFingerprintManager.getRandomProfile();
  }

  async initialize(): Promise<void> {
    console.log(`Initializing stealth browser with profile: ${this.profile.name}`);
    
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
        '--user-agent=' + this.profile.userAgent,
        `--window-size=${this.profile.viewport.width},${this.profile.viewport.height}`,
        '--lang=' + this.profile.locale
      ],
    });

    this.page = await this.browser.newPage();
    await this.applyStealthTechniques();
    this.humanBehavior = new HumanBehaviorSimulator(this.page);
  }

  private async applyStealthTechniques(): Promise<void> {
    if (!this.page) return;

    await this.page.setViewport({
      width: this.profile.viewport.width,
      height: this.profile.viewport.height,
      deviceScaleFactor: this.profile.deviceScaleFactor,
      isMobile: this.profile.isMobile,
      hasTouch: this.profile.hasTouch,
      isLandscape: this.profile.isLandscape,
    });

    await this.page.setUserAgent(this.profile.userAgent);

    await this.page.setExtraHTTPHeaders({
      'Accept-Language': this.profile.locale,
    });

    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      if (!window.chrome) {
        window.chrome = {
          runtime: {},
          app: {},
          csi: () => {},
          loadTimes: () => ({}),
        };
      }

      delete window.navigator.__proto__.webdriver;
    });

    console.log('Advanced stealth techniques applied successfully');
  }

  async navigateWithStealth(url: string): Promise<void> {
    if (!this.page || !this.humanBehavior) throw new Error('Browser not initialized');

    console.log(`Navigating to ${url} with enhanced stealth mode...`);

    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    const timeout = Math.random() * 10000 + 30000;
    await this.page.goto(url, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: timeout
    });

    await this.humanBehavior.simulateRandomInteractions();
  }

  async getPageContent(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.content();
  }

  async extractStructuredData(): Promise<any> {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('Starting data extraction...');
    
    return await this.page.evaluate(() => {
      const data: any = {};
      
      // Basic page information
      data.title = document.title || 'No title found';
      
      const metaDescription = document.querySelector('meta[name="description"]');
      data.description = metaDescription ? metaDescription.getAttribute('content') || '' : '';
      
      // Extract headings
      data.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim() || ''
      })).filter(h => h.text.length > 0).slice(0, 10);
      
      // Extract links
      data.links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.getAttribute('href') || '',
        text: a.textContent?.trim() || ''
      })).filter(link => link.text.length > 0).slice(0, 20);
      
      // Extract images
      data.images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
        src: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || ''
      })).filter(img => img.src.length > 0).slice(0, 10);

      // Enhanced extraction for quotes.toscrape.com specifically
      const quotes = Array.from(document.querySelectorAll('.quote')).map(quote => {
        const textEl = quote.querySelector('.text');
        const authorEl = quote.querySelector('.author');
        const tagEls = quote.querySelectorAll('.tag');
        
        return {
          text: textEl?.textContent?.trim().replace(/[""]/g, '') || '',
          author: authorEl?.textContent?.trim() || '',
          tags: Array.from(tagEls).map(tag => tag.textContent?.trim() || '').filter(tag => tag.length > 0)
        };
      }).filter(quote => quote.text.length > 0);

      if (quotes.length > 0) {
        data.quotes = quotes;
        console.log(`Found ${quotes.length} quotes`);
      }

      // Generic structured data extraction for articles/posts
      const articles = Array.from(document.querySelectorAll('article, .article, .post, .item, .card')).map(article => {
        const titleEl = article.querySelector('h1, h2, h3, h4, .title, .headline');
        const contentEl = article.querySelector('p, .content, .description, .summary');
        const linkEl = article.querySelector('a');
        
        return {
          title: titleEl?.textContent?.trim() || '',
          content: contentEl?.textContent?.trim() || '',
          link: linkEl?.getAttribute('href') || ''
        };
      }).filter(article => article.title.length > 0 || article.content.length > 10).slice(0, 15);

      if (articles.length > 0) {
        data.articles = articles;
      }

      // Extract navigation items
      const navItems = Array.from(document.querySelectorAll('nav a, .nav a, .menu a, .navigation a')).map(navLink => ({
        text: navLink.textContent?.trim() || '',
        href: navLink.getAttribute('href') || ''
      })).filter(item => item.text.length > 0).slice(0, 10);

      if (navItems.length > 0) {
        data.navigation = navItems;
      }

      // Extract any structured lists
      const listItems = Array.from(document.querySelectorAll('ul li, ol li')).map(li => ({
        text: li.textContent?.trim() || '',
        link: li.querySelector('a')?.getAttribute('href') || ''
      })).filter(item => item.text.length > 5 && item.text.length < 200).slice(0, 20);

      if (listItems.length > 0) {
        data.listItems = listItems;
      }

      console.log('Data extraction completed:', {
        title: data.title,
        quotesFound: data.quotes?.length || 0,
        articlesFound: data.articles?.length || 0,
        linksFound: data.links?.length || 0,
        imagesFound: data.images?.length || 0
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
