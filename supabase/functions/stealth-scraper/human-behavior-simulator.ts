
import { Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

/**
 * Enhanced Human Behavior Simulator
 */
export class HumanBehaviorSimulator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async humanMouseMovement(x: number, y: number): Promise<void> {
    const steps = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const easeProgress = this.easeInOutCubic(progress);
      
      const currentX = x * easeProgress;
      const currentY = y * easeProgress;
      
      await this.page.mouse.move(currentX, currentY);
      await this.randomDelay(5, 15);
    }
  }

  async humanTypeText(selector: string, text: string): Promise<void> {
    await this.page.focus(selector);
    
    for (const char of text) {
      await this.page.keyboard.type(char);
      await this.randomDelay(50, 150);
    }
  }

  async humanScroll(): Promise<void> {
    const scrollCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < scrollCount; i++) {
      const scrollDistance = Math.floor(Math.random() * 500) + 200;
      await this.page.evaluate((distance) => {
        window.scrollBy(0, distance);
      }, scrollDistance);
      
      await this.randomDelay(800, 2000);
    }
  }

  async simulateRandomInteractions(): Promise<void> {
    try {
      // Random mouse movements
      for (let i = 0; i < 3; i++) {
        const x = Math.floor(Math.random() * 1000) + 100;
        const y = Math.floor(Math.random() * 600) + 100;
        await this.humanMouseMovement(x, y);
        await this.randomDelay(500, 1500);
      }

      // Random scrolling
      await this.humanScroll();
    } catch (error) {
      console.log('Random interaction simulation completed:', error);
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
