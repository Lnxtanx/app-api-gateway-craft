
export class HeaderManager {
  private static readonly commonHeaders = [
    'Accept',
    'Accept-Language', 
    'Accept-Encoding',
    'Cache-Control',
    'Upgrade-Insecure-Requests',
    'Sec-Fetch-Dest',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'User-Agent'
  ];

  static generateRealisticHeaders(userAgent: string, referer?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Base headers that all browsers send
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
    headers['Accept-Language'] = this.getRandomAcceptLanguage();
    headers['Accept-Encoding'] = 'gzip, deflate, br';
    headers['Cache-Control'] = 'max-age=0';
    headers['Upgrade-Insecure-Requests'] = '1';
    headers['User-Agent'] = userAgent;

    // Add referer if provided
    if (referer) {
      headers['Referer'] = referer;
    }

    // Add security headers for modern browsers
    if (userAgent.includes('Chrome') || userAgent.includes('Edge')) {
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = referer ? 'same-origin' : 'none';
      headers['Sec-Fetch-User'] = '?1';
      headers['Sec-Ch-Ua'] = this.generateSecChUa(userAgent);
      headers['Sec-Ch-Ua-Mobile'] = userAgent.includes('Mobile') ? '?1' : '?0';
      headers['Sec-Ch-Ua-Platform'] = this.getPlatformFromUserAgent(userAgent);
    }

    // Randomize header order to mimic real browsers
    return this.randomizeHeaderOrder(headers);
  }

  private static getRandomAcceptLanguage(): string {
    const languages = [
      'en-US,en;q=0.9',
      'en-GB,en;q=0.9',
      'en-US,en;q=0.9,es;q=0.8',
      'en-US,en;q=0.9,fr;q=0.8',
      'en-US,en;q=0.9,de;q=0.8'
    ];
    return languages[Math.floor(Math.random() * languages.length)];
  }

  private static generateSecChUa(userAgent: string): string {
    if (userAgent.includes('Chrome/120')) {
      return '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    } else if (userAgent.includes('Chrome/119')) {
      return '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"';
    }
    return '"Not_A Brand";v="8", "Chromium";v="120"';
  }

  private static getPlatformFromUserAgent(userAgent: string): string {
    if (userAgent.includes('Windows')) return '"Windows"';
    if (userAgent.includes('Macintosh')) return '"macOS"';
    if (userAgent.includes('Linux')) return '"Linux"';
    if (userAgent.includes('Android')) return '"Android"';
    return '"Unknown"';
  }

  private static randomizeHeaderOrder(headers: Record<string, string>): Record<string, string> {
    const entries = Object.entries(headers);
    const shuffled = entries.sort(() => Math.random() - 0.5);
    return Object.fromEntries(shuffled);
  }

  static addNavigationHeaders(currentUrl: string, previousUrl?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (previousUrl) {
      headers['Referer'] = previousUrl;
    }

    // Add DNT header randomly (some users have it enabled)
    if (Math.random() < 0.3) {
      headers['DNT'] = '1';
    }

    return headers;
  }
}
