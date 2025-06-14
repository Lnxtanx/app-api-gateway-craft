
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
    },
    {
      name: 'linux_firefox_desktop',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0',
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
      timezone: 'Europe/London',
      locale: 'en-GB',
      plugins: ['OpenH264 Video Codec', 'Widevine Content Decryption Module'],
      fonts: ['DejaVu Sans', 'Liberation Sans', 'Arial', 'Helvetica'],
      webgl_vendor: 'Mesa',
      webgl_renderer: 'llvmpipe (LLVM 15.0.0, 256 bits)'
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

      // Random link hover
      const links = await this.page.$$('a');
      if (links.length > 0) {
        const randomLink = links[Math.floor(Math.random() * Math.min(links.length, 5))];
        const linkBox = await randomLink.boundingBox();
        if (linkBox) {
          await this.humanMouseMovement(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2);
          await this.randomDelay(500, 1000);
        }
      }
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

    // Enhanced stealth JavaScript injections
    await this.page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Override permissions API
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => Array.from({ length: 3 }, (_, i) => ({ name: `Plugin ${i}` })),
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override chrome property
      if (!window.chrome) {
        window.chrome = {
          runtime: {},
          app: {},
          csi: () => {},
          loadTimes: () => ({}),
        };
      }

      // Remove automation detection
      delete window.navigator.__proto__.webdriver;
    });

    // Inject fingerprint randomization
    await this.page.evaluateOnNewDocument((profile) => {
      // Override screen properties
      Object.defineProperties(screen, {
        width: { get: () => profile.viewport.width },
        height: { get: () => profile.viewport.height },
        availWidth: { get: () => profile.viewport.width },
        availHeight: { get: () => profile.viewport.height - 40 },
      });

      // Override WebGL fingerprinting
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return profile.webgl_vendor;
        if (parameter === 37446) return profile.webgl_renderer;
        return getParameter.call(this, parameter);
      };

      // Override canvas fingerprinting
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        const dataURL = originalToDataURL.apply(this, args);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `rgb(${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)})`;
          ctx.fillRect(0, 0, 1, 1);
        }
        return dataURL;
      };
    }, this.profile);

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
    
    return await this.page.evaluate(() => {
      const data: any = {};
      
      // Extract title
      data.title = document.title;
      
      // Extract meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      data.description = metaDescription ? metaDescription.getAttribute('content') : '';
      
      // Extract headings
      data.headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent?.trim()
      }));
      
      // Extract links
      data.links = Array.from(document.querySelectorAll('a[href]')).slice(0, 50).map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim()
      }));
      
      // Extract images
      data.images = Array.from(document.querySelectorAll('img[src]')).slice(0, 20).map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt')
      }));
      
      return data;
    });
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

  async getNextJob(workerRegion?: string): Promise<ScrapeJob | null> {
    try {
      const { data: jobs, error } = await this.supabase
        .from('scrape_jobs')
        .select('*')
        .is('started_at', null)
        .lte('retry_count', 3)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) throw error;
      if (!jobs || jobs.length === 0) return null;

      const job = jobs[0];

      const { error: updateError } = await this.supabase
        .from('scrape_jobs')
        .update({ 
          started_at: new Date().toISOString(),
          worker_region: workerRegion 
        })
        .eq('id', job.id);

      if (updateError) throw updateError;

      return job;
    } catch (error) {
      console.error('Failed to get next job:', error);
      return null;
    }
  }

  async completeJob(jobId: string, success: boolean, result?: any, error?: string): Promise<void> {
    try {
      const updateData: any = {
        completed_at: new Date().toISOString(),
        success: success
      };

      if (success && result) {
        updateData.result_data = result;
      } else if (!success && error) {
        updateData.error_message = error;
        
        // Increment retry count
        const { error: retryError } = await this.supabase
          .rpc('increment_retry_count', { job_id: jobId });
        
        if (retryError) console.error('Failed to increment retry count:', retryError);
      }

      const { error: updateError } = await this.supabase
        .from('scrape_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (updateError) throw updateError;

      console.log(`Job ${jobId} marked as ${success ? 'completed' : 'failed'}`);
    } catch (error) {
      console.error('Failed to complete job:', error);
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

/**
 * CAPTCHA Detection and Solving
 */
class CaptchaSolver {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = Deno.env.get('CAPTCHA_SOLVER_API_KEY');
  }

  async detectCaptcha(page: Page): Promise<{ found: boolean; type: string; element?: any }> {
    try {
      const captchaSelectors = [
        'iframe[src*="recaptcha"]',
        '.g-recaptcha',
        '.h-captcha',
        'img[src*="captcha"]',
        '[class*="captcha"]',
        '[id*="captcha"]'
      ];

      for (const selector of captchaSelectors) {
        const element = await page.$(selector);
        if (element) {
          console.log(`CAPTCHA detected: ${selector}`);
          return { found: true, type: 'recaptcha', element };
        }
      }

      return { found: false, type: 'none' };
    } catch (error) {
      console.error('CAPTCHA detection failed:', error);
      return { found: false, type: 'none' };
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'scrape';
    
    const jobManager = new DistributedJobManager(supabaseAdmin);
    const captchaSolver = new CaptchaSolver();

    switch (action) {
      case 'scrape': {
        const targetUrl = url.searchParams.get('url');
        const useQueue = url.searchParams.get('queue') === 'true';
        
        if (useQueue) {
          const job = await jobManager.getNextJob('primary');
          
          if (!job) {
            return new Response(JSON.stringify({ 
              message: 'No jobs in queue',
              stats: await jobManager.getJobStats()
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          console.log(`Processing queued job: ${job.id} for ${job.url}`);
          
          try {
            const profile = BrowserFingerprintManager.getProfileByName(job.anti_detection_profile) 
              || BrowserFingerprintManager.getRandomProfile();
            
            const stealthBrowser = new StealthBrowserController(profile);
            await stealthBrowser.initialize();
            
            await stealthBrowser.navigateWithStealth(job.url);
            
            const captchaDetection = await captchaSolver.detectCaptcha(stealthBrowser.page!);
            const html = await stealthBrowser.getPageContent();
            const structuredData = await stealthBrowser.extractStructuredData();
            
            await stealthBrowser.close();
            
            await jobManager.completeJob(job.id, true, { 
              html: html.substring(0, 10000),
              structured_data: structuredData,
              captcha_encountered: captchaDetection.found,
              profile_used: profile.name
            });
            
            return new Response(JSON.stringify({
              job_id: job.id,
              url: job.url,
              html: html.substring(0, 5000) + '...',
              structured_data: structuredData,
              metadata: {
                profile_used: profile.name,
                captcha_encountered: captchaDetection.found,
                content_length: html.length
              },
              stats: await jobManager.getJobStats()
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
            
          } catch (error) {
            console.error('Stealth scraping failed:', error);
            await jobManager.completeJob(job.id, false, null, error.message);
            
            return new Response(JSON.stringify({ 
              error: 'Stealth scraping failed',
              job_id: job.id,
              details: error.message
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
        } else if (targetUrl) {
          const profile = BrowserFingerprintManager.getRandomProfile();
          const stealthBrowser = new StealthBrowserController(profile);
          
          try {
            await stealthBrowser.initialize();
            await stealthBrowser.navigateWithStealth(targetUrl);
            
            const captchaDetection = await captchaSolver.detectCaptcha(stealthBrowser.page!);
            const html = await stealthBrowser.getPageContent();
            const structuredData = await stealthBrowser.extractStructuredData();
            
            await stealthBrowser.close();
            
            return new Response(JSON.stringify({
              url: targetUrl,
              html: html.substring(0, 5000) + '...',
              structured_data: structuredData,
              metadata: {
                profile_used: profile.name,
                captcha_encountered: captchaDetection.found,
                content_length: html.length
              }
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
            
          } catch (error) {
            await stealthBrowser.close();
            return new Response(JSON.stringify({ 
              error: 'Direct scraping failed',
              details: error.message
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        
        return new Response(JSON.stringify({ 
          error: 'No URL provided or invalid request' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'enqueue': {
        const targetUrl = url.searchParams.get('url');
        const priority = url.searchParams.get('priority') as 'low' | 'medium' | 'high' || 'medium';
        
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

      case 'stats': {
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

      default: {
        return new Response(JSON.stringify({ 
          error: 'Invalid action',
          available_actions: ['scrape', 'enqueue', 'stats']
        }), {
          status: 400,
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
