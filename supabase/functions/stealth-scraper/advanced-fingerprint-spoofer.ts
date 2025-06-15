
/**
 * Level 3: Advanced Fingerprint Spoofing
 * Hardware fingerprint randomization and WebRTC leak prevention
 */
export class AdvancedFingerprintSpoofer {
  static generateAdvancedFingerprint(): any {
    const hardware = this.generateHardwareFingerprint();
    const fonts = this.generateFontFingerprint();
    const plugins = this.generatePluginFingerprint();
    const webrtc = this.generateWebRTCFingerprint();

    return {
      hardware,
      fonts,
      plugins,
      webrtc,
      timestamp: Date.now()
    };
  }

  private static generateHardwareFingerprint(): any {
    const cpuClasses = ['x86', 'x64', 'arm', 'arm64'];
    const platforms = ['Win32', 'MacIntel', 'Linux x86_64', 'Linux armv7l'];
    const concurrencies = [2, 4, 6, 8, 12, 16];
    const memories = [2, 4, 6, 8, 16, 32];

    return {
      cpuClass: cpuClasses[Math.floor(Math.random() * cpuClasses.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      hardwareConcurrency: concurrencies[Math.floor(Math.random() * concurrencies.length)],
      deviceMemory: memories[Math.floor(Math.random() * memories.length)],
      maxTouchPoints: Math.floor(Math.random() * 10),
      oscpu: platforms[Math.floor(Math.random() * platforms.length)]
    };
  }

  private static generateFontFingerprint(): string[] {
    const baseFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact'
    ];

    const optionalFonts = [
      'Calibri', 'Cambria', 'Consolas', 'Constantia', 'Corbel',
      'Candara', 'Franklin Gothic Medium', 'Lucida Console',
      'Lucida Sans Unicode', 'MS Sans Serif', 'MS Serif',
      'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Trebuchet MS'
    ];

    // Randomly include optional fonts to create variance
    const fonts = [...baseFonts];
    optionalFonts.forEach(font => {
      if (Math.random() > 0.3) { // 70% chance to include each optional font
        fonts.push(font);
      }
    });

    return fonts.sort();
  }

  private static generatePluginFingerprint(): any[] {
    const plugins = [
      {
        name: 'Chrome PDF Plugin',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format'
      },
      {
        name: 'Chrome PDF Viewer',
        filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
        description: 'Portable Document Format'
      },
      {
        name: 'Native Client',
        filename: 'ppapi_cpp',
        description: 'Native Client'
      }
    ];

    // Randomly add more plugins
    const optionalPlugins = [
      {
        name: 'Widevine Content Decryption Module',
        filename: 'widevinecdmadapter.dll',
        description: 'Enables Widevine licenses for playback of HTML audio/video content.'
      },
      {
        name: 'Microsoft Office',
        filename: 'npoffice.dll',
        description: 'Office Plugin for Netscape Navigator'
      }
    ];

    optionalPlugins.forEach(plugin => {
      if (Math.random() > 0.4) {
        plugins.push(plugin);
      }
    });

    return plugins;
  }

  private static generateWebRTCFingerprint(): any {
    return {
      localIP: this.generateLocalIP(),
      stunServers: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302'
      ],
      preventLeaks: true
    };
  }

  private static generateLocalIP(): string {
    const ranges = [
      '192.168.',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.'
    ];
    
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    
    if (range.startsWith('192.168.')) {
      return `${range}${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    } else if (range.startsWith('10.')) {
      return `${range}${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    } else {
      return `${range}${Math.floor(Math.random() * 16)}.${Math.floor(Math.random() * 256)}`;
    }
  }

  static async applyAdvancedFingerprinting(page: any, fingerprint: any): Promise<void> {
    console.log('🔧 Applying Level 3 advanced fingerprint spoofing...');

    await page.evaluateOnNewDocument((fp) => {
      // Hardware spoofing
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => fp.hardware.hardwareConcurrency,
      });

      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => fp.hardware.deviceMemory,
      });

      Object.defineProperty(navigator, 'platform', {
        get: () => fp.hardware.platform,
      });

      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => fp.hardware.maxTouchPoints,
      });

      // Font spoofing
      const originalFontCheck = document.createElement;
      document.createElement = function(tagName) {
        const element = originalFontCheck.call(document, tagName);
        if (tagName.toLowerCase() === 'canvas') {
          const originalGetContext = element.getContext;
          element.getContext = function(contextType) {
            const context = originalGetContext.call(element, contextType);
            if (contextType === '2d') {
              const originalMeasureText = context.measureText;
              context.measureText = function(text) {
                const result = originalMeasureText.call(context, text);
                // Add slight variations to font measurements
                const variance = 0.1 + Math.random() * 0.1;
                return {
                  ...result,
                  width: result.width * variance
                };
              };
            }
            return context;
          };
        }
        return element;
      };

      // Plugin spoofing
      Object.defineProperty(navigator, 'plugins', {
        get: () => fp.plugins.map((plugin, index) => ({
          ...plugin,
          length: 1,
          [0]: { type: 'application/pdf', suffixes: 'pdf', description: plugin.description }
        }))
      });

      // WebRTC leak prevention
      const originalRTCPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(configuration) {
        if (configuration && configuration.iceServers) {
          configuration.iceServers = fp.webrtc.stunServers.map(server => ({ urls: server }));
        }
        return new originalRTCPeerConnection(configuration);
      };

      // Override getUserMedia to prevent camera/microphone detection
      const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
      if (originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          console.log('🚫 getUserMedia blocked for fingerprint protection');
          return Promise.reject(new Error('Permission denied'));
        };
      }

      console.log('🔧 Advanced fingerprint spoofing applied:', {
        hardware: fp.hardware.platform,
        concurrency: fp.hardware.hardwareConcurrency,
        memory: fp.hardware.deviceMemory,
        fontsCount: fp.fonts.length,
        pluginsCount: fp.plugins.length
      });

    }, fingerprint);
  }
}
