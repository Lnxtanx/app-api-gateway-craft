
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import puppeteer, { Browser, Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Level 4: Enhanced Stealth Scraping Engine
 * Implements comprehensive anti-detection and distributed architecture
 */

interface ScrapeJob {
  id: string;
  url: string;
  priority: 'low' | 'medium' | 'high';
  retry_count: number;
  max_retries: number;
  worker_region?: string;
  anti_detection_profile: string;
  created_at: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  success?: boolean;
  result_data?: any;
  error_message?: string;
}

interface StealthProfile {
  name: string;
  userAgent: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  isLandscape: boolean;
  timezone: string;
  locale: string;
  plugins: string[];
  fonts: string[];
  webgl_vendor: string;
  webgl_renderer: string;
}

/**
 * Enhanced Browser Fingerprint Manager
 */
class BrowserFingerprintManager {
  private static profiles: StealthProfile[] = [
    {
      name: 'windows_chrome_desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
      timezone: 'America/New_York',
      locale: 'en-US',
      plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client'],
      fonts: ['Arial', 'Times New Roman', 'Courier New', 'Helvetica'],
      webgl_vendor: 'Google Inc. (Intel)',
      webgl_renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)'
    },
    {
      name: 'mac_safari_desktop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
      timezone: 'America/Los_Angeles',
      locale: 'en-US',
      plugins: ['WebKit built-in PDF'],
      fonts: ['SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial'],
      webgl_vendor: 'Apple Inc.',
      webgl_renderer: 'Apple GPU'
    },
    {
      name: 'android_chrome_mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
      isLandscape: false,
      timezone: 'America/New_York',
      locale: 'en-US',
      plugins: [],
      fonts: ['Roboto', 'Arial', 'sans-serif'],
      webgl_vendor: 'Qualcomm',
      webgl_renderer: 'Adreno (TM) 660'
    }
  ];

  static getRandomProfile(): StealthProfile {
    return this.profiles[Math.floor(Math.random() * this.profiles.length)];
  }

  static getProfileByName(name: string): StealthProfile | undefined {
    return this.profiles.find(p => p.name === name);
  }

  static getAllProfiles(): StealthProfile[] {
    return this.profiles;
  }
}

/**
 * Enhanced Human Behavior Simulator
 */
class HumanBehaviorSimulator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async humanMouseMovement(x: number, y: number): Promise<void> {
    const steps = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const easeProgress = this.easeInOutCubic(progress);
      
      const currentX = x * easeProgress;
      const currentY = y * easeProgress;
      
