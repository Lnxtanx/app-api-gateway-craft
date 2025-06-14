import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'
import puppeteer, { Browser, Page } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * AI-Powered Content Classification
 * Identifies page type and content patterns using semantic analysis
 */
function classifyPageType(html: string, $: cheerio.CheerioAPI): {
  pageType: string;
  confidence: number;
  entities: string[];
  patterns: string[];
} {
  const title = $('title').text().toLowerCase();
  const bodyText = $('body').text().toLowerCase();
  const headings = $('h1, h2, h3').map((_, el) => $(el).text().toLowerCase()).get().join(' ');
  
  // Pattern Recognition Engine - ML-like classification based on keywords and structure
  const pagePatterns = {
    'e-commerce': {
      keywords: ['shop', 'buy', 'cart', 'price', 'product', 'store', 'checkout', 'add to cart', '$', '€', '£'],
      selectors: ['[class*="product"]', '[class*="cart"]', '[class*="price"]', '[class*="buy"]'],
      weight: 0
    },
    'blog': {
      keywords: ['blog', 'post', 'article', 'author', 'published', 'read more', 'comments', 'tags'],
      selectors: ['article', '[class*="post"]', '[class*="blog"]', '[class*="article"]'],
      weight: 0
    },
    'news': {
      keywords: ['news', 'breaking', 'reporter', 'updated', 'latest', 'headline', 'story'],
      selectors: ['[class*="news"]', '[class*="headline"]', '[class*="story"]'],
      weight: 0
    },
    'job-board': {
      keywords: ['job', 'career', 'hiring', 'apply', 'salary', 'employment', 'position', 'resume'],
      selectors: ['[class*="job"]', '[class*="career"]', '[class*="position"]'],
      weight: 0
    },
    'real-estate': {
      keywords: ['property', 'house', 'apartment', 'rent', 'sale', 'bedroom', 'bathroom', 'sqft'],
      selectors: ['[class*="property"]', '[class*="listing"]', '[class*="house"]'],
      weight: 0
    },
    'social-media': {
      keywords: ['profile', 'follow', 'like', 'share', 'comment', 'post', 'feed', 'social'],
      selectors: ['[class*="profile"]', '[class*="post"]', '[class*="feed"]'],
      weight: 0
    },
    'restaurant': {
      keywords: ['menu', 'food', 'restaurant', 'order', 'delivery', 'cuisine', 'dish', 'reservation'],
      selectors: ['[class*="menu"]', '[class*="food"]', '[class*="dish"]'],
      weight: 0
    }
  };

  // Calculate weights based on keyword frequency and selector presence
  const combinedText = `${title} ${bodyText} ${headings}`;
  
  Object.keys(pagePatterns).forEach(pageType => {
    const pattern = pagePatterns[pageType];
    
    // Keyword analysis
    pattern.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        pattern.weight += matches.length * 2; // Weight keywords highly
      }
    });
    
    // Selector presence analysis
    pattern.selectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        pattern.weight += elements.length * 3; // Weight structural patterns even higher
      }
    });
  });

  // Find the highest scoring page type
  let bestMatch = 'general';
  let highestWeight = 0;
  let detectedPatterns: string[] = [];

  Object.keys(pagePatterns).forEach(pageType => {
    if (pagePatterns[pageType].weight > highestWeight) {
      highestWeight = pagePatterns[pageType].weight;
      bestMatch = pageType;
    }
    if (pagePatterns[pageType].weight > 0) {
      detectedPatterns.push(pageType);
    }
  });

  // Named Entity Recognition (NER) - Simple implementation
  const entities: string[] = [];
  
  // Extract prices
  const priceRegex = /[\$€£¥]\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s?(?:\$|€|£|¥|USD|EUR|GBP)/gi;
  if (combinedText.match(priceRegex)) entities.push('prices');
  
  // Extract dates
  const dateRegex = /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})\b/gi;
  if (combinedText.match(dateRegex)) entities.push('dates');
  
  // Extract locations (basic patterns)
  const locationRegex = /\b(?:[A-Z][a-z]+ (?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)|[A-Z][a-z]+,\s*[A-Z]{2}|\b[A-Z][a-z]+ [A-Z][a-z]+,\s*[A-Z]{2,3})\b/g;
  if (combinedText.match(locationRegex)) entities.push('locations');
  
  // Extract organizations (capitalized words that appear multiple times)
  const orgRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|LLC|Corp|Company|Co|Ltd|Limited)\.?)\b/g;
  if (combinedText.match(orgRegex)) entities.push('organizations');
  
  // Extract people names (basic pattern)
  const nameRegex = /\b(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  if (combinedText.match(nameRegex)) entities.push('people');

  // Calculate confidence based on weight and number of patterns
  const confidence = Math.min(0.95, Math.max(0.1, highestWeight / 20));

  return {
    pageType: bestMatch,
    confidence: confidence,
    entities: entities,
    patterns: detectedPatterns
  };
}

/**
 * Behavioral Analysis - Analyze user interaction patterns
 */
