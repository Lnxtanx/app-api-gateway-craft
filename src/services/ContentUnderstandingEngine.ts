
import { supabase } from '@/integrations/supabase/client';

export interface WebsiteClassification {
  primaryType: 'ecommerce' | 'blog' | 'news' | 'job-board' | 'real-estate' | 'restaurant' | 'social' | 'directory' | 'forum' | 'documentation' | 'unknown';
  confidence: number;
  indicators: string[];
  subCategories: string[];
}

export interface DataPattern {
  type: 'list' | 'grid' | 'table' | 'feed' | 'carousel' | 'single-item';
  selector: string;
  itemCount: number;
  consistency: number;
  examples: any[];
}

export interface ExtractedEntity {
  type: 'price' | 'title' | 'description' | 'date' | 'rating' | 'author' | 'location' | 'phone' | 'email' | 'url' | 'image';
  value: string;
  confidence: number;
  element: string;
  position: { x: number; y: number };
}

export interface ContentHierarchy {
  parentChild: { parent: string; children: string[] }[];
  relationships: { type: string; from: string; to: string }[];
  groupings: { category: string; items: string[] }[];
}

export class ContentUnderstandingEngine {
  private static readonly CLASSIFICATION_INDICATORS = {
    ecommerce: {
      keywords: ['shop', 'buy', 'cart', 'checkout', 'product', 'price', 'add to cart', 'purchase', 'store', 'sale', 'discount'],
      selectors: ['[class*="product"]', '[class*="cart"]', '[class*="price"]', '[data-product]', '[class*="buy"]', '.add-to-cart'],
      patterns: [/\$\d+/, /cart/i, /checkout/i, /buy now/i],
      weight: 1.0
    },
    blog: {
      keywords: ['blog', 'post', 'article', 'author', 'published', 'read more', 'comments', 'tags', 'category'],
      selectors: ['article', '[class*="post"]', '[class*="blog"]', '[class*="article"]', '.entry-content'],
      patterns: [/posted on/i, /by author/i, /read more/i, /\d+ comments/i],
      weight: 0.9
    },
    news: {
      keywords: ['news', 'breaking', 'reporter', 'updated', 'latest', 'headline', 'story', 'breaking news'],
      selectors: ['[class*="news"]', '[class*="headline"]', '[class*="story"]', '[class*="article"]'],
      patterns: [/breaking/i, /updated/i, /\d+ hours ago/i, /live/i],
      weight: 0.9
    },
    'job-board': {
      keywords: ['job', 'career', 'hiring', 'apply', 'salary', 'employment', 'position', 'resume', 'remote'],
      selectors: ['[class*="job"]', '[class*="career"]', '[class*="position"]', '[class*="hiring"]'],
      patterns: [/\$\d+k/i, /remote/i, /full.?time/i, /apply now/i],
      weight: 0.95
    },
    'real-estate': {
      keywords: ['property', 'house', 'apartment', 'rent', 'sale', 'bedroom', 'bathroom', 'sqft', 'listing'],
      selectors: ['[class*="property"]', '[class*="listing"]', '[class*="house"]', '[class*="apartment"]'],
      patterns: [/\d+ bed/i, /\d+ bath/i, /\d+ sqft/i, /for sale/i, /for rent/i],
      weight: 0.95
    },
    restaurant: {
      keywords: ['menu', 'food', 'restaurant', 'order', 'delivery', 'cuisine', 'dish', 'reservation'],
      selectors: ['[class*="menu"]', '[class*="food"]', '[class*="dish"]', '[class*="restaurant"]'],
      patterns: [/menu/i, /order online/i, /delivery/i, /reservation/i],
      weight: 0.9
    }
  };

