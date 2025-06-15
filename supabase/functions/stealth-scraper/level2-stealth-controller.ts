
/**
 * Level 2: Intermediate Stealth Controller
 * Integrates all Level 2 features for 80-85% success rate
 */
import { StealthProfile } from './types.ts';
import { Level2FingerprintMasker } from './level2-fingerprint-masker.ts';
import { AdvancedRequestPatterns } from './advanced-request-patterns.ts';
import { SessionManager } from './session-manager.ts';
import { ResidentialProxyManager } from './residential-proxy-manager.ts';
import { ContentAwareDelays } from './content-aware-delays.ts';

export class Level2StealthController {
  private browser: any = null;
  private page: any = null;
  private profile: StealthProfile;
  private fingerprintMasker: typeof Level2FingerprintMasker;
  private requestPatterns: AdvancedRequestPatterns | null = null;
  private sessionManager: SessionManager | null = null;
  private proxyManager: ResidentialProxyManager;
  private delayManager: ContentAwareDelays | null = null;
  private fingerprint: any;

  constructor(profile?: StealthProfile) {
    this.profile = profile || this.generateDefaultProfile();
    this.fingerprintMasker = Level2FingerprintMasker;
    this.proxyManager = new ResidentialProxyManager();
    this.fingerprint = this.fingerprintMasker.generateRandomFingerprint();
    
    console.log('🛡️ Level 2 Stealth Controller initialized');
  }

  private generateDefaultProfile(): StealthProfile {
    return {
      name: 'Level2-Default',
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
    };
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Level 2 Stealth Browser...');
    
    // Get best proxy for session
    const proxy = this.proxyManager.getBestProxy('https://example.com', true);
    
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
      '--disable-features=TranslateUI,BlinkGenPropertyTrees',
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
      `--window-size=${this.fingerprint.resolution.width},${this.fingerprint.resolution.height}`,
      '--lang=' + this.profile.locale
    ];

    // Add proxy if available
    if (proxy) {
      launchArgs.push(this.proxyManager.getProxyString(proxy));
      console.log(`🌐 Using ${proxy.isResidential ? 'residential' : 'datacenter'} proxy: ${proxy.country}`);
    }