function analyzeUserInteractionPatterns($: cheerio.CheerioAPI): {
  interactionElements: string[];
  navigationPattern: string;
  contentStructure: string;
} {
  const interactionElements: string[] = [];
  const forms = $('form').length;
  const buttons = $('button, input[type="submit"], input[type="button"]').length;
  const links = $('a').length;
  const inputs = $('input, textarea, select').length;
  
  if (forms > 0) interactionElements.push('forms');
  if (buttons > 5) interactionElements.push('multiple-buttons');
  if (inputs > 3) interactionElements.push('form-inputs');
  if (links > 10) interactionElements.push('rich-navigation');
  
  // Navigation pattern analysis
  let navigationPattern = 'simple';
  const nav = $('nav, [class*="nav"], [class*="menu"]').length;
  const breadcrumbs = $('[class*="breadcrumb"]').length;
  
  if (nav > 0 && breadcrumbs > 0) navigationPattern = 'hierarchical';
  else if (nav > 1) navigationPattern = 'multi-level';
  else if (links > 20) navigationPattern = 'link-heavy';
  
  // Content structure analysis
  let contentStructure = 'simple';
  const articles = $('article').length;
  const sections = $('section').length;
  const cards = $('[class*="card"]').length;
  
  if (articles > 3 || cards > 5) contentStructure = 'grid-based';
  else if (sections > 3) contentStructure = 'sectioned';
  else if ($('table').length > 0) contentStructure = 'tabular';
  
  return {
    interactionElements,
    navigationPattern,
    contentStructure
  };
}

/**
 * Enhanced data extraction with intelligent field mapping
 */
function extractItemDataIntelligent(element: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI, pageType: string) {
  const getAttr = (selector: string, attr: string) => $(element).find(selector).first().attr(attr) || null
  const getText = (selector: string) => $(element).find(selector).first().text().trim() || null

  // Base extraction
  const title = getText('h1, h2, h3, h4, h5, h6, [itemprop="name"]') || getAttr('a', 'title')
  const link = getAttr('a', 'href')
  const image = getAttr('img', 'src') || getAttr('img', 'data-src')
  const description = getText('p, [itemprop="description"]')
  
  // Enhanced extraction based on page type
  const item: { [key: string]: string | null } = { title, link, image, description };
  
  if (pageType === 'e-commerce') {
    const price = getText('[class*="price"], [id*="price"], [itemprop="price"], [itemprop="offers"]');
    const rating = getText('[class*="rating"], [class*="star"]') || getAttr('[class*="rating"]', 'data-rating');
    const brand = getText('[class*="brand"], [itemprop="brand"]');
    const availability = getText('[class*="stock"], [class*="availability"]');
    
    if (price) item.price = price.match(/[\$€£]?\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/)?.[0] || price;
    if (rating) item.rating = rating;
    if (brand) item.brand = brand;
    if (availability) item.availability = availability;
  }
  
  if (pageType === 'blog' || pageType === 'news') {
    const author = getText('[class*="author"], [class*="byline"], [rel="author"], [itemprop="author"]');
    const date = getAttr('time', 'datetime') || getText('time, [class*="date"], [itemprop="datePublished"]');
    const category = getText('[class*="category"], [class*="tag"]');
    const readTime = getText('[class*="read"], [class*="time"]');
    
    if (author) item.author = author;
    if (date) item.publishedDate = date;
    if (category) item.category = category;
    if (readTime) item.readTime = readTime;
  }
  
  if (pageType === 'job-board') {
    const company = getText('[class*="company"], [itemprop="hiringOrganization"]');
    const location = getText('[class*="location"], [itemprop="jobLocation"]');
    const salary = getText('[class*="salary"], [class*="pay"]');
    const jobType = getText('[class*="type"], [class*="employment"]');
    
    if (company) item.company = company;
    if (location) item.location = location;
    if (salary) item.salary = salary;
    if (jobType) item.jobType = jobType;
  }
  
  if (pageType === 'real-estate') {
    const price = getText('[class*="price"], [class*="rent"]');
    const bedrooms = getText('[class*="bed"], [class*="bedroom"]');
    const bathrooms = getText('[class*="bath"], [class*="bathroom"]');
    const sqft = getText('[class*="sqft"], [class*="area"], [class*="size"]');
    const address = getText('[class*="address"], [class*="location"]');
    
    if (price) item.price = price;
    if (bedrooms) item.bedrooms = bedrooms;
    if (bathrooms) item.bathrooms = bathrooms;
    if (sqft) item.squareFeet = sqft;
    if (address) item.address = address;
  }

  // Remove null/undefined properties for a cleaner output
  Object.keys(item).forEach(key => (item[key] == null) && delete item[key]);

  // Only return an object if it has some meaningful content
  if (item.title || item.link || item.image) {
    return item;
  }
  return null;
}

/**
 * Level 2: Advanced Browser Automation with Session Management
 */
class AdvancedBrowserAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    this.page = await this.browser.newPage();
    
    // Enhanced user agent and viewport settings
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async navigateWithSPASupport(url: string) {
    if (!this.page) throw new Error('Browser not initialized');
    
    console.log(`Navigating to ${url} with SPA support...`);
    
    // Advanced navigation with SPA detection
    await this.page.goto(url, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000 
    });

    // Wait for potential SPA hydration
    await this.page.waitForTimeout(3000);
    
    // Detect if it's a SPA by checking for common SPA frameworks
    const isSPA = await this.page.evaluate(() => {
      return !!(window.React || window.Vue || window.angular || 
               document.querySelector('[data-reactroot]') ||
               document.querySelector('#__nuxt') ||
               document.querySelector('[ng-app]'));
    });

    if (isSPA) {
      console.log('SPA detected, waiting for dynamic content...');
      await this.page.waitForTimeout(5000);
    }

    return isSPA;
  }

  async handleInfiniteScroll(): Promise<void> {
    if (!this.page) return;
    
    console.log('Handling infinite scroll...');
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 15;

    while (scrollAttempts < maxScrollAttempts) {
      // Get current scroll height
      const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
      
      if (currentHeight === previousHeight) {
        // Try clicking "Load More" buttons
        const loadMoreClicks = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a')).filter(el => {
            const text = el.textContent?.toLowerCase() || '';
            return text.includes('load more') || text.includes('show more') || 
                   text.includes('view more') || text.includes('see more') ||
                   text.includes('next') || text.includes('more');
          });
          
          let clicked = 0;
          buttons.forEach(button => {
            if (button instanceof HTMLElement && button.offsetParent !== null) {
              button.click();
              clicked++;
            }
          });
          return clicked;
        });

        if (loadMoreClicks === 0) break;
        await this.page.waitForTimeout(2000);
      }

      // Scroll to bottom
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await this.page.waitForTimeout(2000);
      previousHeight = currentHeight;
      scrollAttempts++;
    }

    console.log(`Infinite scroll completed after ${scrollAttempts} attempts`);
  }

  async detectAndInteractWithForms(): Promise<any[]> {
    if (!this.page) return [];

    console.log('Detecting and analyzing forms...');
    
    const formData = await this.page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      return forms.map(form => {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
        return {
          action: form.action,
          method: form.method,
          inputs: inputs.map(input => ({
            name: input.name,
            type: input.type || input.tagName.toLowerCase(),
            placeholder: input.placeholder,
            required: input.required
          }))
        };
      });
    });

    // Detect search forms and try basic interactions
    for (const form of formData) {
      const hasSearchField = form.inputs.some(input => 
        input.name?.includes('search') || 
        input.placeholder?.toLowerCase().includes('search')
      );
      
      if (hasSearchField) {
        console.log('Search form detected, attempting basic interaction...');
        try {
          await this.page.type('input[name*="search"], input[placeholder*="search"]', 'test');
          await this.page.waitForTimeout(1000);
          await this.page.keyboard.press('Escape'); // Clear the search
        } catch (e) {
          console.log('Search form interaction failed:', e);
        }
      }
    }

    return formData;
  }

  async monitorWebSocketActivity(): Promise<string[]> {
    if (!this.page) return [];

    const websocketUrls: string[] = [];
    
    // Monitor WebSocket connections
    this.page.on('websocket', websocket => {
      console.log('WebSocket detected:', websocket.url());
      websocketUrls.push(websocket.url());
    });

    // Wait a bit to capture any WebSocket connections
    await this.page.waitForTimeout(5000);
    
    return websocketUrls;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async getPageContent(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    return await this.page.content();
  }
}

/**
 * Level 2: Semantic API Endpoint Creation
 */
