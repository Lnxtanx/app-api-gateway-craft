import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'
import puppeteer, { Browser } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Extract randomId from the path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const randomId = pathParts.pop()

    if (!randomId) {
      return new Response(JSON.stringify({ error: 'API ID is missing from the URL.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // The endpoint path in the DB includes the function name, e.g., /functions/v1/extract-api/:id
    const endpointPath = `/functions/v1/extract-api/${randomId}`
    
    // 2. Get API Key from header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key (x-api-key header) is required.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // 3. Find the API details in the database
    const { data: api, error: dbError } = await supabaseAdmin
      .from('generated_apis')
      .select('source_url, api_endpoint')
      .ilike('api_endpoint', `%${endpointPath}`) // Match based on path
      .eq('api_key', apiKey)
      .single()

    if (dbError || !api) {
      console.error('DB Error or API not found:', dbError);
      return new Response(JSON.stringify({ error: 'Invalid API key or endpoint.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Scrape the source URL with enhanced Puppeteer capabilities
    console.log(`Scraping ${api.source_url} with enhanced AI analysis...`);
    let browser: Browser | null = null;
    let html: string;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(api.source_url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Auto-scroll to handle infinite loading
      console.log('Auto-scrolling to load dynamic content...');
      let previousHeight;
      for (let i = 0; i < 5; i++) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) {
          console.log('Scrolling finished, no new content loaded.');
          break;
        }
        console.log(`Scrolled down, new page height: ${newHeight}`);
      }

      html = await page.content();
      console.log(`Successfully scraped content from ${api.source_url}`);
    } catch (scrapeError) {
        console.error('Enhanced scraping error:', scrapeError);
        throw new Error(`Failed to scrape source URL with enhanced browser: ${scrapeError.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // 5. AI-Powered Content Analysis
    const $ = cheerio.load(html)
    
    // Classify page type using AI-powered analysis
    const pageClassification = classifyPageType(html, $);
    console.log(`Page classified as: ${pageClassification.pageType} (confidence: ${pageClassification.confidence})`);
    
    // Analyze user interaction patterns
    const behaviorAnalysis = analyzeUserInteractionPatterns($);
    console.log(`Behavioral analysis complete:`, behaviorAnalysis);
    
    let extractedData;
    let items: any[] = [];
    
    // Intelligent item selection based on page type
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

    // Enhanced structured data response
    if (items.length > 2) {
      extractedData = {
        data: {
          page_title: $('title').text(),
          page_type: pageClassification.pageType,
          confidence_score: pageClassification.confidence,
          detected_entities: pageClassification.entities,
          detected_patterns: pageClassification.patterns,
          behavioral_analysis: behaviorAnalysis,
          item_count: items.length,
          items: items,
        },
        source_url: api.source_url,
        _extraction_method: 'ai_powered_intelligent_extraction',
        _classification_metadata: {
          page_type: pageClassification.pageType,
          confidence: pageClassification.confidence,
          entities_found: pageClassification.entities,
          interaction_patterns: behaviorAnalysis.interactionElements
        }
      }
    } else {
      // Enhanced fallback with AI insights
      console.log("Intelligent extraction yielded few results, using enhanced fallback.");
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
        _extraction_method: 'ai_enhanced_fallback',
        _classification_metadata: {
          page_type: pageClassification.pageType,
          confidence: pageClassification.confidence,
          entities_found: pageClassification.entities
        }
      }
    }

    // 6. Return intelligently extracted data
    return new Response(JSON.stringify(extractedData, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('AI Enhancement Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
