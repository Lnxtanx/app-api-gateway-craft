
import { Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import { StealthProfile } from './types.ts';

export interface ScrapingStrategy {
  name: string;
  priority: number;
  canHandle: (url: string, page: Page) => Promise<boolean>;
  execute: (url: string, page: Page) => Promise<any>;
}

export interface LogicalFlow {
  steps: FlowStep[];
  conditions: FlowCondition[];
  retryLogic: RetryConfig;
}

export interface FlowStep {
  id: string;
  type: 'navigate' | 'wait' | 'extract' | 'interact' | 'validate' | 'transform';
  selector?: string;
  action?: string;
  data?: any;
  timeout?: number;
  required?: boolean;
}

export interface FlowCondition {
  if: string;
  then: string[];
  else?: string[];
}

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  conditions: string[];
}

export class AdvancedScrapingEngine {
  private strategies: ScrapingStrategy[] = [];
  private page: Page;
  private profile: StealthProfile;

  constructor(page: Page, profile: StealthProfile) {
    this.page = page;
    this.profile = profile;
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.strategies = [
      this.createApiKeyStrategy(),
      this.createSpaStrategy(),
      this.createEcommerceStrategy(),
      this.createBlogStrategy(),
      this.createNewsStrategy(),
      this.createSocialMediaStrategy(),
      this.createJobBoardStrategy(),
      this.createRealEstateStrategy(),
      this.createGenericStrategy()
    ].sort((a, b) => b.priority - a.priority);
  }

  async executeLogicalFlow(url: string): Promise<any> {
    console.log(`🧠 Starting advanced logical scraping for: ${url}`);
    
    // Phase 1: Website Analysis
    const analysis = await this.analyzeWebsite(url);
    console.log(`📊 Website analysis completed:`, analysis);
    
    // Phase 2: Strategy Selection
    const selectedStrategy = await this.selectOptimalStrategy(url);
    console.log(`🎯 Selected strategy: ${selectedStrategy.name}`);
    
    // Phase 3: Dynamic Flow Execution
    const flowResult = await this.executeDynamicFlow(url, selectedStrategy);
    console.log(`⚡ Flow execution completed`);
    
    // Phase 4: Data Enhancement
    const enhancedData = await this.enhanceExtractedData(flowResult, analysis);
    console.log(`✨ Data enhancement completed`);
    
    return enhancedData;
  }

  private async analyzeWebsite(url: string): Promise<any> {
    console.log(`🔍 Analyzing website structure...`);
    
    return await this.page.evaluate(() => {
      const analysis: any = {};
      
      // Framework Detection
      analysis.framework = this.detectFramework();
      
      // Content Type Detection
      analysis.contentTypes = this.detectContentTypes();
      
      // API Endpoints Detection
      analysis.apiEndpoints = this.detectApiEndpoints();
      
      // Security Features Detection
      analysis.security = this.detectSecurityFeatures();
      
      // Performance Metrics
      analysis.performance = this.analyzePerformance();
      
      return analysis;
    });
  }

