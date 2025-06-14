
export interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  overall: number;
}

export interface QualityIssue {
  type: 'missing' | 'invalid' | 'duplicate' | 'inconsistent' | 'malformed';
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion?: string;
  autoFixable: boolean;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'enum' | 'custom';
  params: any;
  message: string;
  autoFix?: (value: any) => any;
}

export interface QualityReport {
  metrics: QualityMetrics;
  issues: QualityIssue[];
  totalRecords: number;
  validRecords: number;
  recommendations: string[];
  autoFixApplied: number;
}

export interface ExtractionMethod {
  name: string;
  priority: number;
  selector: string;
  transformer?: (value: any) => any;
  validator?: (value: any) => boolean;
}

export class DataQualityAssuranceEngine {
  private static readonly FIELD_VALIDATION_RULES: { [websiteType: string]: ValidationRule[] } = {
    'ecommerce': [
      {
        field: 'title',
        type: 'required',
        params: { minLength: 3, maxLength: 200 },
        message: 'Product title is required and should be 3-200 characters',
        autoFix: (value: any) => String(value || 'Untitled Product').slice(0, 200)
      },
      {
        field: 'price',
        type: 'format',
        params: { pattern: /[\$€£¥]?\s?\d+(\.\d{2})?/ },
        message: 'Price should be in valid currency format',
        autoFix: (value: any) => {
          const match = String(value).match(/\d+(\.\d{2})?/);
          return match ? `$${match[0]}` : '$0.00';
        }
      },
      {
        field: 'rating',
        type: 'range',
        params: { min: 0, max: 5 },
        message: 'Rating should be between 0 and 5',
        autoFix: (value: any) => Math.min(5, Math.max(0, parseFloat(value) || 0))
      }
    ],
    'blog': [
      {
        field: 'title',
        type: 'required',
        params: { minLength: 5, maxLength: 300 },
        message: 'Article title is required and should be 5-300 characters'
      },
      {
        field: 'author',
        type: 'required',
        params: { minLength: 2, maxLength: 100 },
        message: 'Author name is required'
      },
      {
        field: 'date',
        type: 'format',
        params: { pattern: /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/ },
        message: 'Date should be in valid format',
        autoFix: (value: any) => {
          const date = new Date(value);
          return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
        }
      }
    ],
    'news': [
      {
        field: 'title',
        type: 'required',
        params: { minLength: 10, maxLength: 250 },
        message: 'News title should be 10-250 characters'
      },
      {
        field: 'summary',
        type: 'required',
        params: { minLength: 50, maxLength: 500 },
        message: 'News summary should be 50-500 characters'
      },
      {
        field: 'publishDate',
        type: 'format',
        params: { pattern: /\d{4}-\d{2}-\d{2}/ },
        message: 'Publish date is required in YYYY-MM-DD format'
      }
    ]
  };

  private static readonly FALLBACK_EXTRACTION_METHODS: { [field: string]: ExtractionMethod[] } = {
    'title': [
      { name: 'h1-tag', priority: 1, selector: 'h1' },
      { name: 'title-class', priority: 2, selector: '[class*="title"]' },
      { name: 'heading-tag', priority: 3, selector: 'h2, h3' },
      { name: 'meta-title', priority: 4, selector: 'meta[property="og:title"]' }
    ],
    'price': [
      { name: 'price-class', priority: 1, selector: '[class*="price"]', transformer: this.extractPrice },
      { name: 'currency-symbol', priority: 2, selector: '*', validator: (v) => /[\$€£¥]\d+/.test(v) },
      { name: 'price-pattern', priority: 3, selector: '*', validator: (v) => /\d+\.\d{2}/.test(v) }
    ],
    'image': [
      { name: 'img-tag', priority: 1, selector: 'img[src]' },
      { name: 'picture-tag', priority: 2, selector: 'picture img' },
      { name: 'background-image', priority: 3, selector: '[style*="background-image"]' }
    ],
    'description': [
      { name: 'description-class', priority: 1, selector: '[class*="description"]' },
      { name: 'summary-class', priority: 2, selector: '[class*="summary"]' },
      { name: 'content-class', priority: 3, selector: '[class*="content"]' },
      { name: 'paragraph-tag', priority: 4, selector: 'p' }
    ]
  };

