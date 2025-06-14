
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import puppeteer, { Browser, Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Level 4: Advanced Stealth Scraping Engine
 * Implements sophisticated anti-detection techniques and distributed architecture
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
 * Advanced Browser Fingerprint Manager
 * Rotates fingerprints to avoid detection
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
}

/**
 * Human Behavior Simulator
 * Mimics human-like interactions to avoid bot detection
 */
class HumanBehaviorSimulator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Simulate human-like mouse movements
  async humanMouseMovement(x: number, y: number): Promise<void> {
    const steps = Math.floor(Math.random() * 20) + 10;
    const currentPosition = await this.page.evaluate(() => ({ x: 0, y: 0 }));
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const easeProgress = this.easeInOutCubic(progress);
      
      const currentX = currentPosition.x + (x - currentPosition.x) * easeProgress;
      const currentY = currentPosition.y + (y - currentPosition.y) * easeProgress;
      
      await this.page.mouse.move(currentX, currentY);
      await this.randomDelay(5, 15);
    }
  }

  // Simulate human-like typing with random delays
  async humanTypeText(selector: string, text: string): Promise<void> {
    await this.page.focus(selector);
    
    for (const char of text) {
      await this.page.keyboard.type(char);
      await this.randomDelay(50, 150); // Human typing speed variation
    }
  }

  // Simulate human-like scrolling patterns
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

  // Simulate random page interactions
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

      // Random link hover (without clicking)
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
      console.log('Random interaction simulation completed with minor errors:', error);
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
 * Advanced Stealth Browser Controller
 * Implements comprehensive anti-detection techniques
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
        '--disable-images', // Speed optimization
        '--disable-javascript', // Can be enabled per page if needed
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

    // Set viewport and device metrics
    await this.page.setViewport({
      width: this.profile.viewport.width,
      height: this.profile.viewport.height,
      deviceScaleFactor: this.profile.deviceScaleFactor,
      isMobile: this.profile.isMobile,
      hasTouch: this.profile.hasTouch,
      isLandscape: this.profile.isLandscape,
    });

    // Override user agent
    await this.page.setUserAgent(this.profile.userAgent);

    // Set language and timezone
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': this.profile.locale,
    });

    // Stealth JavaScript injections
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

      // Override automation detection
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
        // Add slight noise to canvas fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `rgb(${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)})`;
          ctx.fillRect(0, 0, 1, 1);
        }
        return dataURL;
      };
    }, this.profile);

    console.log('Stealth techniques applied successfully');
  }

  async navigateWithStealth(url: string): Promise<void> {
    if (!this.page || !this.humanBehavior) throw new Error('Browser not initialized');

    console.log(`Navigating to ${url} with stealth mode...`);

    // Random delay before navigation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Navigate with random timeout
    const timeout = Math.random() * 10000 + 30000; // 30-40 seconds
    await this.page.goto(url, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: timeout
    });

    // Simulate human-like behavior after page load
    await this.humanBehavior.simulateRandomInteractions();
  }

  async getPageContent(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    return await this.page.content();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

/**
 * Distributed Job Queue Manager
 * Handles job distribution and load balancing across workers
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
      await this.supabase
        .from('scrape_jobs')
        .insert(job);
      
      console.log(`Job enqueued: ${jobId} for URL: ${url}`);
      return jobId;
    } catch (error) {
      console.error('Failed to enqueue job:', error);
      throw error;
    }
  }

  async getNextJob(workerRegion?: string): Promise<ScrapeJob | null> {
    try {
      // Get highest priority job that hasn't been processed
      const { data: jobs, error } = await this.supabase
        .from('scrape_jobs')
        .select('*')
        .is('started_at', null)
        .lte('retry_count', this.supabase.rpc('get_max_retries'))
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) throw error;
      if (!jobs || jobs.length === 0) return null;

      const job = jobs[0];

      // Mark job as started
      await this.supabase
        .from('scrape_jobs')
        .update({ 
          started_at: new Date().toISOString(),
          worker_region: workerRegion 
        })
        .eq('id', job.id);

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
        updateData.retry_count = this.supabase.rpc('increment_retry_count', { job_id: jobId });
      }

      await this.supabase
        .from('scrape_jobs')
        .update(updateData)
        .eq('id', jobId);

      console.log(`Job ${jobId} marked as ${success ? 'completed' : 'failed'}`);
    } catch (error) {
      console.error('Failed to complete job:', error);
    }
  }

  async getJobStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const { data: stats } = await this.supabase
        .rpc('get_job_statistics');
      
      return stats || { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    } catch (error) {
      console.error('Failed to get job stats:', error);
      return { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
    }
  }
}

/**
 * Proxy Rotation Manager
 * Manages residential proxy rotation for IP diversity
 */
class ProxyRotationManager {
  private static proxyList: string[] = [
    // Residential proxy endpoints would be configured here
    // Format: 'http://username:password@proxy-server:port'
  ];

  static getRandomProxy(): string | null {
    if (this.proxyList.length === 0) return null;
    return this.proxyList[Math.floor(Math.random() * this.proxyList.length)];
  }

  static addProxy(proxyUrl: string): void {
    if (!this.proxyList.includes(proxyUrl)) {
      this.proxyList.push(proxyUrl);
    }
  }

  static removeProxy(proxyUrl: string): void {
    const index = this.proxyList.indexOf(proxyUrl);
    if (index > -1) {
      this.proxyList.splice(index, 1);
    }
  }

  static getProxyCount(): number {
    return this.proxyList.length;
  }
}

/**
 * CAPTCHA Solver Integration
 * Integrates with CAPTCHA solving services
 */
class CaptchaSolver {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = Deno.env.get('CAPTCHA_SOLVER_API_KEY');
  }

  async solveCaptcha(captchaImage: string, captchaType: string = 'image'): Promise<string | null> {
    if (!this.apiKey) {
      console.log('CAPTCHA solver API key not configured');
      return null;
    }

    try {
      // Integration with services like 2captcha, AntiCaptcha, etc.
      // This is a placeholder for the actual CAPTCHA solving implementation
      console.log(`Attempting to solve ${captchaType} CAPTCHA...`);
      
      // Simulate CAPTCHA solving delay
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Return mock solution for demo purposes
      return 'SOLVED_CAPTCHA_TEXT';
    } catch (error) {
      console.error('CAPTCHA solving failed:', error);
      return null;
    }
  }

  async detectCaptcha(page: Page): Promise<{ found: boolean; type: string; element?: any }> {
    try {
      // Detect common CAPTCHA patterns
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
        // Get job from queue or process direct request
        const targetUrl = url.searchParams.get('url');
        const useQueue = url.searchParams.get('queue') === 'true';
        
        if (useQueue) {
          // Process jobs from queue
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
            // Get stealth profile for this job
            const profile = BrowserFingerprintManager.getProfileByName(job.anti_detection_profile) 
              || BrowserFingerprintManager.getRandomProfile();
            
            const stealthBrowser = new StealthBrowserController(profile);
            await stealthBrowser.initialize();
            
            // Navigate with stealth techniques
            await stealthBrowser.navigateWithStealth(job.url);
            
            // Check for CAPTCHA
            const captchaDetection = await captchaSolver.detectCaptcha(stealthBrowser.page!);
            if (captchaDetection.found) {
              console.log('CAPTCHA detected, attempting to solve...');
              // CAPTCHA solving would be implemented here
            }
            
            const html = await stealthBrowser.getPageContent();
            await stealthBrowser.close();
            
            // Mark job as completed
            await jobManager.completeJob(job.id, true, { 
              html, 
              captcha_encountered: captchaDetection.found,
              profile_used: profile.name
            });
            
            return new Response(JSON.stringify({
              job_id: job.id,
              url: job.url,
              html: html.substring(0, 5000) + '...', // Truncate for response
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
          // Direct scraping request
          const profile = BrowserFingerprintManager.getRandomProfile();
          const stealthBrowser = new StealthBrowserController(profile);
          
          try {
            await stealthBrowser.initialize();
            await stealthBrowser.navigateWithStealth(targetUrl);
            
            const captchaDetection = await captchaSolver.detectCaptcha(stealthBrowser.page!);
            const html = await stealthBrowser.getPageContent();
            
            await stealthBrowser.close();
            
            return new Response(JSON.stringify({
              url: targetUrl,
              html: html.substring(0, 5000) + '...',
              metadata: {
                profile_used: profile.name,
                captcha_encountered: captchaDetection.found,
                content_length: html.length,
                proxy_count: ProxyRotationManager.getProxyCount()
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
          available_profiles: BrowserFingerprintManager.profiles.length,
          proxy_count: ProxyRotationManager.getProxyCount(),
          captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
          stealth_features: [
            'Browser Fingerprint Rotation',
            'Human Behavior Simulation',
            'Anti-Detection Techniques',
            'Request Pattern Randomization',
            'Distributed Job Processing'
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
    console.error('Level 4 Stealth Scraper Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
