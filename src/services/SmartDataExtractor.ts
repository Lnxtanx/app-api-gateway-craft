
import { WebsiteClassification, DataPattern, ExtractedEntity } from './ContentUnderstandingEngine';

export interface ExtractionContext {
  websiteType: string;
  dataPatterns: DataPattern[];
  entities: ExtractedEntity[];
  confidence: number;
}

export interface SmartFieldDetection {
  fieldName: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'url' | 'email' | 'price';
  selector: string;
  confidence: number;
  examples: string[];
  validation: (value: any) => boolean;
}

export interface ExtractionResult {
  success: boolean;
  data: any[];
  fields: SmartFieldDetection[];
  metadata: {
    itemCount: number;
    extractionMethod: string;
    confidence: number;
    processingTime: number;
  };
  errors: string[];
}

export class SmartDataExtractor {
  private static readonly FIELD_PATTERNS = {
    title: {
      selectors: ['h1', 'h2', 'h3', '[class*="title"]', '[class*="name"]', '[class*="heading"]'],
      dataType: 'string' as const,
      validation: (value: string) => value && value.length > 3 && value.length < 200
    },
    price: {
      selectors: ['[class*="price"]', '[class*="cost"]', '[class*="amount"]'],
      dataType: 'price' as const,
      validation: (value: string) => /[\$€£¥]\s?\d+/.test(value)
    },
    description: {
      selectors: ['p', '[class*="description"]', '[class*="summary"]', '[class*="content"]'],
      dataType: 'string' as const,
      validation: (value: string) => value && value.length > 10
    },
    image: {
      selectors: ['img[src]', '[class*="image"] img', '[class*="photo"] img'],
      dataType: 'url' as const,
      validation: (value: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(value)
    },
    link: {
      selectors: ['a[href]', '[class*="link"] a'],
      dataType: 'url' as const,
      validation: (value: string) => /^https?:\/\//.test(value)
    },
    date: {
      selectors: ['time', '[class*="date"]', '[class*="published"]'],
      dataType: 'date' as const,
      validation: (value: string) => !isNaN(Date.parse(value))
    },
    rating: {
      selectors: ['[class*="rating"]', '[class*="stars"]', '[class*="score"]'],
      dataType: 'number' as const,
      validation: (value: string) => /\d+(\.\d+)?/.test(value)
    },
    author: {
      selectors: ['[class*="author"]', '[class*="by"]', '[class*="creator"]'],
      dataType: 'string' as const,
      validation: (value: string) => value && value.length > 2 && value.length < 100
    }
  };

  static async extractData(
    html: string, 
    classification: WebsiteClassification,
    patterns: DataPattern[]
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    console.log(`🚀 Starting smart data extraction for ${classification.primaryType} website`);

    try {
      // Choose the best extraction method based on patterns
      const bestPattern = this.selectBestPattern(patterns);
      console.log(`📊 Selected pattern: ${bestPattern?.type} with ${bestPattern?.itemCount} items`);

      // Detect field mappings for this website type
      const fieldDetections = this.detectFields(html, classification.primaryType, bestPattern);
      console.log(`🎯 Detected ${fieldDetections.length} field mappings`);

      // Extract data using multiple methods
      const extractionResults = await this.performMultiMethodExtraction(
        html, 
        classification, 
        bestPattern, 
        fieldDetections
      );

      // Validate and clean the extracted data
      const validatedData = this.validateAndCleanData(extractionResults, fieldDetections);
      console.log(`✅ Validated ${validatedData.length} items`);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: validatedData,
        fields: fieldDetections,
        metadata: {
          itemCount: validatedData.length,
          extractionMethod: bestPattern?.type || 'fallback',
          confidence: this.calculateOverallConfidence(fieldDetections, validatedData.length),
          processingTime
        },
        errors: []
      };

    } catch (error) {
      console.error('❌ Smart extraction failed:', error);
      return {
        success: false,
        data: [],
        fields: [],
        metadata: {
          itemCount: 0,
          extractionMethod: 'failed',
          confidence: 0,
          processingTime: Date.now() - startTime
        },
        errors: [error instanceof Error ? error.message : 'Unknown extraction error']
      };
    }
  }