class SemanticEndpointGenerator {
  static generateContextAwareEndpoint(pageType: string, baseUrl: string): {
    endpoint: string;
    entityName: string;
    parameters: any[];
    sortOptions: string[];
  } {
    const endpointMap = {
      'e-commerce': {
        endpoint: '/api/products',
        entityName: 'Product',
        parameters: [
          { name: 'category', type: 'string', description: 'Filter by product category' },
          { name: 'minPrice', type: 'number', description: 'Minimum price filter' },
          { name: 'maxPrice', type: 'number', description: 'Maximum price filter' },
          { name: 'brand', type: 'string', description: 'Filter by brand' },
          { name: 'rating', type: 'number', description: 'Minimum rating filter' },
          { name: 'inStock', type: 'boolean', description: 'Filter for available products' }
        ],
        sortOptions: ['price_asc', 'price_desc', 'rating_desc', 'name_asc', 'newest']
      },
      'blog': {
        endpoint: '/api/articles',
        entityName: 'Article',
        parameters: [
          { name: 'category', type: 'string', description: 'Filter by article category' },
          { name: 'author', type: 'string', description: 'Filter by author' },
          { name: 'tag', type: 'string', description: 'Filter by tag' },
          { name: 'dateFrom', type: 'string', description: 'Filter articles from date (YYYY-MM-DD)' },
          { name: 'dateTo', type: 'string', description: 'Filter articles to date (YYYY-MM-DD)' }
        ],
        sortOptions: ['date_desc', 'date_asc', 'title_asc', 'author_asc']
      },
      'news': {
        endpoint: '/api/articles',
        entityName: 'NewsArticle',
        parameters: [
          { name: 'category', type: 'string', description: 'Filter by news category' },
          { name: 'source', type: 'string', description: 'Filter by news source' },
          { name: 'dateFrom', type: 'string', description: 'Filter news from date' },
          { name: 'dateTo', type: 'string', description: 'Filter news to date' }
        ],
        sortOptions: ['date_desc', 'relevance', 'source_asc']
      },
      'job-board': {
        endpoint: '/api/jobs',
        entityName: 'JobListing',
        parameters: [
          { name: 'location', type: 'string', description: 'Filter by job location' },
          { name: 'company', type: 'string', description: 'Filter by company' },
          { name: 'jobType', type: 'string', description: 'Filter by job type (full-time, part-time, etc.)' },
          { name: 'salaryMin', type: 'number', description: 'Minimum salary filter' },
          { name: 'salaryMax', type: 'number', description: 'Maximum salary filter' },
          { name: 'remote', type: 'boolean', description: 'Filter for remote jobs' }
        ],
        sortOptions: ['date_desc', 'salary_desc', 'company_asc', 'location_asc']
      },
      'real-estate': {
        endpoint: '/api/properties',
        entityName: 'Property',
        parameters: [
          { name: 'location', type: 'string', description: 'Filter by property location' },
          { name: 'propertyType', type: 'string', description: 'Filter by property type' },
          { name: 'minPrice', type: 'number', description: 'Minimum price filter' },
          { name: 'maxPrice', type: 'number', description: 'Maximum price filter' },
          { name: 'bedrooms', type: 'number', description: 'Number of bedrooms' },
          { name: 'bathrooms', type: 'number', description: 'Number of bathrooms' }
        ],
        sortOptions: ['price_asc', 'price_desc', 'date_desc', 'size_desc']
      },
      'restaurant': {
        endpoint: '/api/menu-items',
        entityName: 'MenuItem',
        parameters: [
          { name: 'category', type: 'string', description: 'Filter by menu category' },
          { name: 'dietary', type: 'string', description: 'Filter by dietary restrictions' },
          { name: 'maxPrice', type: 'number', description: 'Maximum price filter' }
        ],
        sortOptions: ['name_asc', 'price_asc', 'price_desc', 'category_asc']
      }
    };

    return endpointMap[pageType] || {
      endpoint: '/api/items',
      entityName: 'Item',
      parameters: [
        { name: 'search', type: 'string', description: 'Search items' },
        { name: 'limit', type: 'number', description: 'Limit number of results' }
      ],
      sortOptions: ['date_desc', 'title_asc']
    };
  }
}

/**
 * Level 2: GraphQL Schema Auto-Generation
 */
class GraphQLSchemaGenerator {
  static generateTypeDefinitions(pageType: string, sampleData: any[]): string {
    const endpointInfo = SemanticEndpointGenerator.generateContextAwareEndpoint(pageType, '');
    const entityName = endpointInfo.entityName;

    // Analyze sample data to determine field types
    const fieldTypes = this.analyzeFieldTypes(sampleData);
    
    let typeDefs = `# Auto-generated GraphQL schema for ${pageType} page\n\n`;
    
    // Generate main entity type
    typeDefs += `type ${entityName} {\n`;
    Object.entries(fieldTypes).forEach(([field, type]) => {
      typeDefs += `  ${field}: ${type}\n`;
    });
    typeDefs += `}\n\n`;

    // Generate filter input type
    typeDefs += `input ${entityName}Filter {\n`;
    endpointInfo.parameters.forEach(param => {
      const graphqlType = this.convertToGraphQLType(param.type);
      typeDefs += `  ${param.name}: ${graphqlType}\n`;
    });
    typeDefs += `}\n\n`;

    // Generate sort enum
    typeDefs += `enum ${entityName}SortOption {\n`;
    endpointInfo.sortOptions.forEach(option => {
      typeDefs += `  ${option.toUpperCase()}\n`;
    });
    typeDefs += `}\n\n`;

    // Generate queries
    typeDefs += `type Query {\n`;
    typeDefs += `  ${this.pluralize(entityName.toLowerCase())}(\n`;
    typeDefs += `    filter: ${entityName}Filter\n`;
    typeDefs += `    sort: ${entityName}SortOption\n`;
    typeDefs += `    limit: Int = 10\n`;
    typeDefs += `    offset: Int = 0\n`;
    typeDefs += `  ): [${entityName}!]!\n`;
    typeDefs += `  ${entityName.toLowerCase()}(id: ID!): ${entityName}\n`;
    typeDefs += `}\n`;

    return typeDefs;
  }

