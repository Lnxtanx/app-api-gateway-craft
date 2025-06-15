
/**
 * Level 2: Advanced Request Patterns
 * Simulates human browsing with mouse movements, scrolling, typing, and realistic delays
 */
export class AdvancedRequestPatterns {
  private page: any;
  private humanBehavior: any;

  constructor(page: any, humanBehavior: any) {
    this.page = page;
    this.humanBehavior = humanBehavior;
  }

  async simulateHumanBrowsingSession(): Promise<void> {
    console.log('🤖 Starting Level 2 human browsing simulation...');

    try {
      // Phase 1: Initial page assessment (2-5 seconds)
      await this.simulatePageAssessment();
      
      // Phase 2: Reading behavior (5-15 seconds)
      await this.simulateReadingBehavior();
      
      // Phase 3: Interactive exploration (3-10 seconds)
      await this.simulateInteractiveExploration();
      
      // Phase 4: Decision making pause (1-3 seconds)
      await this.simulateDecisionPause();

      console.log('✅ Level 2 human browsing simulation completed');
    } catch (error) {
      console.log('⚠️ Human simulation completed with minor errors:', error.message);
    }
  }

  private async simulatePageAssessment(): Promise<void> {
    console.log('👁️ Phase 1: Page assessment');
    
    // Look at different parts of the page
    const viewportHeight = await this.page.evaluate(() => window.innerHeight);
    const assessmentPoints = [
      { x: 200, y: 100 },
      { x: 800, y: 200 },
      { x: 400, y: viewportHeight / 2 },
      { x: 600, y: viewportHeight - 200 }
    ];

    for (const point of assessmentPoints) {
      await this.humanBehavior.humanMouseMovement(point.x, point.y);
      await this.randomDelay(300, 800);
    }

    // Initial scroll to see page length
    await this.page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 0.3);
    });
    await this.randomDelay(1000, 2000);

    await this.page.evaluate(() => {
      window.scrollBy(0, -window.innerHeight * 0.3);
    });
    await this.randomDelay(1500, 3000);
  }

  private async simulateReadingBehavior(): Promise<void> {
    console.log('📖 Phase 2: Reading behavior');
    
    // Simulate reading by scrolling slowly
    const scrollSteps = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < scrollSteps; i++) {
      const scrollAmount = Math.floor(Math.random() * 300) + 150;
      
      await this.page.evaluate((amount) => {
        window.scrollBy(0, amount);
      }, scrollAmount);
      
      // Reading pause - varies by content density
      const readingTime = await this.calculateReadingTime();
      await this.randomDelay(readingTime.min, readingTime.max);
      
      // Occasional mouse movement during reading
      if (Math.random() < 0.4) {
        const x = Math.floor(Math.random() * 800) + 100;
        const y = Math.floor(Math.random() * 400) + 200;
        await this.humanBehavior.humanMouseMovement(x, y);
      }
    }
  }

  private async simulateInteractiveExploration(): Promise<void> {
    console.log('🔍 Phase 3: Interactive exploration');
    
    // Look for interactive elements
    const interactiveElements = await this.page.evaluate(() => {
      const elements = [];
      
      // Find clickable elements
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      
      [...buttons, ...inputs].forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight) {
          elements.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            type: el.tagName.toLowerCase(),
            text: el.textContent?.substring(0, 50) || ''
          });
        }
      });
      
      return elements.slice(0, 8); // Limit to 8 elements
    });

    // Hover over some interactive elements
    const elementsToExplore = interactiveElements
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 2);

    for (const element of elementsToExplore) {
      await this.humanBehavior.humanMouseMovement(element.x, element.y);
      await this.randomDelay(500, 1500);
      
      // Occasional hover pause
      if (Math.random() < 0.3) {
        await this.randomDelay(1000, 2500);
      }
    }
  }

  private async simulateDecisionPause(): Promise<void> {
    console.log('🤔 Phase 4: Decision making pause');
    
    // Simulate the pause before taking action or leaving
    const pauseTypes = [
      { min: 1000, max: 2000 }, // Quick decision
      { min: 2000, max: 4000 }, // Normal consideration
      { min: 4000, max: 7000 }  // Deep thought
    ];
    
    const pauseType = pauseTypes[Math.floor(Math.random() * pauseTypes.length)];
    await this.randomDelay(pauseType.min, pauseType.max);
    
    // Final mouse movement
    const finalX = Math.floor(Math.random() * 600) + 200;
    const finalY = Math.floor(Math.random() * 400) + 200;
    await this.humanBehavior.humanMouseMovement(finalX, finalY);
  }

  private async calculateReadingTime(): Promise<{ min: number; max: number }> {
    // Calculate reading time based on visible text content
    const textStats = await this.page.evaluate(() => {
      const textContent = document.body.textContent || '';
      const visibleText = textContent.replace(/\s+/g, ' ').trim();
      const wordCount = visibleText.split(' ').length;
      const imageCount = document.querySelectorAll('img').length;
      
      return { wordCount, imageCount };
    });

    // Base reading time: ~200-300 words per minute
    const baseTime = (textStats.wordCount / 250) * 60 * 1000; // milliseconds
    const imageTime = textStats.imageCount * 500; // 500ms per image
    
    const totalTime = Math.min(baseTime + imageTime, 15000); // Cap at 15 seconds
    
    return {
      min: Math.max(totalTime * 0.5, 2000), // Minimum 2 seconds
      max: Math.max(totalTime * 1.5, 5000)  // Minimum 5 seconds max
    };
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async simulateTypingBehavior(selector: string, text: string): Promise<void> {
    console.log('⌨️ Simulating realistic typing behavior');
    
    await this.page.focus(selector);
    
    // Clear existing content
    await this.page.keyboard.down('Control');
    await this.page.keyboard.press('KeyA');
    await this.page.keyboard.up('Control');
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Variable typing speed (40-200ms per character)
      const baseDelay = Math.random() * 80 + 40;
      
      // Longer delays for certain characters
      let charDelay = baseDelay;
      if (/[A-Z]/.test(char)) charDelay *= 1.2; // Caps
      if (/[0-9]/.test(char)) charDelay *= 1.1; // Numbers
      if (/[!@#$%^&*()_+{}|:"<>?]/.test(char)) charDelay *= 1.5; // Special chars
      
      // Occasional longer pauses (thinking)
      if (Math.random() < 0.1) {
        charDelay += Math.random() * 500 + 200;
      }
      
      await this.page.keyboard.type(char);
      await this.randomDelay(charDelay * 0.8, charDelay * 1.2);
    }
  }
}