  static async assessDataQuality(
    data: any[], 
    websiteType: string = 'default'
  ): Promise<QualityReport> {
    console.log(`🔍 Assessing data quality for ${data.length} records`);
    
    const startTime = Date.now();
    const issues: QualityIssue[] = [];
    let autoFixCount = 0;
    
    // Get validation rules for website type
    const rules = this.FIELD_VALIDATION_RULES[websiteType] || [];
    
    // Clean and validate each record
    const cleanedData = data.map((record, index) => {
      const cleanRecord = { ...record };
      
      rules.forEach(rule => {
        const fieldValue = record[rule.field];
        const validationResult = this.validateField(fieldValue, rule);
        
        if (!validationResult.isValid) {
          issues.push({
            type: this.getIssueType(rule.type),
            field: rule.field,
            message: `Record ${index + 1}: ${validationResult.message}`,
            severity: this.getSeverity(rule.type),
            suggestion: validationResult.suggestion,
            autoFixable: !!rule.autoFix
          });
          
          // Apply auto-fix if available
          if (rule.autoFix && validationResult.canAutoFix) {
            cleanRecord[rule.field] = rule.autoFix(fieldValue);
            autoFixCount++;
          }
        }
      });
      
      return cleanRecord;
    });
    
    // Calculate quality metrics
    const metrics = this.calculateQualityMetrics(cleanedData, rules);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, metrics);
    
    const report: QualityReport = {
      metrics,
      issues,
      totalRecords: data.length,
      validRecords: cleanedData.filter(record => this.isRecordValid(record, rules)).length,
      recommendations,
      autoFixApplied: autoFixCount
    };
    
    console.log(`✅ Quality assessment completed in ${Date.now() - startTime}ms`);
    console.log(`📊 Overall quality score: ${(metrics.overall * 100).toFixed(1)}%`);
    