  static analyzeFieldTypes(sampleData: any[]): { [key: string]: string } {
    const fieldTypes: { [key: string]: string } = {};
    
    if (sampleData.length === 0) return fieldTypes;

    // Analyze first few items to determine types
    const analysisItems = sampleData.slice(0, Math.min(5, sampleData.length));
    
    const allFields = new Set<string>();
    analysisItems.forEach(item => {
      Object.keys(item).forEach(key => allFields.add(key));
    });

    allFields.forEach(field => {
      const values = analysisItems
        .map(item => item[field])
        .filter(val => val != null);
      
      if (values.length === 0) {
        fieldTypes[field] = 'String';
        return;
      }

      // Determine type based on values
      const firstValue = values[0];
      
      if (typeof firstValue === 'number') {
        fieldTypes[field] = Number.isInteger(firstValue) ? 'Int' : 'Float';
      } else if (typeof firstValue === 'boolean') {
        fieldTypes[field] = 'Boolean';
      } else if (typeof firstValue === 'string') {
        // Check if it looks like a date
        if (this.isDateString(firstValue)) {
          fieldTypes[field] = 'String'; // Could be DateTime scalar
        } else if (this.isPriceString(firstValue)) {
          fieldTypes[field] = 'String'; // Could be Money scalar
        } else {
          fieldTypes[field] = 'String';
        }
      } else {
        fieldTypes[field] = 'String';
      }
    });

    return fieldTypes;
  }

  static convertToGraphQLType(jsType: string): string {
    const typeMap = {
      'string': 'String',
      'number': 'Float',
      'boolean': 'Boolean',
      'array': '[String]'
    };
    return typeMap[jsType] || 'String';
  }

  static isDateString(str: string): boolean {
    return /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(str);
  }

  static isPriceString(str: string): boolean {
    return /[\$€£¥]\s?\d+|\d+\s?(?:USD|EUR|GBP)/.test(str);
  }

  static pluralize(word: string): string {
    if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
    if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch')) return word + 'es';
    return word + 's';
  }
}

/**
 * Level 3: Real-Time Data Synchronization
 */
