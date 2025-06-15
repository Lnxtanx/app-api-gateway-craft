
/**
 * Level 3: Advanced Browser Automation Stealth
 * Patches browser automation detection and hides webdriver properties
 */
export class Level3BrowserStealth {
  static async applyAdvancedStealth(page: any): Promise<void> {
    console.log('🥷 Applying Level 3 advanced browser stealth...');

    await page.evaluateOnNewDocument(() => {
      // Remove webdriver traces completely
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override automation-related properties
      delete window.navigator.__proto__.webdriver;
      
      // Patch chrome object with realistic properties
      if (!window.chrome) {
        window.chrome = {};
      }
      
      window.chrome.runtime = {
        onConnect: undefined,
        onMessage: undefined,
        sendMessage: () => {},
        connect: () => ({
          onMessage: { addListener: () => {}, removeListener: () => {} },
          postMessage: () => {},
          disconnect: () => {}
        })
      };

      window.chrome.app = {
        isInstalled: false,
        InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
        RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
      };

      window.chrome.csi = () => ({
        onloadT: Date.now(),
        startE: Date.now(),
        tran: Math.floor(Math.random() * 20)
      });

      window.chrome.loadTimes = () => ({
        requestTime: Date.now() / 1000,
        startLoadTime: Date.now() / 1000,
        commitLoadTime: Date.now() / 1000,
        finishDocumentLoadTime: Date.now() / 1000,
        finishLoadTime: Date.now() / 1000,
        firstPaintTime: Date.now() / 1000,
        firstPaintAfterLoadTime: 0,
        navigationType: 'Other',
        wasFetchedViaSpdy: false,
        wasNpnNegotiated: false,
        npnNegotiatedProtocol: 'unknown',
        wasAlternateProtocolAvailable: false,
        connectionInfo: 'http/1.1'
      });

      // Override notification permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Spoof plugin detection
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: null },
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            length: 1,
            name: 'Chrome PDF Plugin'
          },
          {
            0: { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: null },
            description: 'Portable Document Format', 
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            length: 1,
            name: 'Chrome PDF Viewer'
          },
          {
            0: { type: 'application/x-nacl', suffixes: '', description: 'Native Client Executable', enabledPlugin: null },
            1: { type: 'application/x-pnacl', suffixes: '', description: 'Portable Native Client Executable', enabledPlugin: null },
            description: 'Native Client',
            filename: 'ppapi_cpp',
            length: 2,
            name: 'Native Client'
          }
        ],
      });

      // Override Intl.DateTimeFormat for timezone consistency
      const originalDateTimeFormat = Intl.DateTimeFormat;
      Intl.DateTimeFormat = function(...args) {
        if (arguments.length === 0) {
          return new originalDateTimeFormat('en-US', { timeZone: 'America/New_York' });
        }
        return new originalDateTimeFormat(...args);
      };

      // Remove automation traces from Error stack traces
      const originalCaptureStackTrace = Error.captureStackTrace;
      if (originalCaptureStackTrace) {
        Error.captureStackTrace = function(targetObject, constructorOpt) {
          const result = originalCaptureStackTrace.call(this, targetObject, constructorOpt);
          if (targetObject.stack) {
            targetObject.stack = targetObject.stack.replace(/\s+at .*\/puppeteer\/.*$/gm, '');
            targetObject.stack = targetObject.stack.replace(/\s+at .*\/chrome-devtools\/.*$/gm, '');
          }
          return result;
        };
      }

      // Mock realistic battery API
      if ('getBattery' in navigator) {
        const originalGetBattery = navigator.getBattery;
        navigator.getBattery = () => Promise.resolve({
          charging: Math.random() > 0.5,
          chargingTime: Math.random() * 3600,
          dischargingTime: Math.random() * 28800,
          level: 0.5 + Math.random() * 0.5,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        });
      }

      console.log('🥷 Level 3 browser stealth applied successfully');
    });
  }

  static async hideAutomationTraces(page: any): Promise<void> {
    // Hide CDP runtime domain
    await page._client.send('Runtime.addBinding', { name: '__hideSelenium' });
    
    // Override user agent data
    await page.evaluateOnNewDocument(() => {
      if (navigator.userAgentData) {
        Object.defineProperty(navigator, 'userAgentData', {
          get: () => ({
            brands: [
              { brand: 'Not_A Brand', version: '8' },
              { brand: 'Chromium', version: '120' },
              { brand: 'Google Chrome', version: '120' }
            ],
            mobile: false,
            platform: 'Windows'
          }),
        });
      }
    });

    console.log('🔒 Automation traces hidden');
  }
}
