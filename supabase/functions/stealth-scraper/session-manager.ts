/**
 * Level 2: Session Management
 * Handles cookies, CSRF tokens, session timeouts, and authentication flows
 */
export class SessionManager {
  private page: any;
  private cookies: Map<string, any> = new Map();
  private csrfTokens: Map<string, string> = new Map();
  private sessionData: Map<string, any> = new Map();

  constructor(page: any) {
    this.page = page;
  }

  async initializeSession(url: string): Promise<void> {
    console.log('🍪 Initializing Level 2 session management for:', url);
    
    const domain = new URL(url).hostname;
    
    // Set up cookie monitoring
    await this.setupCookieMonitoring();
    
    // Look for existing session data
    await this.loadExistingSession(domain);
    
    // Set up CSRF token detection
    await this.setupCSRFDetection();
    
    console.log('✅ Session management initialized');
  }

  private async setupCookieMonitoring(): Promise<void> {
    // Monitor all cookie changes
    this.page.on('response', async (response: any) => {
      const headers = response.headers();
      const setCookieHeader = headers['set-cookie'];
      
      if (setCookieHeader) {
        await this.processCookies(setCookieHeader, response.url());
      }
    });
  }

  private async processCookies(setCookieHeader: string, url: string): Promise<void> {
    const domain = new URL(url).hostname;
    const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
    
    for (const cookieStr of cookies) {
      const cookieData = this.parseCookie(cookieStr, domain);
      if (cookieData) {
        this.cookies.set(`${domain}:${cookieData.name}`, cookieData);
        console.log(`🍪 Stored cookie: ${cookieData.name} for ${domain}`);
      }
    }
  }

  private parseCookie(cookieStr: string, domain: string): any {
    const parts = cookieStr.split(';').map(part => part.trim());
    const [nameValue] = parts;
    const [name, value] = nameValue.split('=');
    
    if (!name || !value) return null;
    
    const cookie = {
      name: name.trim(),
      value: value.trim(),
      domain,
      httpOnly: parts.some(part => part.toLowerCase() === 'httponly'),
      secure: parts.some(part => part.toLowerCase() === 'secure'),
      sameSite: 'lax',
      expires: Date.now() + (24 * 60 * 60 * 1000), // Default 24 hours
      path: '/'
    };

    // Parse additional attributes
    parts.forEach(part => {
      if (part.toLowerCase().startsWith('expires=')) {
        cookie.expires = new Date(part.substring(8)).getTime();
      } else if (part.toLowerCase().startsWith('max-age=')) {
        const maxAge = parseInt(part.substring(8));
        cookie.expires = Date.now() + (maxAge * 1000);
      } else if (part.toLowerCase().startsWith('path=')) {
        cookie.path = part.substring(5);
      } else if (part.toLowerCase().startsWith('samesite=')) {
        cookie.sameSite = part.substring(9).toLowerCase();
      }
    });

    return cookie;
  }

  private async loadExistingSession(domain: string): Promise<void> {
    // Load cookies for this domain
    const domainCookies = Array.from(this.cookies.entries())
      .filter(([key]) => key.startsWith(`${domain}:`))
      .map(([, cookie]) => cookie)
      .filter(cookie => cookie.expires > Date.now());

    if (domainCookies.length > 0) {
      await this.page.setCookie(...domainCookies);
      console.log(`🍪 Restored ${domainCookies.length} cookies for ${domain}`);
    }
  }