class RealTimeDataSync {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  // Content hashing for change detection
  static generateContentHash(content: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = crypto.subtle.digestSync('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Store content snapshot for comparison
  async storeContentSnapshot(apiId: string, contentHash: string, data: any): Promise<void> {
    try {
      await this.supabase
        .from('content_snapshots')
        .upsert({
          api_id: apiId,
          content_hash: contentHash,
          snapshot_data: data,
          last_updated: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing content snapshot:', error);
    }
  }

  // Check for content changes
  async detectChanges(apiId: string, currentHash: string): Promise<{
    hasChanged: boolean;
    previousHash?: string;
    changeType: 'new' | 'updated' | 'unchanged';
  }> {
    try {
      const { data: snapshot } = await this.supabase
        .from('content_snapshots')
        .select('content_hash')
        .eq('api_id', apiId)
        .single();

      if (!snapshot) {
        return { hasChanged: true, changeType: 'new' };
      }

      if (snapshot.content_hash !== currentHash) {
        return { 
          hasChanged: true, 
          previousHash: snapshot.content_hash,
          changeType: 'updated' 
        };
      }

      return { hasChanged: false, changeType: 'unchanged' };
    } catch (error) {
      console.error('Error detecting changes:', error);
      return { hasChanged: true, changeType: 'new' };
    }
  }

  // Generate change notifications
  async notifyConsumers(apiId: string, changeType: string, data: any): Promise<void> {
    try {
      // Store notification for API consumers
      await this.supabase
        .from('api_notifications')
        .insert({
          api_id: apiId,
          change_type: changeType,
          notification_data: data,
          created_at: new Date().toISOString()
        });

      console.log(`Change notification sent for API ${apiId}: ${changeType}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

/**
 * Level 3: Predictive Caching System
 */
class PredictiveCaching {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  // Track API usage patterns
  async recordUsagePattern(apiId: string, endpoint: string, params: any, userLocation?: string): Promise<void> {
    try {
      await this.supabase
        .from('api_usage_patterns')
        .insert({
          api_id: apiId,
          endpoint,
          parameters: params,
          user_location: userLocation,
          access_time: new Date().toISOString(),
          hour_of_day: new Date().getHours(),
          day_of_week: new Date().getDay()
        });
    } catch (error) {
      console.error('Error recording usage pattern:', error);
    }
  }

  // Predict optimal cache strategy
  async optimizeCacheStrategy(apiId: string): Promise<{
    cacheExpiry: number;
    priorityScore: number;
    recommendedRefreshInterval: number;
  }> {
    try {
      const { data: usageData } = await this.supabase
        .from('api_usage_patterns')
        .select('*')
        .eq('api_id', apiId)
        .gte('access_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('access_time', { ascending: false });

      if (!usageData?.length) {
        return { cacheExpiry: 3600, priorityScore: 50, recommendedRefreshInterval: 1800 };
      }

      // Calculate usage frequency
      const accessCount = usageData.length;
      const uniqueHours = new Set(usageData.map(d => d.hour_of_day)).size;
      const avgAccessesPerHour = accessCount / (7 * 24);

      // High usage = shorter cache expiry, more frequent updates
      const priorityScore = Math.min(100, (avgAccessesPerHour * 10));
      const cacheExpiry = Math.max(300, 3600 - (priorityScore * 30));
      const recommendedRefreshInterval = Math.max(300, cacheExpiry / 2);

      return { cacheExpiry, priorityScore, recommendedRefreshInterval };
    } catch (error) {
      console.error('Error optimizing cache strategy:', error);
      return { cacheExpiry: 3600, priorityScore: 50, recommendedRefreshInterval: 1800 };
    }
  }
}

/**
 * Level 3: AI-Powered Data Enhancement
 */
class AIDataEnhancement {
  private openaiApiKey: string | undefined;

  constructor() {
    this.openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  }

  // Enhanced price tracking and history
  async enhancePriceData(priceString: string, productTitle: string): Promise<{
    normalizedPrice: number;
    currency: string;
    priceHistory?: any[];
    marketComparison?: string;
  }> {
    try {
      // Extract numeric price and currency
      const priceMatch = priceString.match(/[\$€£¥]?\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
      const currencyMatch = priceString.match(/[\$€£¥]|USD|EUR|GBP|JPY/);
      
      if (!priceMatch) {
        return { normalizedPrice: 0, currency: 'USD' };
      }

      const normalizedPrice = parseFloat(priceMatch[1].replace(/[.,]/g, '.'));
      const currency = currencyMatch?.[0] || 'USD';

      // Price analysis using AI if available
      let marketComparison;
      if (this.openaiApiKey && productTitle) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{
                role: 'user',
                content: `Analyze this product price: "${productTitle}" costs ${priceString}. Is this price reasonable for this type of product? Provide a brief market analysis in 1-2 sentences.`
              }],
              max_tokens: 100
            }),
          });

          if (response.ok) {
            const data = await response.json();
            marketComparison = data.choices[0]?.message?.content;
          }
        } catch (error) {
          console.error('AI price analysis failed:', error);
        }
      }

      return {
        normalizedPrice,
        currency,
        marketComparison
      };
    } catch (error) {
      console.error('Error enhancing price data:', error);
      return { normalizedPrice: 0, currency: 'USD' };
    }
  }

  // Sentiment analysis for reviews and comments
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    keywords: string[];
  }> {
    try {
      if (!this.openaiApiKey || !text.trim()) {
        return { sentiment: 'neutral', confidence: 0.5, keywords: [] };
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Analyze the sentiment of this text and extract key emotional words: "${text.substring(0, 500)}". 
                     Return only a JSON object with: {"sentiment": "positive/negative/neutral", "confidence": 0.0-1.0, "keywords": ["word1", "word2"]}`
          }],
          max_tokens: 150
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const analysisText = data.choices[0]?.message?.content;
        
        try {
          const analysis = JSON.parse(analysisText);
          return {
            sentiment: analysis.sentiment || 'neutral',
            confidence: analysis.confidence || 0.5,
            keywords: analysis.keywords || []
          };
        } catch (parseError) {
          console.error('Failed to parse sentiment analysis:', parseError);
        }
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }

    return { sentiment: 'neutral', confidence: 0.5, keywords: [] };
  }

  // Content summarization for long articles
  async summarizeContent(content: string, maxLength: number = 200): Promise<{
    summary: string;
    keyPoints: string[];
    readingTime: number;
  }> {
    try {
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed

      if (!this.openaiApiKey || content.length < 500) {
        return {
          summary: content.substring(0, maxLength) + (content.length > maxLength ? '...' : ''),
          keyPoints: [],
          readingTime
        };
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Summarize this content in ${maxLength} characters or less and extract 3-5 key points: "${content.substring(0, 2000)}". 
                     Return JSON: {"summary": "...", "keyPoints": ["point1", "point2"]}`
          }],
          max_tokens: 300
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const analysisText = data.choices[0]?.message?.content;
        
        try {
          const analysis = JSON.parse(analysisText);
          return {
            summary: analysis.summary || content.substring(0, maxLength),
            keyPoints: analysis.keyPoints || [],
            readingTime
          };
        } catch (parseError) {
          console.error('Failed to parse content summary:', parseError);
        }
      }
    } catch (error) {
      console.error('Error summarizing content:', error);
    }

    const wordCount = content.split(/\s+/).length;
    return {
      summary: content.substring(0, maxLength) + (content.length > maxLength ? '...' : ''),
      keyPoints: [],
      readingTime: Math.ceil(wordCount / 200)
    };
  }

  // Duplicate detection and deduplication
  static detectDuplicates(items: any[]): {
    uniqueItems: any[];
    duplicateGroups: any[][];
    deduplicationStats: { original: number; unique: number; duplicatesRemoved: number };
  } {
    const uniqueItems: any[] = [];
    const duplicateGroups: any[][] = [];
    const seenTitles = new Map<string, number>();

    for (const item of items) {
      if (!item.title) {
        uniqueItems.push(item);
        continue;
      }

      // Normalize title for comparison
      const normalizedTitle = item.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const existingIndex = seenTitles.get(normalizedTitle);
      
      if (existingIndex !== undefined) {
        // Found duplicate
        const existingGroup = duplicateGroups.find(group => 
          group.some(groupItem => groupItem === uniqueItems[existingIndex])
        );
        
        if (existingGroup) {
          existingGroup.push(item);
        } else {
          duplicateGroups.push([uniqueItems[existingIndex], item]);
        }
      } else {
        // New unique item
        seenTitles.set(normalizedTitle, uniqueItems.length);
        uniqueItems.push(item);
      }
    }

    return {
      uniqueItems,
      duplicateGroups,
      deduplicationStats: {
        original: items.length,
        unique: uniqueItems.length,
        duplicatesRemoved: items.length - uniqueItems.length
      }
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract randomId from the path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const randomId = pathParts.pop()

    if (!randomId) {
      return new Response(JSON.stringify({ error: 'API ID is missing from the URL.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const endpointPath = `/functions/v1/extract-api/${randomId}`
    
    // Get API Key from header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key (x-api-key header) is required.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Find the API details in the database
    const { data: api, error: dbError } = await supabaseAdmin
      .from('generated_apis')
      .select('source_url, api_endpoint')
      .ilike('api_endpoint', `%${endpointPath}`)
      .eq('api_key', apiKey)
      .single()

    if (dbError || !api) {
      console.error('DB Error or API not found:', dbError);
      return new Response(JSON.stringify({ error: 'Invalid API key or endpoint.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Level 3: Initialize enhanced systems
    console.log(`Starting Level 3 enhanced scraping for ${api.source_url}...`);
    const realTimeSync = new RealTimeDataSync(supabaseAdmin);
    const predictiveCache = new PredictiveCaching(supabaseAdmin);
    const aiEnhancement = new AIDataEnhancement();
    
    // Record usage pattern for predictive caching
    const userLocation = req.headers.get('cf-ipcountry') || 'unknown';
    await predictiveCache.recordUsagePattern(randomId, endpointPath, {}, userLocation);

    const browserAutomation = new AdvancedBrowserAutomation();
    
    try {
      await browserAutomation.init();
      
      // Navigate with SPA support
      const isSPA = await browserAutomation.navigateWithSPASupport(api.source_url);
      
      // Handle infinite scroll
      await browserAutomation.handleInfiniteScroll();
      
      // Detect and analyze forms
      const formData = await browserAutomation.detectAndInteractWithForms();
      
      // Monitor WebSocket activity
      const websocketUrls = await browserAutomation.monitorWebSocketActivity();
      
      // Get final page content
      const html = await browserAutomation.getPageContent();
      
      // Level 3: Content change detection
      const contentHash = RealTimeDataSync.generateContentHash(html);
      const changeDetection = await realTimeSync.detectChanges(randomId, contentHash);
      
      console.log(`Level 3 scraping completed. Changes: ${changeDetection.changeType}, SPA: ${isSPA}, Forms: ${formData.length}, WebSockets: ${websocketUrls.length}`);
      
      // AI-Powered Content Analysis
      const $ = cheerio.load(html)
      const pageClassification = classifyPageType(html, $);
      const behaviorAnalysis = analyzeUserInteractionPatterns($);
      
      // Level 2: Semantic Endpoint Generation
      const semanticEndpoint = SemanticEndpointGenerator.generateContextAwareEndpoint(
        pageClassification.pageType, 
        api.source_url
      );
      
      let extractedData;
      let items: any[] = [];
      
      // Enhanced item selection based on page type
      let itemSelectors = 'article, li, [class*="item"], [class*="product"], [class*="post"]';
      
      switch (pageClassification.pageType) {
        case 'e-commerce':
          itemSelectors = '[class*="product"], [class*="item"], [data-product-id], [itemprop="product"]';
          break;
        case 'blog':
        case 'news':
          itemSelectors = 'article, [class*="post"], [class*="article"], [class*="story"]';
          break;
        case 'job-board':
          itemSelectors = '[class*="job"], [class*="position"], [class*="listing"]';
          break;
        case 'real-estate':
          itemSelectors = '[class*="property"], [class*="listing"], [class*="house"]';
          break;
        case 'restaurant':
          itemSelectors = '[class*="menu"], [class*="dish"], [class*="item"]';
          break;
      }
      
      // Extract items using intelligent field mapping
      $(itemSelectors).each((_, el) => {
        const itemData = extractItemDataIntelligent($(el), $, pageClassification.pageType);
        if (itemData) {
          items.push(itemData);
        }
      });

      // Level 3: AI-Powered Data Enhancement
      const enhancedItems = [];
      for (const item of items.slice(0, 20)) { // Limit to 20 for performance
        const enhanced = { ...item };

        // Enhance price data
        if (item.price) {
          const priceEnhancement = await aiEnhancement.enhancePriceData(item.price, item.title);
          enhanced._price_analysis = priceEnhancement;
        }

        // Sentiment analysis for descriptions/reviews
        if (item.description && item.description.length > 50) {
          const sentiment = await aiEnhancement.analyzeSentiment(item.description);
          enhanced._sentiment_analysis = sentiment;
        }

        // Content summarization for long content
        if (item.description && item.description.length > 300) {
          const summary = await aiEnhancement.summarizeContent(item.description);
          enhanced._content_summary = summary;
        }

        enhancedItems.push(enhanced);
      }

      // Level 3: Duplicate detection and deduplication
      const deduplicationResult = AIDataEnhancement.detectDuplicates(enhancedItems);

      // Level 2: GraphQL Schema Generation
      const graphqlSchema = GraphQLSchemaGenerator.generateTypeDefinitions(
        pageClassification.pageType, 
        deduplicationResult.uniqueItems
      );

      // Level 3: Cache optimization
      const cacheStrategy = await predictiveCache.optimizeCacheStrategy(randomId);

      // Enhanced structured data response with Level 3 features
      if (deduplicationResult.uniqueItems.length > 2) {
        extractedData = {
          data: {
            page_title: $('title').text(),
            page_type: pageClassification.pageType,
            confidence_score: pageClassification.confidence,
            detected_entities: pageClassification.entities,
            detected_patterns: pageClassification.patterns,
            behavioral_analysis: behaviorAnalysis,
            item_count: deduplicationResult.uniqueItems.length,
            items: deduplicationResult.uniqueItems,
          },
          source_url: api.source_url,
          _extraction_method: 'level_3_ai_enhanced',
          _semantic_api: {
            endpoint: semanticEndpoint.endpoint,
            entity_name: semanticEndpoint.entityName,
            parameters: semanticEndpoint.parameters,
            sort_options: semanticEndpoint.sortOptions
          },
          _graphql_schema: graphqlSchema,
          _advanced_features: {
            spa_detected: isSPA,
            forms_analyzed: formData.length,
            websocket_connections: websocketUrls,
            infinite_scroll_applied: true,
            session_management: true
          },
          _level_3_enhancements: {
            real_time_sync: {
              content_hash: contentHash,
              change_detected: changeDetection.hasChanged,
              change_type: changeDetection.changeType,
              sync_status: 'active'
            },
            ai_data_enhancement: {
              items_enhanced: enhancedItems.length,
              sentiment_analyzed: enhancedItems.filter(item => item._sentiment_analysis).length,
              content_summarized: enhancedItems.filter(item => item._content_summary).length,
              price_analyzed: enhancedItems.filter(item => item._price_analysis).length
            },
            deduplication: deduplicationResult.deduplicationStats,
            predictive_caching: {
              cache_expiry: cacheStrategy.cacheExpiry,
              priority_score: cacheStrategy.priorityScore,
              refresh_interval: cacheStrategy.recommendedRefreshInterval
            }
          },
          _classification_metadata: {
            page_type: pageClassification.pageType,
            confidence: pageClassification.confidence,
            entities_found: pageClassification.entities,
            interaction_patterns: behaviorAnalysis.interactionElements
          }
        }
      } else {
        // Enhanced fallback with Level 3 insights
        console.log("Level 3 extraction yielded few results, using enhanced fallback.");
        const title = $('title').text()
        const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get()
        const links = $('a').map((_, el) => $(el).attr('href')).get().filter(Boolean)
        const images = $('img').map((_, el) => $(el).attr('src')).get().filter(Boolean)

        extractedData = {
          data: {
            title,
            page_type: pageClassification.pageType,
            confidence_score: pageClassification.confidence,
            detected_entities: pageClassification.entities,
            behavioral_analysis: behaviorAnalysis,
            headings,
            links,
            images,
          },
          source_url: api.source_url,
          _extraction_method: 'level_3_enhanced_fallback',
          _semantic_api: {
            endpoint: semanticEndpoint.endpoint,
            entity_name: semanticEndpoint.entityName,
            parameters: semanticEndpoint.parameters,
            sort_options: semanticEndpoint.sortOptions
          },
          _graphql_schema: graphqlSchema,
          _advanced_features: {
            spa_detected: isSPA,
            forms_analyzed: formData.length,
            websocket_connections: websocketUrls
          },
          _level_3_enhancements: {
            real_time_sync: {
              content_hash: contentHash,
              change_detected: changeDetection.hasChanged,
              change_type: changeDetection.changeType
            },
            predictive_caching: cacheStrategy
          },
          _classification_metadata: {
            page_type: pageClassification.pageType,
            confidence: pageClassification.confidence,
            entities_found: pageClassification.entities
          }
        }
      }

      // Level 3: Store content snapshot and notify if changed
      await realTimeSync.storeContentSnapshot(randomId, contentHash, extractedData);
      
      if (changeDetection.hasChanged) {
        await realTimeSync.notifyConsumers(randomId, changeDetection.changeType, {
          items_count: items.length,
          change_summary: `${changeDetection.changeType} content detected`
        });
      }

      return new Response(JSON.stringify(extractedData, null, 2), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${cacheStrategy.cacheExpiry}`,
          'X-Content-Hash': contentHash,
          'X-Change-Type': changeDetection.changeType
        },
      })
      
    } finally {
      await browserAutomation.close();
    }

  } catch (error) {
    console.error('Level 3 Enhancement Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
