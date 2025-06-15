
/**
 * Level 2: Content-Aware Delays
 * Adaptive timing based on page complexity, load times, and traffic patterns
 */
export class ContentAwareDelays {
  private page: any;
  private baselineMetrics: any = {};
  
  constructor(page: any) {
    this.page = page;
  }

  async analyzePageComplexity(): Promise<any> {
    console.log('🧠 Analyzing page complexity for adaptive delays...');
    
    const metrics = await this.page.evaluate(() => {
      const startTime = performance.now();
      
      // Content analysis
      const textContent = document.body.textContent || '';
      const wordCount = textContent.replace(/\s+/g, ' ').trim().split(' ').length;
      const paragraphCount = document.querySelectorAll('p').length;
      
      // Media analysis
      const imageCount = document.querySelectorAll('img').length;
      const videoCount = document.querySelectorAll('video').length;
      const audioCount = document.querySelectorAll('audio').length;
      
      // Interactive elements
      const buttonCount = document.querySelectorAll('button, input[type="button"], input[type="submit"]').length;
      const linkCount = document.querySelectorAll('a[href]').length;
      const formCount = document.querySelectorAll('form').length;
      const inputCount = document.querySelectorAll('input, select, textarea').length;
      
      // Layout complexity
      const divCount = document.querySelectorAll('div').length;
      const sectionCount = document.querySelectorAll('section, article, aside, nav').length;
      const maxNestingLevel = this.calculateMaxNestingLevel();
      
      // JavaScript activity
      const scriptCount = document.querySelectorAll('script').length;
      const hasReact = !!(window.React || document.querySelector('[data-reactroot]'));
      const hasAngular = !!(window.angular || document.querySelector('[ng-app], [ng-controller]'));
      const hasVue = !!(window.Vue || document.querySelector('[data-v-]'));
      
      // Performance metrics
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = perfData ? perfData.loadEventEnd - perfData.fetchStart : 0;
      const domContentLoaded = perfData ? perfData.domContentLoadedEventEnd - perfData.fetchStart : 0;
      
      // Calculate complexity score
      const complexity = this.calculateComplexityScore({
        wordCount,
        paragraphCount,
        imageCount,
        videoCount,
        audioCount,
        buttonCount,
        linkCount,
        formCount,
        inputCount,
        divCount,
        sectionCount,
        maxNestingLevel,
        scriptCount,
        hasReact,
        hasAngular,
        hasVue,
        loadTime,
        domContentLoaded
      });
      
      return {
        content: { wordCount, paragraphCount },
        media: { imageCount, videoCount, audioCount },
        interactive: { buttonCount, linkCount, formCount, inputCount },
        layout: { divCount, sectionCount, maxNestingLevel },
        javascript: { scriptCount, hasReact, hasAngular, hasVue },
        performance: { loadTime, domContentLoaded },
        complexity,
        analysisTime: performance.now() - startTime
      };
    });

    this.baselineMetrics = metrics;
    console.log(`📊 Page complexity analyzed: ${metrics.complexity.toFixed(2)}/100`);
    
    return metrics;
  }

  private async calculateMaxNestingLevel(): Promise<number> {
    return await this.page.evaluate(() => {
      let maxLevel = 0;
      
      function traverse(element: Element, level = 0): void {
        maxLevel = Math.max(maxLevel, level);
        for (const child of element.children) {
          traverse(child, level + 1);
        }
      }
      
      if (document.body) {
        traverse(document.body);
      }
      
      return maxLevel;
    });
  }

  private calculateComplexityScore(metrics: any): number {
    let score = 0;
    
    // Content complexity (0-20 points)
    score += Math.min(20, (metrics.wordCount / 2000) * 20);
    score += Math.min(5, (metrics.paragraphCount / 20) * 5);
    
    // Media complexity (0-15 points)
    score += Math.min(10, metrics.imageCount);
    score += Math.min(3, metrics.videoCount * 3);
    score += Math.min(2, metrics.audioCount * 2);
    
    // Interactive complexity (0-20 points)
    score += Math.min(10, metrics.buttonCount);
    score += Math.min(5, (metrics.linkCount / 20) * 5);
    score += Math.min(3, metrics.formCount * 3);
    score += Math.min(2, (metrics.inputCount / 10) * 2);
    
    // Layout complexity (0-15 points)
    score += Math.min(10, (metrics.divCount / 100) * 10);
    score += Math.min(3, (metrics.maxNestingLevel / 10) * 3);
    score += Math.min(2, metrics.sectionCount);
    
    // JavaScript complexity (0-20 points)
    score += Math.min(5, (metrics.scriptCount / 10) * 5);
    if (metrics.hasReact) score += 5;
    if (metrics.hasAngular) score += 5;
    if (metrics.hasVue) score += 5;
    
    // Performance penalty (0-10 points)
    if (metrics.loadTime > 3000) score += 5;
    if (metrics.domContentLoaded > 2000) score += 5;
    
    return Math.min(100, score);
  }