  private async setupCSRFDetection(): Promise<void> {
    await this.page.evaluateOnNewDocument(() => {
      // Intercept form submissions to detect CSRF tokens
      const originalSubmit = HTMLFormElement.prototype.submit;
      HTMLFormElement.prototype.submit = function() {
        const csrfInputs = this.querySelectorAll('input[name*="csrf"], input[name*="token"], input[name*="_token"]');
        csrfInputs.forEach(input => {
          console.log('🛡️ CSRF token detected:', input.name, input.value);
          window.__stealthCSRFTokens = window.__stealthCSRFTokens || {};
          window.__stealthCSRFTokens[input.name] = input.value;
        });
        return originalSubmit.call(this);
      };

      // Monitor meta tags for CSRF tokens
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.tagName === 'META') {
              const name = node.getAttribute('name');
              const content = node.getAttribute('content');
              if (name && content && (name.includes('csrf') || name.includes('token'))) {
                console.log('🛡️ CSRF meta token detected:', name, content);
                window.__stealthCSRFTokens = window.__stealthCSRFTokens || {};
                window.__stealthCSRFTokens[name] = content;
              }
            }
          });
        });
      });

      observer.observe(document.head, { childList: true, subtree: true });
    });
  }

  async extractCSRFTokens(): Promise<void> {
    const tokens = await this.page.evaluate(() => {
      const foundTokens = {};
      
      // Check meta tags
      const metaTags = document.querySelectorAll('meta[name*="csrf"], meta[name*="token"], meta[name*="_token"]');
      metaTags.forEach(meta => {
        const name = meta.getAttribute('name');
        const content = meta.getAttribute('content');
        if (name && content) {
          foundTokens[name] = content;
        }
      });

      // Check form inputs
      const tokenInputs = document.querySelectorAll('input[name*="csrf"], input[name*="token"], input[name*="_token"]');
      tokenInputs.forEach(input => {
        if (input.name && input.value) {
          foundTokens[input.name] = input.value;
        }
      });

      // Check global variables
      if (window.__stealthCSRFTokens) {
        Object.assign(foundTokens, window.__stealthCSRFTokens);
      }

      return foundTokens;
    });

    const domain = new URL(this.page.url()).hostname;
    Object.entries(tokens).forEach(([name, value]) => {
      this.csrfTokens.set(`${domain}:${name}`, value as string);
      console.log(`🛡️ Extracted CSRF token: ${name} for ${domain}`);
    });
  }

  async handleAuthenticationFlow(authConfig?: any): Promise<boolean> {
    if (!authConfig) return true;

    console.log('🔐 Handling authentication flow...');
    
    try {
      // Check if already authenticated
      const isAuthenticated = await this.checkAuthenticationStatus();
      if (isAuthenticated) {
        console.log('✅ Already authenticated');
        return true;
      }

      // Perform authentication
      if (authConfig.type === 'form') {
        return await this.handleFormAuthentication(authConfig);
      } else if (authConfig.type === 'oauth') {
        return await this.handleOAuthAuthentication(authConfig);
      }

      return false;
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
      return false;
    }
  }

  private async checkAuthenticationStatus(): Promise<boolean> {
    // Look for common authentication indicators
    const authIndicators = await this.page.evaluate(() => {
      const indicators = {
        hasLogoutButton: !!document.querySelector('a[href*="logout"], button[onclick*="logout"], .logout'),
        hasUserMenu: !!document.querySelector('.user-menu, .profile-menu, [data-user]'),
        hasAuthCookies: document.cookie.includes('session') || document.cookie.includes('auth') || document.cookie.includes('token'),
        hasAuthLocalStorage: localStorage.getItem('token') || localStorage.getItem('auth') || localStorage.getItem('user')
      };
      
      return indicators;
    });

    return Object.values(authIndicators).some(indicator => indicator);
  }

  private async handleFormAuthentication(authConfig: any): Promise<boolean> {
    console.log('📝 Handling form authentication');
    
    // Find login form
    const loginForm = await this.page.$('form[action*="login"], form[action*="signin"], #login-form, .login-form');
    if (!loginForm) {
      console.log('❌ Login form not found');
      return false;
    }

    // Fill credentials
    const usernameField = await this.page.$('input[name="username"], input[name="email"], input[type="email"]');
    const passwordField = await this.page.$('input[name="password"], input[type="password"]');

    if (usernameField && passwordField && authConfig.username && authConfig.password) {
      await usernameField.type(authConfig.username);
      await passwordField.type(authConfig.password);
      
      // Extract CSRF token before submission
      await this.extractCSRFTokens();
      
      // Submit form
      await loginForm.submit();
      
      // Wait for navigation or auth response
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      
      return await this.checkAuthenticationStatus();
    }

    return false;
  }

  private async handleOAuthAuthentication(authConfig: any): Promise<boolean> {
    console.log('🔗 OAuth authentication not implemented yet');
    return false;
  }

  async maintainSession(): Promise<void> {
    // Keep session alive with periodic activity
    const lastActivity = this.sessionData.get('lastActivity') || 0;
    const now = Date.now();
    
    if (now - lastActivity > 10 * 60 * 1000) { // 10 minutes
      console.log('💓 Maintaining session with heartbeat');
      
      // Perform light activity
      await this.page.evaluate(() => {
        // Touch a non-critical endpoint or perform minimal interaction
        if (window.fetch) {
          fetch('/ping', { method: 'HEAD' }).catch(() => {});
        }
      });
      
      this.sessionData.set('lastActivity', now);
    }
  }

  getSessionSummary(): any {
    const domain = new URL(this.page.url()).hostname;
    const domainCookies = Array.from(this.cookies.entries())
      .filter(([key]) => key.startsWith(`${domain}:`));
    const domainTokens = Array.from(this.csrfTokens.entries())
      .filter(([key]) => key.startsWith(`${domain}:`));

    return {
      domain,
      cookieCount: domainCookies.length,
      csrfTokenCount: domainTokens.length,
      sessionActive: this.sessionData.has('lastActivity'),
      lastActivity: this.sessionData.get('lastActivity')
    };
  }
}
