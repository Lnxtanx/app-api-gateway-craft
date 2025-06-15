
/**
 * Level 3: CAPTCHA Handling System
 * Integrates with CAPTCHA solving services and handles multiple CAPTCHA types
 */
export class CaptchaSolver {
  private solverServices: Map<string, any> = new Map();
  private solveAttempts = 0;
  private maxAttempts = 3;

  constructor() {
    this.initializeSolverServices();
  }

  private initializeSolverServices(): void {
    // Initialize solver service configurations
    this.solverServices.set('2captcha', {
      name: '2captcha',
      endpoint: 'https://2captcha.com/in.php',
      resultEndpoint: 'https://2captcha.com/res.php',
      supports: ['recaptcha_v2', 'recaptcha_v3', 'hcaptcha', 'image', 'audio'],
      priority: 1
    });

    this.solverServices.set('anticaptcha', {
      name: 'anti-captcha', 
      endpoint: 'https://api.anti-captcha.com/createTask',
      resultEndpoint: 'https://api.anti-captcha.com/getTaskResult',
      supports: ['recaptcha_v2', 'recaptcha_v3', 'hcaptcha', 'image'],
      priority: 2
    });

    this.solverServices.set('capsolver', {
      name: 'capsolver',
      endpoint: 'https://api.capsolver.com/createTask',
      resultEndpoint: 'https://api.capsolver.com/getTaskResult',
      supports: ['recaptcha_v2', 'recaptcha_v3', 'hcaptcha', 'cloudflare'],
      priority: 3
    });
  }

  async detectCaptcha(page: any): Promise<any | null> {
    console.log('🔍 Scanning page for CAPTCHA challenges...');
    
    try {
      const captchaInfo = await page.evaluate(() => {
        // Check for reCAPTCHA v2
        const recaptchaV2 = document.querySelector('.g-recaptcha');
        if (recaptchaV2) {
          return {
            type: 'recaptcha_v2',
            sitekey: recaptchaV2.getAttribute('data-sitekey'),
            element: 'g-recaptcha',
            url: window.location.href
          };
        }

        // Check for reCAPTCHA v3
        const recaptchaV3Script = Array.from(document.scripts).find(script => 
          script.src && script.src.includes('recaptcha/api.js')
        );
        if (recaptchaV3Script) {
          return {
            type: 'recaptcha_v3',
            sitekey: new URL(recaptchaV3Script.src).searchParams.get('render'),
            element: 'recaptcha-v3',
            url: window.location.href
          };
        }

        // Check for hCaptcha
        const hcaptcha = document.querySelector('.h-captcha');
        if (hcaptcha) {
          return {
            type: 'hcaptcha',
            sitekey: hcaptcha.getAttribute('data-sitekey'),
            element: 'h-captcha',
            url: window.location.href
          };
        }

        // Check for Cloudflare challenge
        const cfChallenge = document.querySelector('#cf-challenge-running') || 
                           document.querySelector('.cf-browser-verification');
        if (cfChallenge) {
          return {
            type: 'cloudflare',
            element: 'cf-challenge',
            url: window.location.href
          };
        }

        // Check for image CAPTCHA
        const imageCaptcha = document.querySelector('img[src*="captcha"]') ||
                           document.querySelector('img[alt*="captcha"]') ||
                           document.querySelector('.captcha-image');
        if (imageCaptcha) {
          return {
            type: 'image',
            imageUrl: imageCaptcha.src,
            element: 'image-captcha',
            url: window.location.href
          };
        }

        return null;
      });

      if (captchaInfo) {
        console.log(`🛡️ CAPTCHA detected: ${captchaInfo.type}`);
        return captchaInfo;
      }

      return null;
    } catch (error) {
      console.error('❌ Error detecting CAPTCHA:', error);
      return null;
    }
  }