      await this.page.mouse.move(currentX, currentY);
      await this.randomDelay(5, 15);
    }
  }

  async humanTypeText(selector: string, text: string): Promise<void> {
    await this.page.focus(selector);
    
    for (const char of text) {
      await this.page.keyboard.type(char);
      await this.randomDelay(50, 150);
    }
  }

  async humanScroll(): Promise<void> {
    const scrollCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < scrollCount; i++) {
      const scrollDistance = Math.floor(Math.random() * 500) + 200;
      await this.page.evaluate((distance) => {
        window.scrollBy(0, distance);
      }, scrollDistance);
      
      await this.randomDelay(800, 2000);
    }
  }

  async simulateRandomInteractions(): Promise<void> {
    try {
      // Random mouse movements
      for (let i = 0; i < 3; i++) {
        const x = Math.floor(Math.random() * 1000) + 100;
        const y = Math.floor(Math.random() * 600) + 100;
        await this.humanMouseMovement(x, y);
        await this.randomDelay(500, 1500);
      }

      // Random scrolling
      await this.humanScroll();
    } catch (error) {
      console.log('Random interaction simulation completed:', error);
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Enhanced Stealth Browser Controller
 */
class StealthBrowserController {
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

/**
 * Enhanced Distributed Job Manager
 */
class DistributedJobManager {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async enqueueJob(url: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
    const jobId = crypto.randomUUID();
    
    const job: Partial<ScrapeJob> = {
      id: jobId,
      url: url,
      priority: priority,
      retry_count: 0,
      max_retries: 3,
      anti_detection_profile: BrowserFingerprintManager.getRandomProfile().name,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await this.supabase
        .from('scrape_jobs')
        .insert(job);
      
      if (error) throw error;
      
      console.log(`Job enqueued: ${jobId} for URL: ${url}`);
      return jobId;
    } catch (error) {
      console.error('Failed to enqueue job:', error);
      throw error;
    }
  }

  async getJobStats(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_job_statistics');
      
      if (error) throw error;
      
      return data || { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    } catch (error) {
      console.error('Failed to get job stats:', error);
      return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Stealth scraper function called');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const jobManager = new DistributedJobManager(supabaseAdmin);

    // Handle stats request (no body needed)
    if (req.method === 'GET') {
      console.log('Getting system stats');
      const stats = await jobManager.getJobStats();
      const systemStatus = {
        ...stats,
        available_profiles: BrowserFingerprintManager.getAllProfiles().length,
        captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
        stealth_features: [
          'Browser Fingerprint Rotation',
          'Human Behavior Simulation',
          'Anti-Detection Techniques',
          'Request Pattern Randomization',
          'Distributed Job Processing',
          'Enhanced Data Extraction'
        ]
      };
      
      return new Response(JSON.stringify(systemStatus), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle POST requests with body
    let requestBody: any = {};
    try {
      const text = await req.text();
      if (text) {
        requestBody = JSON.parse(text);
      }
    } catch (error) {
      console.log('No JSON body found, using empty object');
    }

    const action = requestBody.action || 'stats';
    console.log('Action:', action);

    switch (action) {
      case 'scrape': {
        const targetUrl = requestBody.url;
        
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'URL required for scraping' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Starting direct scrape for: ${targetUrl}`);
        const profile = BrowserFingerprintManager.getRandomProfile();
        const stealthBrowser = new StealthBrowserController(profile);
        
        try {
          await stealthBrowser.initialize();
          await stealthBrowser.navigateWithStealth(targetUrl);
          
          const html = await stealthBrowser.getPageContent();
          const structuredData = await stealthBrowser.extractStructuredData();
          
          await stealthBrowser.close();

          console.log(`Scraping completed for ${targetUrl}. Profile used: ${profile.name}`);
          console.log('Extracted data summary:', {
            title: structuredData.title,
            quotes: structuredData.quotes?.length || 0,
            articles: structuredData.articles?.length || 0,
            links: structuredData.links?.length || 0,
            images: structuredData.images?.length || 0
          });
          
          return new Response(JSON.stringify({
            url: targetUrl,
            html: html.substring(0, 5000) + (html.length > 5000 ? '...' : ''),
            structured_data: structuredData,
            metadata: {
              profile_used: profile.name,
              captcha_encountered: false,
              content_length: html.length,
              extraction_summary: {
                title: structuredData.title || 'No title found',
                quotes_found: structuredData.quotes?.length || 0,
                articles_found: structuredData.articles?.length || 0,
                links_found: structuredData.links?.length || 0,
                images_found: structuredData.images?.length || 0,
                navigation_items: structuredData.navigation?.length || 0,
                list_items: structuredData.listItems?.length || 0
              }
            }
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          
        } catch (error) {
          await stealthBrowser.close();
          console.error('Direct scraping failed:', error);
          return new Response(JSON.stringify({ 
            error: 'Direct scraping failed',
            details: error.message,
            url: targetUrl
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'enqueue': {
        const targetUrl = requestBody.url;
        const priority = requestBody.priority || 'medium';
        
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'URL required for enqueue' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const jobId = await jobManager.enqueueJob(targetUrl, priority);
        
        return new Response(JSON.stringify({ 
          job_id: jobId,
          url: targetUrl,
          priority: priority,
          stats: await jobManager.getJobStats()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default: {
        // Default to stats
        console.log('Getting system stats (default)');
        const stats = await jobManager.getJobStats();
        const systemStatus = {
          ...stats,
          available_profiles: BrowserFingerprintManager.getAllProfiles().length,
          captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
          stealth_features: [
            'Browser Fingerprint Rotation',
            'Human Behavior Simulation',
            'Anti-Detection Techniques',
            'Request Pattern Randomization',
            'Distributed Job Processing',
            'Enhanced Data Extraction'
          ]
        };
        
        return new Response(JSON.stringify(systemStatus), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('Enhanced Stealth Scraper Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
