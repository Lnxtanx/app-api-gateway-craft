
/**
 * Level 2: Browser Fingerprint Masking
 * Randomizes screen resolution, timezone, canvas fingerprinting, WebGL, audio fingerprints
 */
export class Level2FingerprintMasker {
  static generateRandomFingerprint() {
    const commonResolutions = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 },
      { width: 1600, height: 900 },
      { width: 2560, height: 1440 },
      { width: 1024, height: 768 }
    ];

    const timezones = [
      'America/New_York',
      'America/Los_Angeles', 
      'America/Chicago',
      'America/Denver',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Australia/Sydney'
    ];

    const languages = [
      'en-US,en;q=0.9',
      'en-GB,en;q=0.9',
      'en-US,en;q=0.9,es;q=0.8',
      'en-US,en;q=0.9,fr;q=0.8',
      'en-CA,en;q=0.9,fr;q=0.8'
    ];

    const colorDepths = [24, 32];
    const deviceMemories = [4, 8, 16];
    const hardwareConcurrencies = [2, 4, 8, 12, 16];

    return {
      resolution: commonResolutions[Math.floor(Math.random() * commonResolutions.length)],
      colorDepth: colorDepths[Math.floor(Math.random() * colorDepths.length)],
      timezone: timezones[Math.floor(Math.random() * timezones.length)],
      language: languages[Math.floor(Math.random() * languages.length)],
      deviceMemory: deviceMemories[Math.floor(Math.random() * deviceMemories.length)],
      hardwareConcurrency: hardwareConcurrencies[Math.floor(Math.random() * hardwareConcurrencies.length)],
      canvasFingerprint: this.generateCanvasFingerprint(),
      webglFingerprint: this.generateWebGLFingerprint(),
      audioFingerprint: this.generateAudioFingerprint()
    };
  }

  static generateCanvasFingerprint(): string {
    const texts = [
      'BrowserLeaks,com <canvas> 1.0',
      'Cwm fjordbank glyphs vext quiz',
      'Hello World Canvas Test 123',
      'Quick brown fox jumps over'
    ];
    
    const fonts = ['Arial', 'Times New Roman', 'Helvetica', 'Georgia'];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    
    return `${text}_${font}_${Math.random().toString(36).substring(7)}`;
  }

  static generateWebGLFingerprint(): string {
    const vendors = [
      'Google Inc. (Intel)',
      'Google Inc. (NVIDIA)',
      'Google Inc. (AMD)',
      'WebKit'
    ];
    
    const renderers = [
      'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
      'ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0)',
      'ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0)',
      'WebKit WebGL'
    ];

    return `${vendors[Math.floor(Math.random() * vendors.length)]}_${renderers[Math.floor(Math.random() * renderers.length)]}`;
  }

  static generateAudioFingerprint(): string {
    const sampleRates = [44100, 48000, 96000];
    const channels = [2, 6, 8];
    
    return `${sampleRates[Math.floor(Math.random() * sampleRates.length)]}_${channels[Math.floor(Math.random() * channels.length)]}_${Math.random().toString(36).substring(7)}`;
  }

  static async applyFingerprintMasking(page: any, fingerprint: any): Promise<void> {
    console.log('🎭 Applying Level 2 fingerprint masking...');

    await page.evaluateOnNewDocument((fp) => {
      // Override screen properties
      Object.defineProperty(screen, 'width', {
        get: () => fp.resolution.width,
      });
      Object.defineProperty(screen, 'height', {
        get: () => fp.resolution.height,
      });
      Object.defineProperty(screen, 'availWidth', {
        get: () => fp.resolution.width,
      });
      Object.defineProperty(screen, 'availHeight', {
        get: () => fp.resolution.height - 40, // Account for taskbar
      });
      Object.defineProperty(screen, 'colorDepth', {
        get: () => fp.colorDepth,
      });
      Object.defineProperty(screen, 'pixelDepth', {
        get: () => fp.colorDepth,
      });

      // Override navigator properties
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => fp.deviceMemory,
      });
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => fp.hardwareConcurrency,
      });
      Object.defineProperty(navigator, 'language', {
        get: () => fp.language.split(',')[0],
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => fp.language.split(',').map(l => l.split(';')[0].trim()),
      });

      // Override timezone
      const originalDateTimeFormat = Intl.DateTimeFormat;
      Intl.DateTimeFormat = function(...args) {
        if (args.length === 0 || (args[0] === undefined && args[1] === undefined)) {
          args[1] = { timeZone: fp.timezone };
        } else if (args[1] === undefined) {
          args[1] = { timeZone: fp.timezone };
        } else if (typeof args[1] === 'object' && !args[1].timeZone) {
          args[1].timeZone = fp.timezone;
        }
        return new originalDateTimeFormat(...args);
      };

      // Override canvas fingerprinting
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        const result = originalToDataURL.apply(this, args);
        // Add slight noise to canvas fingerprint
        return result + fp.canvasFingerprint.slice(-10);
      };

      // Override WebGL fingerprinting
      const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
          return fp.webglFingerprint.split('_')[0];
        }
        if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
          return fp.webglFingerprint.split('_')[1];
        }
        return originalGetParameter.call(this, parameter);
      };

      // Override audio context fingerprinting
      const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
      AudioContext.prototype.createAnalyser = function() {
        const analyser = originalCreateAnalyser.call(this);
        const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
        analyser.getFloatFrequencyData = function(array) {
          const result = originalGetFloatFrequencyData.call(this, array);
          // Add slight noise based on audio fingerprint
          for (let i = 0; i < array.length; i++) {
            array[i] += (Math.random() - 0.5) * 0.0001;
          }
          return result;
        };
        return analyser;
      };

      console.log('🎭 Level 2 fingerprint masking applied:', {
        resolution: `${fp.resolution.width}x${fp.resolution.height}`,
        colorDepth: fp.colorDepth,
        timezone: fp.timezone,
        deviceMemory: fp.deviceMemory,
        hardwareConcurrency: fp.hardwareConcurrency
      });

    }, fingerprint);
  }
}