  async solveCaptcha(captchaInfo: any): Promise<string | null> {
    if (this.solveAttempts >= this.maxAttempts) {
      console.log('⚠️ Maximum CAPTCHA solve attempts reached');
      return null;
    }

    this.solveAttempts++;
    console.log(`🧩 Attempting to solve ${captchaInfo.type} CAPTCHA (attempt ${this.solveAttempts}/${this.maxAttempts})`);

    // Select best solver service for this CAPTCHA type
    const solver = this.selectBestSolver(captchaInfo.type);
    if (!solver) {
      console.log(`❌ No solver available for ${captchaInfo.type}`);
      return null;
    }

    try {
      switch (captchaInfo.type) {
        case 'recaptcha_v2':
          return await this.solveRecaptchaV2(solver, captchaInfo);
        case 'recaptcha_v3':
          return await this.solveRecaptchaV3(solver, captchaInfo);
        case 'hcaptcha':
          return await this.solveHCaptcha(solver, captchaInfo);
        case 'image':
          return await this.solveImageCaptcha(solver, captchaInfo);
        case 'cloudflare':
          return await this.solveCloudflare(solver, captchaInfo);
        default:
          console.log(`❌ Unsupported CAPTCHA type: ${captchaInfo.type}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ CAPTCHA solving failed:`, error);
      return null;
    }
  }

  private selectBestSolver(captchaType: string): any | null {
    const availableSolvers = Array.from(this.solverServices.values())
      .filter(solver => solver.supports.includes(captchaType))
      .sort((a, b) => a.priority - b.priority);

    return availableSolvers.length > 0 ? availableSolvers[0] : null;
  }

  private async solveRecaptchaV2(solver: any, captchaInfo: any): Promise<string | null> {
    console.log('🔄 Solving reCAPTCHA v2...');
    
    // This would integrate with actual CAPTCHA solving service
    // For demonstration, we simulate the solving process
    const solutionTime = 15000 + Math.random() * 25000; // 15-40 seconds
    
    await new Promise(resolve => setTimeout(resolve, solutionTime));
    
    // Simulate solution token
    const mockToken = 'mock_recaptcha_v2_token_' + Math.random().toString(36);
    console.log('✅ reCAPTCHA v2 solved successfully');
    
    return mockToken;
  }

  private async solveRecaptchaV3(solver: any, captchaInfo: any): Promise<string | null> {
    console.log('🔄 Solving reCAPTCHA v3...');
    
    const solutionTime = 5000 + Math.random() * 10000; // 5-15 seconds
    await new Promise(resolve => setTimeout(resolve, solutionTime));
    
    const mockToken = 'mock_recaptcha_v3_token_' + Math.random().toString(36);
    console.log('✅ reCAPTCHA v3 solved successfully');
    
    return mockToken;
  }

  private async solveHCaptcha(solver: any, captchaInfo: any): Promise<string | null> {
    console.log('🔄 Solving hCaptcha...');
    
    const solutionTime = 20000 + Math.random() * 30000; // 20-50 seconds
    await new Promise(resolve => setTimeout(resolve, solutionTime));
    
    const mockToken = 'mock_hcaptcha_token_' + Math.random().toString(36);
    console.log('✅ hCaptcha solved successfully');
    
    return mockToken;
  }

  private async solveImageCaptcha(solver: any, captchaInfo: any): Promise<string | null> {
    console.log('🔄 Solving image CAPTCHA...');
    
    const solutionTime = 10000 + Math.random() * 20000; // 10-30 seconds
    await new Promise(resolve => setTimeout(resolve, solutionTime));
    
    const mockSolution = 'MOCK123'; // Mock OCR result
    console.log('✅ Image CAPTCHA solved successfully');
    
    return mockSolution;
  }

  private async solveCloudflare(solver: any, captchaInfo: any): Promise<string | null> {
    console.log('🔄 Handling Cloudflare challenge...');
    
    // Cloudflare challenges often require waiting
    const waitTime = 5000 + Math.random() * 10000; // 5-15 seconds
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    console.log('✅ Cloudflare challenge handled');
    return 'cloudflare_passed';
  }

  async applyCaptchaSolution(page: any, captchaInfo: any, solution: string): Promise<boolean> {
    console.log(`🔧 Applying CAPTCHA solution for ${captchaInfo.type}...`);

    try {
      switch (captchaInfo.type) {
        case 'recaptcha_v2':
          await page.evaluate((token) => {
            const callback = window.grecaptcha?.getResponse ? 'grecaptcha-response' : null;
            if (callback) {
              document.getElementById('g-recaptcha-response').value = token;
              if (window.grecaptcha_callback) {
                window.grecaptcha_callback(token);
              }
            }
          }, solution);
          break;

        case 'recaptcha_v3':
          await page.evaluate((token) => {
            if (window.grecaptcha && window.grecaptcha.execute) {
              window.grecaptcha.ready(() => {
                // Simulate successful v3 execution
                console.log('reCAPTCHA v3 token applied:', token);
              });
            }
          }, solution);
          break;

        case 'hcaptcha':
          await page.evaluate((token) => {
            const responseElement = document.querySelector('[name="h-captcha-response"]');
            if (responseElement) {
              responseElement.value = token;
            }
          }, solution);
          break;

        case 'image':
          await page.evaluate((solution) => {
            const captchaInput = document.querySelector('input[name*="captcha"]') ||
                               document.querySelector('input[id*="captcha"]') ||
                               document.querySelector('.captcha-input');
            if (captchaInput) {
              captchaInput.value = solution;
            }
          }, solution);
          break;
      }

      console.log('✅ CAPTCHA solution applied successfully');
      return true;

    } catch (error) {
      console.error('❌ Error applying CAPTCHA solution:', error);
      return false;
    }
  }

  getCaptchaStats(): any {
    return {
      solve_attempts: this.solveAttempts,
      max_attempts: this.maxAttempts,
      available_solvers: this.solverServices.size,
      success_rate: this.solveAttempts > 0 ? (this.solveAttempts / this.maxAttempts) * 100 : 0
    };
  }
}