    return report;
  }

  static async applyFallbackExtraction(
    html: string, 
    failedFields: string[]
  ): Promise<{ [field: string]: any }> {
    console.log(`🔄 Applying fallback extraction for ${failedFields.length} fields`);
    
    const extractedData: { [field: string]: any } = {};
    
    for (const field of failedFields) {
      const methods = this.FALLBACK_EXTRACTION_METHODS[field] || [];
      
      for (const method of methods.sort((a, b) => a.priority - b.priority)) {
        try {
          const value = this.extractUsingMethod(html, method);
          
          if (value && (!method.validator || method.validator(value))) {
            extractedData[field] = method.transformer ? method.transformer(value) : value;
            console.log(`✅ Extracted ${field} using ${method.name}: ${value}`);
            break;
          }
        } catch (error) {
          console.warn(`Failed to extract ${field} using ${method.name}:`, error);
        }
      }
    }
    
    return extractedData;
  }

  static cleanDataAutomatically(data: any[], websiteType: string = 'default'): any[] {
    console.log(`🧹 Auto-cleaning ${data.length} records`);
    
    const rules = this.FIELD_VALIDATION_RULES[websiteType] || [];
    
    return data.map(record => {
      const cleaned = { ...record };
      
      rules.forEach(rule => {
        if (rule.autoFix) {
          const currentValue = cleaned[rule.field];
          const validationResult = this.validateField(currentValue, rule);
          
          if (!validationResult.isValid && validationResult.canAutoFix) {
            cleaned[rule.field] = rule.autoFix(currentValue);
          }
        }
      });
      
      // Remove duplicate fields
      cleaned = this.removeDuplicateFields(cleaned);
      
      // Normalize text fields
      cleaned = this.normalizeTextFields(cleaned);
      
      return cleaned;
    });
  }

  private static validateField(value: any, rule: ValidationRule): {
    isValid: boolean;
    message: string;
    suggestion?: string;
    canAutoFix: boolean;
  } {
    switch (rule.type) {
      case 'required':
        const isEmpty = !value || (typeof value === 'string' && value.trim().length === 0);
        return {
          isValid: !isEmpty,
          message: isEmpty ? rule.message : '',
          suggestion: 'Provide a value for this required field',
          canAutoFix: !!rule.autoFix
        };
        
      case 'format':
        const pattern = rule.params.pattern;
        const isValidFormat = pattern.test(String(value || ''));
        return {
          isValid: isValidFormat,
          message: isValidFormat ? '' : rule.message,
          suggestion: `Format should match: ${pattern.source}`,
          canAutoFix: !!rule.autoFix
        };
        
      case 'range':
        const numValue = parseFloat(value);
        const isInRange = !isNaN(numValue) && 
                         numValue >= rule.params.min && 
                         numValue <= rule.params.max;
        return {
          isValid: isInRange,
          message: isInRange ? '' : rule.message,
          suggestion: `Value should be between ${rule.params.min} and ${rule.params.max}`,
          canAutoFix: !!rule.autoFix
        };
        
      case 'enum':
        const isValidEnum = rule.params.values.includes(value);
        return {
          isValid: isValidEnum,
          message: isValidEnum ? '' : rule.message,
          suggestion: `Valid values: ${rule.params.values.join(', ')}`,
          canAutoFix: !!rule.autoFix
        };
        
      default:
        return { isValid: true, message: '', canAutoFix: false };
    }
  }

  private static calculateQualityMetrics(data: any[], rules: ValidationRule[]): QualityMetrics {
    if (data.length === 0) {
      return { completeness: 0, accuracy: 0, consistency: 0, validity: 0, uniqueness: 0, overall: 0 };
    }
    
    // Completeness: percentage of non-empty fields
    const completeness = this.calculateCompleteness(data);
    
    // Validity: percentage of records passing validation
    const validity = this.calculateValidity(data, rules);
    
    // Consistency: percentage of fields with consistent formats
    const consistency = this.calculateConsistency(data);
    
    // Uniqueness: percentage of unique records
    const uniqueness = this.calculateUniqueness(data);
    
    // Accuracy: estimated based on format compliance and outlier detection
    const accuracy = this.calculateAccuracy(data, rules);
    
    // Overall score
    const overall = (completeness + validity + consistency + uniqueness + accuracy) / 5;
    
    return { completeness, accuracy, consistency, validity, uniqueness, overall };
  }

  private static calculateCompleteness(data: any[]): number {
    let totalFields = 0;
    let filledFields = 0;
    
    data.forEach(record => {
      Object.values(record).forEach(value => {
        totalFields++;
        if (value !== null && value !== undefined && value !== '') {
          filledFields++;
        }
      });
    });
    
    return totalFields > 0 ? filledFields / totalFields : 0;
  }

  private static calculateValidity(data: any[], rules: ValidationRule[]): number {
    if (rules.length === 0) return 1;
    
    let validRecords = 0;
    
    data.forEach(record => {
      const isValid = rules.every(rule => {
        const value = record[rule.field];
        return this.validateField(value, rule).isValid;
      });
      
      if (isValid) validRecords++;
    });
    
    return validRecords / data.length;
  }

  private static calculateConsistency(data: any[]): number {
    if (data.length === 0) return 0;
    
    const fieldConsistency: { [field: string]: number } = {};
    const allFields = new Set<string>();
    
    // Collect all unique fields
    data.forEach(record => {
      Object.keys(record).forEach(field => allFields.add(field));
    });
    
    // Check consistency for each field
    allFields.forEach(field => {
      const values = data.map(record => record[field]).filter(v => v != null);
      if (values.length === 0) return;
      
      const types = new Set(values.map(v => typeof v));
      const formats = new Set(values.map(v => this.getValueFormat(v)));
      
      // Consistency score based on type and format uniformity
      const typeConsistency = types.size === 1 ? 1 : 0.5;
      const formatConsistency = formats.size === 1 ? 1 : Math.max(0, 1 - (formats.size - 1) * 0.2);
      
      fieldConsistency[field] = (typeConsistency + formatConsistency) / 2;
    });
    
    const consistencyValues = Object.values(fieldConsistency);
    return consistencyValues.length > 0 ? 
           consistencyValues.reduce((sum, val) => sum + val, 0) / consistencyValues.length : 0;
  }

  private static calculateUniqueness(data: any[]): number {
    if (data.length === 0) return 0;
    
    const stringifiedRecords = data.map(record => JSON.stringify(record));
    const uniqueRecords = new Set(stringifiedRecords);
    
    return uniqueRecords.size / data.length;
  }

  private static calculateAccuracy(data: any[], rules: ValidationRule[]): number {
    // Simplified accuracy estimation based on format compliance
    let accurateFields = 0;
    let totalFields = 0;
    
    data.forEach(record => {
      Object.entries(record).forEach(([field, value]) => {
        totalFields++;
        
        // Check if field has expected format patterns
        if (this.isFieldAccurate(field, value)) {
          accurateFields++;
        }
      });
    });
    
    return totalFields > 0 ? accurateFields / totalFields : 0;
  }

  private static isFieldAccurate(field: string, value: any): boolean {
    if (!value) return false;
    
    const fieldLower = field.toLowerCase();
    const valueStr = String(value);
    
    // Check common field patterns
    if (fieldLower.includes('price') && !/[\$€£¥]?\s?\d+(\.\d{2})?/.test(valueStr)) return false;
    if (fieldLower.includes('email') && !/\S+@\S+\.\S+/.test(valueStr)) return false;
    if (fieldLower.includes('url') && !/^https?:\/\//.test(valueStr)) return false;
    if (fieldLower.includes('phone') && !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(valueStr)) return false;
    if (fieldLower.includes('date') && isNaN(Date.parse(valueStr))) return false;
    
    return true;
  }

  private static getValueFormat(value: any): string {
    const str = String(value);
    
    if (/^\d+$/.test(str)) return 'integer';
    if (/^\d+\.\d+$/.test(str)) return 'decimal';
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return 'date-iso';
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) return 'date-us';
    if (/^https?:\/\//.test(str)) return 'url';
    if (/@/.test(str)) return 'email';
    if (/[\$€£¥]/.test(str)) return 'currency';
    
    return 'text';
  }

  private static generateRecommendations(issues: QualityIssue[], metrics: QualityMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.completeness < 0.8) {
      recommendations.push('Improve data completeness by implementing fallback extraction methods');
    }
    
    if (metrics.validity < 0.7) {
      recommendations.push('Add more robust validation rules and data cleaning processes');
    }
    
    if (metrics.consistency < 0.6) {
      recommendations.push('Standardize data formats and implement consistent extraction patterns');
    }
    
    if (metrics.uniqueness < 0.9) {
      recommendations.push('Implement duplicate detection and removal mechanisms');
    }
    
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    if (criticalIssues > 0) {
      recommendations.push(`Address ${criticalIssues} critical data quality issues immediately`);
    }
    
    const autoFixableIssues = issues.filter(issue => issue.autoFixable).length;
    if (autoFixableIssues > 0) {
      recommendations.push(`${autoFixableIssues} issues can be automatically fixed`);
    }
    
    return recommendations;
  }

  private static getIssueType(ruleType: string): QualityIssue['type'] {
    switch (ruleType) {
      case 'required': return 'missing';
      case 'format': return 'malformed';
      case 'range': return 'invalid';
      case 'enum': return 'invalid';
      default: return 'invalid';
    }
  }

  private static getSeverity(ruleType: string): QualityIssue['severity'] {
    switch (ruleType) {
      case 'required': return 'high';
      case 'format': return 'medium';
      case 'range': return 'medium';
      case 'enum': return 'low';
      default: return 'low';
    }
  }

  private static isRecordValid(record: any, rules: ValidationRule[]): boolean {
    return rules.every(rule => {
      const value = record[rule.field];
      return this.validateField(value, rule).isValid;
    });
  }

  private static extractUsingMethod(html: string, method: ExtractionMethod): string | null {
    // Simulate DOM extraction (would use actual DOM parsing in real implementation)
    const selectorPattern = method.selector.replace(/[\[\]]/g, '');
    const regex = new RegExp(`<[^>]*${selectorPattern}[^>]*>(.*?)<\/[^>]*>`, 'i');
    const match = html.match(regex);
    
    return match ? match[1].replace(/<[^>]*>/g, '').trim() : null;
  }

  private static extractPrice(value: any): string {
    const str = String(value);
    const match = str.match(/[\$€£¥]?\s?\d+(\.\d{2})?/);
    return match ? match[0] : str;
  }

  private static removeDuplicateFields(record: any): any {
    const seen = new Set();
    const cleaned: any = {};
    
    Object.entries(record).forEach(([key, value]) => {
      const normalizedValue = String(value).toLowerCase().trim();
      if (!seen.has(normalizedValue)) {
        seen.add(normalizedValue);
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }

  private static normalizeTextFields(record: any): any {
    const normalized: any = {};
    
    Object.entries(record).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Remove extra whitespace, normalize quotes
        normalized[key] = value
          .replace(/\s+/g, ' ')
          .replace(/[""]/g, '"')
          .replace(/['']/g, "'")
          .trim();
      } else {
        normalized[key] = value;
      }
    });
    
    return normalized;
  }
}