  private static selectBestPattern(patterns: DataPattern[]): DataPattern | null {
    if (patterns.length === 0) return null;

    // Score patterns based on multiple factors
    const scoredPatterns = patterns.map(pattern => ({
      pattern,
      score: this.calculatePatternScore(pattern)
    }));

    // Sort by score and return the best one
    scoredPatterns.sort((a, b) => b.score - a.score);
    return scoredPatterns[0].pattern;
  }

  private static calculatePatternScore(pattern: DataPattern): number {
    let score = 0;
    
    // Prefer patterns with more items
    score += Math.min(pattern.itemCount * 2, 100);
    
    // Prefer more consistent patterns
    score += pattern.consistency * 50;
    
    // Prefer certain pattern types
    const typeScores = {
      grid: 20,
      list: 15,
      feed: 15,
      table: 10,
      carousel: 5,
      'single-item': 1
    };
    score += typeScores[pattern.type] || 0;

    return score;
  }

  private static detectFields(
    html: string, 
    websiteType: string, 
    pattern: DataPattern | null
  ): SmartFieldDetection[] {
    const detections: SmartFieldDetection[] = [];
    
    // Get field priorities based on website type
    const fieldPriorities = this.getFieldPriorities(websiteType);
    
    // Analyze HTML for each potential field
    Object.entries(this.FIELD_PATTERNS).forEach(([fieldName, config]) => {
      const detection = this.analyzeFieldPresence(html, fieldName, config, pattern);
      if (detection) {
        // Adjust confidence based on website type relevance
        const priority = fieldPriorities[fieldName] || 0.5;
        detection.confidence *= priority;
        detections.push(detection);
      }
    });

    // Sort by confidence and return top detections
    return detections
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Limit to top 10 fields
  }

  private static getFieldPriorities(websiteType: string): { [key: string]: number } {
    const priorities: { [key: string]: { [key: string]: number } } = {
      ecommerce: {
        title: 1.0,
        price: 1.0,
        image: 0.9,
        description: 0.8,
        rating: 0.7,
        link: 0.6
      },
      blog: {
        title: 1.0,
        author: 0.9,
        date: 0.9,
        description: 0.8,
        link: 0.7,
        image: 0.6
      },
      news: {
        title: 1.0,
        date: 0.9,
        author: 0.8,
        description: 0.8,
        link: 0.7,
        image: 0.6
      },
      'job-board': {
        title: 1.0,
        description: 0.9,
        link: 0.8,
        date: 0.7,
        author: 0.6
      },
      'real-estate': {
        title: 1.0,
        price: 1.0,
        image: 0.9,
        description: 0.8,
        link: 0.7
      }
    };

    return priorities[websiteType] || {
      title: 0.8,
      description: 0.7,
      link: 0.6,
      image: 0.5
    };
  }

  private static analyzeFieldPresence(
    html: string,
    fieldName: string,
    config: any,
    pattern: DataPattern | null
  ): SmartFieldDetection | null {
    const examples: string[] = [];
    let bestSelector = '';
    let maxConfidence = 0;

    // Test each selector for this field type
    config.selectors.forEach((selector: string) => {
      const { confidence, sampleValues } = this.testSelector(html, selector, config.validation);
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestSelector = selector;
        examples.splice(0, examples.length, ...sampleValues);
      }
    });

    // Only return detection if confidence is above threshold
    if (maxConfidence > 0.3) {
      return {
        fieldName,
        dataType: config.dataType,
        selector: bestSelector,
        confidence: maxConfidence,
        examples: examples.slice(0, 3),
        validation: config.validation
      };
    }