  private createApiKeyStrategy(): ScrapingStrategy {
    return {
      name: 'API Key Extraction',
      priority: 100,
      canHandle: async (url: string, page: Page) => {
        const hasApiElements = await page.evaluate(() => {
          const apiIndicators = [
            'api-key', 'apikey', 'api_key', 'token', 'bearer',
            'authorization', 'auth-token', 'access-token',
            'secret', 'credential', 'key'
          ];
          
          return apiIndicators.some(indicator => 
            document.querySelector(`[class*="${indicator}"], [id*="${indicator}"], [data-*="${indicator}"]`)
          );
        });
        
        return hasApiElements;
      },
      execute: async (url: string, page: Page) => {
        console.log(`🔑 Executing API key extraction strategy`);
        
        // Multiple API key extraction methods
        const apiData = await page.evaluate(() => {
          const results: any = {};
          
          // Method 1: Extract from visible elements
          const apiKeyElements = document.querySelectorAll([
            '[class*="api"], [class*="key"], [class*="token"]',
            '[id*="api"], [id*="key"], [id*="token"]',
            'input[type="password"], input[type="text"][value*="sk-"]',
            'code, pre, .code, .token-display'
          ].join(', '));
          
          results.visibleKeys = Array.from(apiKeyElements).map(el => ({
            text: el.textContent?.trim() || '',
            value: (el as HTMLInputElement).value || '',
            type: el.tagName,
            classes: el.className,
            id: el.id
          })).filter(item => item.text || item.value);
          
          // Method 2: Extract from localStorage/sessionStorage
          results.storageKeys = {};
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && /api|key|token|auth/i.test(key)) {
                results.storageKeys[key] = localStorage.getItem(key);
              }
            }
          } catch (e) {
            console.log('Cannot access localStorage');
          }
          
          // Method 3: Extract from scripts
          const scripts = Array.from(document.querySelectorAll('script'));
          results.scriptKeys = scripts.map(script => {
            const content = script.textContent || '';
            const apiMatches = content.match(/['"](sk-[a-zA-Z0-9]{32,}|pk_[a-zA-Z0-9]{32,}|[a-zA-Z0-9]{32,})['"]/g);
            return apiMatches ? apiMatches.map(match => match.slice(1, -1)) : [];
          }).flat().filter(key => key.length > 20);
          
          // Method 4: Extract from network requests (if available)
          results.networkKeys = this.extractFromNetworkRequests();
          
          return results;
        });
        
        return {
          type: 'api-keys',
          data: apiData,
          confidence: this.calculateApiConfidence(apiData)
        };
      }
    };
  }

  private createSpaStrategy(): ScrapingStrategy {
    return {
      name: 'Single Page Application',
      priority: 90,
      canHandle: async (url: string, page: Page) => {
        const isSpa = await page.evaluate(() => {
          return !!(window.React || window.Vue || window.angular || 
                   document.querySelector('[data-reactroot], [data-server-rendered], ng-app') ||
                   window.location.href.includes('#') ||
                   document.querySelectorAll('script[src*="react"], script[src*="vue"], script[src*="angular"]').length > 0);
        });
        return isSpa;
      },
      execute: async (url: string, page: Page) => {
        console.log(`⚛️ Executing SPA extraction strategy`);
        
        // Wait for dynamic content to load
        await this.waitForDynamicContent(page);
        
        // Extract SPA-specific data
        const spaData = await page.evaluate(() => {
          const data: any = {};
          
          // Extract component data
          data.components = this.extractReactComponents();
          data.routes = this.extractRoutes();
          data.state = this.extractAppState();
          data.apis = this.extractApiCalls();
          
          return data;
        });
        
        return {
          type: 'spa-data',
          data: spaData,
          confidence: 0.8
        };
      }
    };
  }

  private createEcommerceStrategy(): ScrapingStrategy {
    return {
      name: 'E-commerce Platform',
      priority: 85,
      canHandle: async (url: string, page: Page) => {
        const isEcommerce = await page.evaluate(() => {
          const ecommerceIndicators = [
            '.product', '.item', '.price', '.cart', '.checkout',
            '[data-price]', '.add-to-cart', '.buy-now', '.product-list'
          ];
          
          return ecommerceIndicators.some(selector => 
            document.querySelectorAll(selector).length > 3
          );
        });
        return isEcommerce;
      },
      execute: async (url: string, page: Page) => {
        console.log(`🛒 Executing e-commerce extraction strategy`);
        
        const ecommerceData = await page.evaluate(() => {
          return {
            products: this.extractProducts(),
            categories: this.extractCategories(),
            prices: this.extractPricing(),
            reviews: this.extractReviews(),
            inventory: this.extractInventoryData()
          };
        });
        
        return {
          type: 'ecommerce',
          data: ecommerceData,
          confidence: 0.9
        };
      }
    };
  }

  private createGenericStrategy(): ScrapingStrategy {
    return {
      name: 'Generic Content Extraction',
      priority: 10,
      canHandle: async () => true, // Always applicable as fallback
      execute: async (url: string, page: Page) => {
        console.log(`🌐 Executing generic extraction strategy`);
        
        const genericData = await page.evaluate(() => {
          return {
            title: document.title,
            headings: this.extractHeadings(),
            links: this.extractLinks(),
            images: this.extractImages(),
            text: this.extractMainContent(),
            metadata: this.extractMetadata(),
            forms: this.extractForms(),
            tables: this.extractTables()
          };
        });
        
        return {
          type: 'generic',
          data: genericData,
          confidence: 0.5
        };
      }
    };
  }

  private async selectOptimalStrategy(url: string): Promise<ScrapingStrategy> {
    for (const strategy of this.strategies) {
      try {
        if (await strategy.canHandle(url, this.page)) {
          return strategy;
        }
      } catch (error) {
        console.log(`Strategy ${strategy.name} failed canHandle check:`, error);
      }
    }
    
    // Return generic strategy as fallback
    return this.strategies[this.strategies.length - 1];
  }

  private async executeDynamicFlow(url: string, strategy: ScrapingStrategy): Promise<any> {
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for strategy: ${strategy.name}`);
        
        // Execute pre-extraction steps
        await this.executePreExtractionSteps();
        
        // Execute main strategy
        const result = await strategy.execute(url, this.page);
        
        // Execute post-extraction validation
        const isValid = await this.validateExtractedData(result);
        
        if (isValid) {
          return result;
        } else {
          throw new Error('Data validation failed');
        }
        
      } catch (error) {
        lastError = error;
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Refresh page for retry
          await this.page.reload({ waitUntil: 'networkidle0' });
        }
      }
    }
    
    throw lastError || new Error('All extraction attempts failed');
  }

  private async enhanceExtractedData(data: any, analysis: any): Promise<any> {
    console.log(`✨ Enhancing extracted data...`);
    
    return {
      ...data,
      enhancement: {
        timestamp: new Date().toISOString(),
        analysis: analysis,
        confidence: data.confidence || 0.5,
        extractionMethod: 'advanced-logical-flow',
        dataQuality: this.assessDataQuality(data),
        recommendations: this.generateRecommendations(data, analysis)
      }
    };
  }

  private async waitForDynamicContent(page: Page): Promise<void> {
    // Wait for various loading indicators to disappear
    await page.waitForFunction(() => {
      const loadingIndicators = [
        '.loading', '.spinner', '.loader', '[data-loading]',
        '.skeleton', '.placeholder'
      ];
      
      return !loadingIndicators.some(selector => 
        document.querySelector(selector)
      );
    }, { timeout: 10000 }).catch(() => {
      console.log('Timeout waiting for loading indicators');
    });
    
    // Wait for network to be idle
    await page.waitForLoadState('networkidle').catch(() => {
      console.log('Network idle timeout');
    });
  }

  private async executePreExtractionSteps(): Promise<void> {
    // Handle cookie banners
    await this.handleCookieBanners();
    
    // Handle popups
    await this.handlePopups();
    
    // Scroll to load more content
    await this.performIntelligentScrolling();
  }

  private async handleCookieBanners(): Promise<void> {
    const cookieSelectors = [
      '[data-cookie] button', '.cookie-banner button', '.gdpr button',
      'button[id*="cookie"]', 'button[class*="cookie"]', 'button[class*="accept"]'
    ];
    
    for (const selector of cookieSelectors) {
      try {
        await this.page.click(selector, { timeout: 2000 });
        console.log(`✅ Clicked cookie banner: ${selector}`);
        break;
      } catch (e) {
        // Continue to next selector
      }
    }
  }

  private async handlePopups(): Promise<void> {
    const popupSelectors = [
      '.modal .close', '.popup .close', '[data-dismiss="modal"]',
      'button[aria-label*="close"]', '.overlay .close'
    ];
    
    for (const selector of popupSelectors) {
      try {
        await this.page.click(selector, { timeout: 2000 });
        console.log(`✅ Closed popup: ${selector}`);
      } catch (e) {
        // Continue to next selector
      }
    }
  }

  private async performIntelligentScrolling(): Promise<void> {
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve(undefined);
          }
        }, 100);
      });
    });
  }

  private async validateExtractedData(data: any): Promise<boolean> {
    if (!data || !data.data) return false;
    
    // Check if we have meaningful data
    const hasContent = Object.values(data.data).some(value => 
      Array.isArray(value) ? value.length > 0 : value
    );
    
    return hasContent;
  }

  private calculateApiConfidence(apiData: any): number {
    let confidence = 0;
    
    if (apiData.visibleKeys?.length > 0) confidence += 0.4;
    if (apiData.storageKeys && Object.keys(apiData.storageKeys).length > 0) confidence += 0.3;
    if (apiData.scriptKeys?.length > 0) confidence += 0.2;
    if (apiData.networkKeys?.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private assessDataQuality(data: any): string {
    const score = data.confidence || 0;
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  private generateRecommendations(data: any, analysis: any): string[] {
    const recommendations = [];
    
    if (data.confidence < 0.7) {
      recommendations.push('Consider using alternative extraction methods');
    }
    
    if (analysis.security?.hasRateLimiting) {
      recommendations.push('Implement rate limiting for API requests');
    }
    
    if (analysis.framework) {
      recommendations.push(`Optimize for ${analysis.framework} framework`);
    }
    
    return recommendations;
  }

  // Additional strategies would be implemented similarly...
  private createBlogStrategy(): ScrapingStrategy {
    return {
      name: 'Blog/Content Platform',
      priority: 70,
      canHandle: async (url: string, page: Page) => {
        const isBlog = await page.evaluate(() => {
          const blogIndicators = [
            'article', '.post', '.blog-post', '.entry',
            '[data-post]', '.content', '.article-content'
          ];
          return blogIndicators.some(selector => document.querySelectorAll(selector).length > 0);
        });
        return isBlog;
      },
      execute: async (url: string, page: Page) => {
        console.log(`📝 Executing blog extraction strategy`);
        const blogData = await page.evaluate(() => ({
          articles: this.extractArticles(),
          authors: this.extractAuthors(),
          categories: this.extractCategories(),
          comments: this.extractComments()
        }));
        return { type: 'blog', data: blogData, confidence: 0.8 };
      }
    };
  }

  private createNewsStrategy(): ScrapingStrategy {
    return {
      name: 'News Platform',
      priority: 75,
      canHandle: async (url: string, page: Page) => {
        const isNews = await page.evaluate(() => {
          const newsIndicators = [
            '.news', '.headline', '.breaking', '.article',
            '[data-article]', '.story', '.news-item'
          ];
          return newsIndicators.some(selector => document.querySelectorAll(selector).length > 2);
        });
        return isNews;
      },
      execute: async (url: string, page: Page) => {
        console.log(`📰 Executing news extraction strategy`);
        const newsData = await page.evaluate(() => ({
          headlines: this.extractHeadlines(),
          articles: this.extractNewsArticles(),
          timestamps: this.extractPublishDates(),
          sources: this.extractSources()
        }));
        return { type: 'news', data: newsData, confidence: 0.85 };
      }
    };
  }

  private createSocialMediaStrategy(): ScrapingStrategy {
    return {
      name: 'Social Media Platform',
      priority: 80,
      canHandle: async (url: string, page: Page) => {
        const isSocial = await page.evaluate(() => {
          const socialIndicators = [
            '.post', '.tweet', '.feed', '.timeline',
            '[data-post]', '.social-post', '.user-content'
          ];
          return socialIndicators.some(selector => document.querySelectorAll(selector).length > 5);
        });
        return isSocial;
      },
      execute: async (url: string, page: Page) => {
        console.log(`📱 Executing social media extraction strategy`);
        const socialData = await page.evaluate(() => ({
          posts: this.extractSocialPosts(),
          users: this.extractUserProfiles(),
          interactions: this.extractInteractions(),
          hashtags: this.extractHashtags()
        }));
        return { type: 'social', data: socialData, confidence: 0.8 };
      }
    };
  }

  private createJobBoardStrategy(): ScrapingStrategy {
    return {
      name: 'Job Board Platform',
      priority: 65,
      canHandle: async (url: string, page: Page) => {
        const isJobBoard = await page.evaluate(() => {
          const jobIndicators = [
            '.job', '.position', '.listing', '.career',
            '[data-job]', '.job-listing', '.opportunity'
          ];
          return jobIndicators.some(selector => document.querySelectorAll(selector).length > 3);
        });
        return isJobBoard;
      },
      execute: async (url: string, page: Page) => {
        console.log(`💼 Executing job board extraction strategy`);
        const jobData = await page.evaluate(() => ({
          jobs: this.extractJobListings(),
          companies: this.extractCompanies(),
          salaries: this.extractSalaries(),
          locations: this.extractLocations()
        }));
        return { type: 'jobs', data: jobData, confidence: 0.8 };
      }
    };
  }

  private createRealEstateStrategy(): ScrapingStrategy {
    return {
      name: 'Real Estate Platform',
      priority: 60,
      canHandle: async (url: string, page: Page) => {
        const isRealEstate = await page.evaluate(() => {
          const realEstateIndicators = [
            '.property', '.listing', '.home', '.house',
            '[data-property]', '.real-estate', '.for-sale'
          ];
          return realEstateIndicators.some(selector => document.querySelectorAll(selector).length > 2);
        });
        return isRealEstate;
      },
      execute: async (url: string, page: Page) => {
        console.log(`🏠 Executing real estate extraction strategy`);
        const realEstateData = await page.evaluate(() => ({
          properties: this.extractProperties(),
          prices: this.extractPropertyPrices(),
          locations: this.extractPropertyLocations(),
          features: this.extractPropertyFeatures()
        }));
        return { type: 'real-estate', data: realEstateData, confidence: 0.8 };
      }
    };
  }
}