  static async classifyWebsite(html: string, url: string): Promise<WebsiteClassification> {
    const text = this.extractTextContent(html);
    const title = this.extractTitle(html);
    const metadata = this.extractMetadata(html);
    
    console.log(`🔍 Classifying website: ${url}`);
    
    const scores: { [key: string]: { score: number; indicators: string[] } } = {};
    
    // Initialize scores
    Object.keys(this.CLASSIFICATION_INDICATORS).forEach(type => {
      scores[type] = { score: 0, indicators: [] };
    });

    // Analyze each classification type
    for (const [type, config] of Object.entries(this.CLASSIFICATION_INDICATORS)) {
      // Keyword analysis
      const combinedText = `${title} ${text} ${metadata}`.toLowerCase();
      config.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = combinedText.match(regex);
        if (matches) {
          scores[type].score += matches.length * 2;
          scores[type].indicators.push(`keyword: ${keyword} (${matches.length}x)`);
        }
      });

      // Selector analysis (simulated - would need DOM in real implementation)
      config.selectors.forEach(selector => {
        if (html.includes(selector.replace(/[\[\]]/g, ''))) {
          scores[type].score += 5;
          scores[type].indicators.push(`selector: ${selector}`);
        }
      });

      // Pattern analysis
      config.patterns.forEach(pattern => {
        if (pattern.test(combinedText)) {
          scores[type].score += 3;
          scores[type].indicators.push(`pattern: ${pattern.source}`);
        }
      });

