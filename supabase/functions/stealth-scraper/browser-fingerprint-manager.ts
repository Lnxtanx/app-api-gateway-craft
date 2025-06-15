
import { StealthProfile } from './types.ts';

/**
 * Enhanced Browser Fingerprint Manager
 */
export class BrowserFingerprintManager {
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