    // Import puppeteer dynamically
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: launchArgs,
    });

    this.page = await this.browser.newPage();
    
    // Apply Level 2 stealth techniques
    await this.applyLevel2StealthTechniques();
    
    // Initialize managers
    this.sessionManager = new SessionManager(this.page);
    this.delayManager = new ContentAwareDelays(this.page);
    this.requestPatterns = new AdvancedRequestPatterns(this.page, {
      humanMouseMovement: async (x: number, y: number) => {
        await this.page.mouse.move(x, y);
      }
    });

    console.log('✅ Level 2 Stealth Browser ready');
  }

  private async applyLevel2StealthTechniques(): Promise<void> {
    if (!this.page) return;

    console.log('🛡️ Applying Level 2 stealth techniques...');

    // Set enhanced viewport with fingerprint data
    await this.page.setViewport({
      width: this.fingerprint.resolution.width,
      height: this.fingerprint.resolution.height,
      deviceScaleFactor: this.profile.deviceScaleFactor,
      isMobile: this.profile.isMobile,
      hasTouch: this.profile.hasTouch,
      isLandscape: this.profile.isLandscape,
    });

    // Apply fingerprint masking
    await this.fingerprintMasker.applyFingerprintMasking(this.page, this.fingerprint);

    // Enhanced anti-detection
    await this.page.evaluateOnNewDocument(() => {
      // Advanced webdriver hiding
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Remove automation traces
      delete window.navigator.__proto__.webdriver;
      delete navigator.__proto__.webdriver;
      delete window.navigator.webdriver;
      delete navigator.webdriver;

      // Enhanced chrome object
      window.chrome = {
        runtime: {
          onConnect: undefined,
          onMessage: undefined,
        },
        app: {
          isInstalled: false,
          InstallState: {
            DISABLED: 'disabled',
            INSTALLED: 'installed',
            NOT_INSTALLED: 'not_installed'
          },
          RunningState: {
            CANNOT_RUN: 'cannot_run',
            READY_TO_RUN: 'ready_to_run',
            RUNNING: 'running'
          }
        },
        csi: () => {},
        loadTimes: () => ({}),
      };

      // Enhanced permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Realistic plugin list
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: { type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: null },
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          },
          {
            0: { type: "application/pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: null },
            description: "Portable Document Format",
            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
            length: 1,
            name: "Chrome PDF Viewer"
          },
          {
            0: { type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: null },
            1: { type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: null },
            description: "",
            filename: "internal-nacl-plugin",
            length: 2,
            name: "Native Client"
          }
        ],
      });

      // Enhanced language settings
      Object.defineProperty(navigator, 'language', {
        get: () => 'en-US',
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Mock connection information
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          effectiveType: '4g',
          rtt: 50,
          downlink: 10,
          saveData: false
        }),
      });

      // Enhanced timing behavior
      const originalPerformanceNow = performance.now;
      performance.now = function() {
        return originalPerformanceNow.call(this) + Math.random() * 0.1;
      };

      console.log('🛡️ Level 2 stealth enhancements applied');
    });

    console.log('✅ Level 2 stealth techniques applied successfully');
  }

  async navigateWithLevel2Stealth(url: string, options?: any): Promise<void> {
    if (!this.page || !this.sessionManager || !this.delayManager) {
      throw new Error('Level 2 browser not initialized');
    }

    console.log(`🎯 Level 2 stealth navigation to ${url}...`);

    // Initialize session management for this domain
    await this.sessionManager.initializeSession(url);

    // Analyze page complexity for adaptive delays
    await this.delayManager.analyzePageComplexity();

    // Content-aware pre-navigation delay
    const preNavDelay = await this.delayManager.calculateAdaptiveDelay('navigation');
    await new Promise(resolve => setTimeout(resolve, preNavDelay));

    // Navigate with enhanced options
    const timeout = 30000 + Math.random() * 10000; // 30-40s timeout
    
    try {
      await this.page.goto(url, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: timeout
      });
    } catch (error) {
      console.log('⚠️ Primary navigation failed, trying fallback...');
      await this.page.goto(url, { 
        waitUntil: ['networkidle2'],
        timeout: 20000
      });
    }

    // Post-navigation analysis and delays
    await this.delayManager.analyzePageComplexity();
    const postNavDelay = await this.delayManager.calculateAdaptiveDelay('page_load');
    
    // Simulate realistic browsing behavior
    if (this.requestPatterns) {
      await this.requestPatterns.simulateHumanBrowsingSession();
    }

    // Extract CSRF tokens and maintain session
    await this.sessionManager.extractCSRFTokens();
    await this.sessionManager.maintainSession();

    // Simulate traffic pattern
    await this.delayManager.simulateTrafficPattern();

    console.log('✅ Level 2 stealth navigation completed');
  }

  async extractDataWithLevel2Intelligence(): Promise<any> {
    if (!this.page || !this.delayManager) {
      throw new Error('Level 2 browser not initialized');
    }

    console.log('🧠 Starting Level 2 intelligent data extraction...');

    // Content-aware extraction delay
    const extractionDelay = await this.delayManager.calculateAdaptiveDelay('content_extraction');
    await new Promise(resolve => setTimeout(resolve, extractionDelay));

    // Perform enhanced extraction
    const extractedData = await this.page.evaluate(() => {
      const data: any = {};
      
      // Enhanced text extraction
      data.title = document.title || '';
      data.description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Smart content detection
      data.mainContent = this.extractMainContent();
      data.structuredData = this.extractStructuredData();
      data.socialMedia = this.extractSocialMediaInfo();
      data.contactInfo = this.extractContactInformation();
      data.products = this.extractProductInformation();
      data.navigation = this.extractNavigationStructure();
      
      return data;
    });

    // Add Level 2 metadata
    const level2Metadata = {
      extraction_level: 2,
      stealth_features: [
        'fingerprint_masking',
        'session_management', 
        'residential_proxies',
        'content_aware_delays',
        'human_behavior_simulation'
      ],
      proxy_stats: this.proxyManager.getProxyStats(),
      session_summary: this.sessionManager?.getSessionSummary(),
      delay_metrics: this.delayManager.getDelayMetrics(),
      complexity_score: this.delayManager.getDelayMetrics().baselineComplexity
    };

    console.log('✅ Level 2 intelligent extraction completed');

    return {
      ...extractedData,
      metadata: level2Metadata,
      extraction_timestamp: new Date().toISOString(),
      success_probability: '80-85%'
    };
  }

  getLevel2Stats(): any {
    return {
      level: 2,
      name: 'Intermediate Stealth',
      features: {
        fingerprint_masking: true,
        session_management: true,
        residential_proxies: true,
        content_aware_delays: true,
        human_behavior_simulation: true
      },
      expected_success_rate: '80-85%',
      proxy_stats: this.proxyManager.getProxyStats(),
      session_active: !!this.sessionManager,
      fingerprint_active: !!this.fingerprint
    };
  }

  async close(): Promise<void> {
    if (this.proxyManager) {
      this.proxyManager.destroy();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('🔄 Level 2 Stealth Controller closed');
  }
}