      // Apply weight
      scores[type].score *= config.weight;
    }

    // Find the highest scoring type
    const sortedTypes = Object.entries(scores)
      .sort(([,a], [,b]) => b.score - a.score);
    
    const [primaryType, topScore] = sortedTypes[0];
    const confidence = Math.min(0.95, Math.max(0.1, topScore.score / 20));

    console.log(`✅ Classified as: ${primaryType} (confidence: ${confidence.toFixed(2)})`);

    return {
      primaryType: primaryType as any,
      confidence,
      indicators: topScore.indicators.slice(0, 5), // Top 5 indicators
      subCategories: this.detectSubCategories(html, primaryType)
    };
  }

  static detectDataPatterns(html: string): DataPattern[] {
    const patterns: DataPattern[] = [];
    
    // Common list patterns
    const listPatterns = [
      { selector: 'ul > li', type: 'list' as const },
      { selector: 'ol > li', type: 'list' as const },
      { selector: '[class*="item"]', type: 'grid' as const },
      { selector: '[class*="product"]', type: 'grid' as const },
      { selector: '[class*="card"]', type: 'grid' as const },
      { selector: 'article', type: 'feed' as const },
      { selector: 'tr', type: 'table' as const }
    ];

    listPatterns.forEach(pattern => {
      // Simulate counting elements (would use actual DOM parsing in real implementation)
      const elementRegex = new RegExp(pattern.selector.replace(/[\[\]]/g, ''), 'gi');
      const matches = html.match(elementRegex) || [];
      
      if (matches.length > 2) {
        patterns.push({
          type: pattern.type,
          selector: pattern.selector,
          itemCount: matches.length,
          consistency: this.calculateConsistency(matches),
          examples: matches.slice(0, 3)
        });
      }
    });

    return patterns.sort((a, b) => b.itemCount - a.itemCount);
  }

  static extractEntities(html: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const text = this.extractTextContent(html);

    // Price extraction
    const priceRegex = /[\$€£¥]\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s?(?:USD|EUR|GBP|JPY|\$|€|£|¥)/gi;
    let match;
    while ((match = priceRegex.exec(text)) !== null) {
      entities.push({
        type: 'price',
        value: match[0],
        confidence: 0.9,
        element: 'price',
        position: { x: 0, y: 0 } // Would calculate actual position in real implementation
      });
    }

    // Date extraction
    const dateRegex = /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})\b/gi;
    while ((match = dateRegex.exec(text)) !== null) {
      entities.push({
        type: 'date',
        value: match[0],
        confidence: 0.8,
        element: 'date',
        position: { x: 0, y: 0 }
      });
    }

    // Email extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({
        type: 'email',
        value: match[0],
        confidence: 0.95,
        element: 'email',
        position: { x: 0, y: 0 }
      });
    }

    // Phone extraction
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.push({
        type: 'phone',
        value: match[0],
        confidence: 0.85,
        element: 'phone',
        position: { x: 0, y: 0 }
      });
    }

    // URL extraction
    const urlRegex = /https?:\/\/[^\s<>"]+/gi;
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({
        type: 'url',
        value: match[0],
        confidence: 0.9,
        element: 'url',
        position: { x: 0, y: 0 }
      });
    }

    console.log(`🎯 Extracted ${entities.length} entities`);
    return entities;
  }

  static analyzeContentHierarchy(html: string): ContentHierarchy {
    const hierarchy: ContentHierarchy = {
      parentChild: [],
      relationships: [],
      groupings: []
    };

    // Analyze heading structure
    const headingRegex = /<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: { level: number; text: string; position: number }[] = [];
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      headings.push({
        level: parseInt(match[1].slice(1)),
        text: match[2].replace(/<[^>]*>/g, '').trim(),
        position: match.index
      });
    }

    // Build hierarchy from headings
    for (let i = 0; i < headings.length - 1; i++) {
      const current = headings[i];
      const next = headings[i + 1];
      
      if (next.level > current.level) {
        hierarchy.parentChild.push({
          parent: current.text,
          children: [next.text]
        });
      }
    }

    // Detect common groupings
    const commonGroups = [
      { name: 'navigation', patterns: ['nav', 'menu', 'header'] },
      { name: 'content', patterns: ['main', 'content', 'article'] },
      { name: 'sidebar', patterns: ['sidebar', 'aside', 'widget'] },
      { name: 'footer', patterns: ['footer', 'bottom'] }
    ];

    commonGroups.forEach(group => {
      const items: string[] = [];
      group.patterns.forEach(pattern => {
        const regex = new RegExp(`class="[^"]*${pattern}[^"]*"`, 'gi');
        const matches = html.match(regex);
        if (matches) items.push(...matches);
      });
      
      if (items.length > 0) {
        hierarchy.groupings.push({
          category: group.name,
          items: items.slice(0, 5)
        });
      }
    });

    console.log(`🏗️ Analyzed content hierarchy: ${hierarchy.parentChild.length} relationships`);
    return hierarchy;
  }

  private static extractTextContent(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : '';
  }

  private static extractMetadata(html: string): string {
    const metaRegex = /<meta[^>]+content=["']([^"']+)["'][^>]*>/gi;
    const metaContent: string[] = [];
    let match;
    
    while ((match = metaRegex.exec(html)) !== null) {
      metaContent.push(match[1]);
    }
    
    return metaContent.join(' ');
  }

  private static detectSubCategories(html: string, primaryType: string): string[] {
    const subCategories: string[] = [];
    const text = this.extractTextContent(html).toLowerCase();

    const categoryMaps: { [key: string]: { [key: string]: string[] } } = {
      ecommerce: {
        'fashion': ['clothing', 'shoes', 'accessories', 'fashion', 'apparel'],
        'electronics': ['laptop', 'phone', 'computer', 'electronics', 'tech'],
        'home': ['furniture', 'home', 'kitchen', 'garden', 'decor'],
        'books': ['book', 'ebook', 'literature', 'reading'],
        'food': ['food', 'grocery', 'organic', 'snack']
      },
      blog: {
        'tech': ['technology', 'programming', 'software', 'coding'],
        'lifestyle': ['lifestyle', 'health', 'fitness', 'wellness'],
        'travel': ['travel', 'vacation', 'trip', 'destination'],
        'food': ['recipe', 'cooking', 'food', 'cuisine']
      }
    };

    const categories = categoryMaps[primaryType];
    if (categories) {
      Object.entries(categories).forEach(([category, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          subCategories.push(category);
        }
      });
    }

    return subCategories;
  }

  private static calculateConsistency(matches: RegExpMatchArray): number {
    // Simple consistency calculation based on match similarity
    if (matches.length < 2) return 1.0;
    
    let similaritySum = 0;
    for (let i = 0; i < matches.length - 1; i++) {
      const similarity = this.calculateStringSimilarity(matches[i], matches[i + 1]);
      similaritySum += similarity;
    }
    
    return similaritySum / (matches.length - 1);
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1.0;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLen);
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}