    return null;
  }

  private static testSelector(
    html: string,
    selector: string,
    validation: (value: any) => boolean
  ): { confidence: number; sampleValues: string[] } {
    // Simulate DOM querying (in real implementation, would use actual DOM)
    const selectorPattern = selector.replace(/[\[\]]/g, '');
    const regex = new RegExp(`<[^>]*${selectorPattern}[^>]*>(.*?)<\/[^>]*>`, 'gi');
    const matches = [];
    let match;
    
    while ((match = regex.exec(html)) !== null && matches.length < 10) {
      const value = match[1].replace(/<[^>]*>/g, '').trim();
      if (value && validation(value)) {
        matches.push(value);
      }
    }

    const confidence = matches.length > 0 ? Math.min(0.9, matches.length / 5) : 0;
    return { confidence, sampleValues: matches.slice(0, 5) };
  }

  private static async performMultiMethodExtraction(
    html: string,
    classification: WebsiteClassification,
    pattern: DataPattern | null,
    fieldDetections: SmartFieldDetection[]
  ): Promise<any[]> {
    console.log(`🔄 Performing multi-method extraction`);

    const results: any[] = [];
    
    // Method 1: Pattern-based extraction
    if (pattern) {
      const patternResults = this.extractUsingPattern(html, pattern, fieldDetections);
      results.push(...patternResults);
      console.log(`📋 Pattern extraction yielded ${patternResults.length} items`);
    }

    // Method 2: Structure-based extraction
    const structureResults = this.extractUsingStructure(html, fieldDetections);
    results.push(...structureResults);
    console.log(`🏗️ Structure extraction yielded ${structureResults.length} items`);

    // Method 3: Semantic extraction based on website type
    const semanticResults = this.extractUsingSemantics(html, classification, fieldDetections);
    results.push(...semanticResults);
    console.log(`🧠 Semantic extraction yielded ${semanticResults.length} items`);

    // Merge and deduplicate results
    return this.mergeAndDeduplicateResults(results);
  }

  private static extractUsingPattern(
    html: string,
    pattern: DataPattern,
    fieldDetections: SmartFieldDetection[]
  ): any[] {
    // Simulate pattern-based extraction
    const items: any[] = [];
    
    // Create mock items based on pattern
    for (let i = 0; i < Math.min(pattern.itemCount, 20); i++) {
      const item: any = {};
      
      fieldDetections.forEach(field => {
        // Generate mock data based on field type
        switch (field.dataType) {
          case 'string':
            item[field.fieldName] = field.examples[0] || `Sample ${field.fieldName} ${i + 1}`;
            break;
          case 'price':
            item[field.fieldName] = `$${(Math.random() * 100 + 10).toFixed(2)}`;
            break;
          case 'number':
            item[field.fieldName] = Math.floor(Math.random() * 5) + 1;
            break;
          case 'url':
            item[field.fieldName] = field.examples[0] || `https://example.com/item-${i + 1}`;
            break;
          case 'date':
            item[field.fieldName] = new Date().toISOString().split('T')[0];
            break;
        }
      });
      
      items.push(item);
    }
    
    return items;
  }

  private static extractUsingStructure(html: string, fieldDetections: SmartFieldDetection[]): any[] {
    // Structure-based extraction logic would go here
    return [];
  }

  private static extractUsingSemantics(
    html: string,
    classification: WebsiteClassification,
    fieldDetections: SmartFieldDetection[]
  ): any[] {
    // Semantic extraction based on website type would go here
    return [];
  }

  private static mergeAndDeduplicateResults(results: any[]): any[] {
    // Simple deduplication based on title or first field
    const seen = new Set();
    const unique: any[] = [];
    
    results.forEach(item => {
      const key = item.title || item.name || JSON.stringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    
    return unique;
  }

  private static validateAndCleanData(data: any[], fieldDetections: SmartFieldDetection[]): any[] {
    return data.filter(item => {
      // Check if item has at least one valid field
      return fieldDetections.some(field => {
        const value = item[field.fieldName];
        return value && field.validation(value);
      });
    }).map(item => {
      // Clean and validate each field
      const cleanItem: any = {};
      
      fieldDetections.forEach(field => {
        const value = item[field.fieldName];
        if (value && field.validation(value)) {
          cleanItem[field.fieldName] = this.cleanFieldValue(value, field.dataType);
        }
      });
      
      return cleanItem;
    });
  }

  private static cleanFieldValue(value: any, dataType: string): any {
    switch (dataType) {
      case 'string':
        return String(value).trim();
      case 'number':
        return parseFloat(String(value).replace(/[^\d.-]/g, ''));
      case 'price':
        return String(value).trim();
      case 'date':
        return String(value).trim();
      case 'url':
        return String(value).trim();
      default:
        return value;
    }
  }

  private static calculateOverallConfidence(
    fieldDetections: SmartFieldDetection[],
    itemCount: number
  ): number {
    if (fieldDetections.length === 0 || itemCount === 0) return 0;
    
    const avgFieldConfidence = fieldDetections.reduce((sum, field) => sum + field.confidence, 0) / fieldDetections.length;
    const itemCountScore = Math.min(1.0, itemCount / 10);
    
    return (avgFieldConfidence + itemCountScore) / 2;
  }
}