  async calculateAdaptiveDelay(action: string): Promise<number> {
    const complexity = this.baselineMetrics.complexity || 50;
    const loadTime = this.baselineMetrics.performance?.loadTime || 2000;
    
    let baseDelay = 0;
    let complexityMultiplier = 1;
    let loadMultiplier = 1;
    
    // Base delays by action type
    switch (action) {
      case 'page_load':
        baseDelay = 3000;
        complexityMultiplier = 1.5;
        loadMultiplier = 0.5;
        break;
      case 'navigation':
        baseDelay = 2000;
        complexityMultiplier = 1.2;
        loadMultiplier = 0.3;
        break;
      case 'interaction':
        baseDelay = 1000;
        complexityMultiplier = 1.0;
        loadMultiplier = 0.2;
        break;
      case 'form_submission':
        baseDelay = 2500;
        complexityMultiplier = 1.3;
        loadMultiplier = 0.4;
        break;
      case 'content_extraction':
        baseDelay = 1500;
        complexityMultiplier = 1.1;
        loadMultiplier = 0.3;
        break;
      default:
        baseDelay = 1000;
    }
    
    // Apply complexity adjustment
    const complexityAdjustment = (complexity / 100) * complexityMultiplier;
    
    // Apply load time adjustment
    const loadAdjustment = Math.min(2, loadTime / 5000) * loadMultiplier;
    
    // Calculate final delay
    const finalDelay = baseDelay * (1 + complexityAdjustment + loadAdjustment);
    
    // Add randomization (±25%)
    const randomFactor = 0.75 + (Math.random() * 0.5);
    const adaptiveDelay = Math.round(finalDelay * randomFactor);
    
    console.log(`⏱️ Adaptive delay for ${action}: ${adaptiveDelay}ms (base: ${baseDelay}ms, complexity: ${complexity.toFixed(1)}, load: ${loadTime}ms)`);
    
    return Math.min(15000, Math.max(500, adaptiveDelay)); // Cap between 500ms and 15s
  }

  async simulateTrafficPattern(): Promise<void> {
    const patterns = [
      'human_browsing',
      'research_session',
      'quick_lookup',
      'thorough_analysis'
    ];
    
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    console.log(`🚶 Simulating ${selectedPattern} traffic pattern`);
    
    switch (selectedPattern) {
      case 'human_browsing':
        await this.simulateHumanBrowsing();
        break;
      case 'research_session':
        await this.simulateResearchSession();
        break;
      case 'quick_lookup':
        await this.simulateQuickLookup();
        break;
      case 'thorough_analysis':
        await this.simulateThoroughAnalysis();
        break;
    }
  }

  private async simulateHumanBrowsing(): Promise<void> {
    // Casual browsing with moderate delays
    const actions = ['scroll', 'pause', 'move_mouse', 'scroll'];
    
    for (const action of actions) {
      switch (action) {
        case 'scroll':
          await this.page.evaluate(() => {
            window.scrollBy(0, Math.random() * 300 + 100);
          });
          await this.delay(2000, 4000);
          break;
        case 'pause':
          await this.delay(3000, 7000);
          break;
        case 'move_mouse':
          const x = Math.random() * 800 + 100;
          const y = Math.random() * 600 + 100;
          await this.page.mouse.move(x, y);
          await this.delay(1000, 2000);
          break;
      }
    }
  }

  private async simulateResearchSession(): Promise<void> {
    // Focused reading with longer pauses
    const scrollCount = Math.floor(Math.random() * 6) + 4;
    
    for (let i = 0; i < scrollCount; i++) {
      await this.page.evaluate(() => {
        window.scrollBy(0, Math.random() * 200 + 150);
      });
      
      // Reading pause - varies by content density
      const readingTime = await this.calculateReadingTime();
      await this.delay(readingTime, readingTime * 1.5);
    }
  }

  private async simulateQuickLookup(): Promise<void> {
    // Fast scanning with minimal delays
    await this.page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 0.7);
    });
    await this.delay(1000, 2000);
    
    await this.page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 0.5);
    });
    await this.delay(800, 1500);
  }

  private async simulateThoroughAnalysis(): Promise<void> {
    // Detailed examination with systematic scrolling
    const totalHeight = await this.page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await this.page.evaluate(() => window.innerHeight);
    const scrollSteps = Math.ceil(totalHeight / (viewportHeight * 0.8));
    
    for (let i = 0; i < Math.min(scrollSteps, 10); i++) {
      await this.page.evaluate((step, vpHeight) => {
        window.scrollTo(0, step * vpHeight * 0.8);
      }, i, viewportHeight);
      
      await this.delay(4000, 8000); // Long analysis pauses
    }
  }

  private async calculateReadingTime(): Promise<number> {
    const visibleText = await this.page.evaluate(() => {
      const rect = { top: window.scrollY, bottom: window.scrollY + window.innerHeight };
      let textLength = 0;
      
      document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach(el => {
        const elRect = el.getBoundingClientRect();
        if (elRect.top < window.innerHeight && elRect.bottom > 0) {
          textLength += (el.textContent || '').length;
        }
      });
      
      return textLength;
    });
    
    // Reading speed: ~200-250 characters per second
    const readingTime = (visibleText / 225) * 1000;
    return Math.min(10000, Math.max(2000, readingTime)); // 2-10 seconds
  }

  private async delay(min: number, max?: number): Promise<void> {
    const delayTime = max ? min + Math.random() * (max - min) : min;
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }

  getDelayMetrics(): any {
    return {
      baselineComplexity: this.baselineMetrics.complexity,
      loadTime: this.baselineMetrics.performance?.loadTime,
      recommendedMinDelay: this.baselineMetrics.complexity * 20, // 20ms per complexity point
      lastAnalysis: Date.now()
    };
  }
}
