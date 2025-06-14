
import { WebsiteClassification } from './ContentUnderstandingEngine';
import { SmartFieldDetection, ExtractionResult } from './SmartDataExtractor';

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST';
  description: string;
  parameters: ApiParameter[];
  responseFormat: any;
  examples: any[];
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: RegExp;
}

export interface GeneratedApiSpec {
  baseUrl: string;
  apiKey: string;
  endpoints: ApiEndpoint[];
  schemas: { [key: string]: any };
  documentation: string;
  openApiSpec: any;
}

export class DynamicEndpointGenerator {
  private static readonly ENDPOINT_TEMPLATES = {
    ecommerce: {
      endpoints: [
        { path: '/products', name: 'products', description: 'List all products' },
        { path: '/products/search', name: 'product-search', description: 'Search products' },
        { path: '/products/categories', name: 'categories', description: 'List product categories' },
        { path: '/products/{id}', name: 'product-detail', description: 'Get product details' }
      ],
      parameters: [
        { name: 'category', type: 'string', description: 'Filter by category' },
        { name: 'minPrice', type: 'number', description: 'Minimum price filter' },
        { name: 'maxPrice', type: 'number', description: 'Maximum price filter' },
        { name: 'search', type: 'string', description: 'Search query' },
        { name: 'sort', type: 'string', description: 'Sort order (price_asc, price_desc, name_asc, rating_desc)' },
        { name: 'limit', type: 'number', description: 'Number of results to return' },
        { name: 'offset', type: 'number', description: 'Number of results to skip' }
      ]
    },
    blog: {
      endpoints: [
        { path: '/articles', name: 'articles', description: 'List all articles' },
        { path: '/articles/search', name: 'article-search', description: 'Search articles' },
        { path: '/articles/categories', name: 'categories', description: 'List article categories' },
        { path: '/articles/{id}', name: 'article-detail', description: 'Get article details' },
        { path: '/authors', name: 'authors', description: 'List all authors' }
      ],
      parameters: [
        { name: 'category', type: 'string', description: 'Filter by category' },
        { name: 'author', type: 'string', description: 'Filter by author' },
        { name: 'dateFrom', type: 'string', description: 'Filter articles from date (YYYY-MM-DD)' },
        { name: 'dateTo', type: 'string', description: 'Filter articles to date (YYYY-MM-DD)' },
        { name: 'search', type: 'string', description: 'Search query' },
        { name: 'sort', type: 'string', description: 'Sort order (date_desc, date_asc, title_asc)' },
        { name: 'limit', type: 'number', description: 'Number of results to return' },
        { name: 'offset', type: 'number', description: 'Number of results to skip' }
      ]
    },
    news: {
      endpoints: [
        { path: '/articles', name: 'news-articles', description: 'List all news articles' },
        { path: '/articles/breaking', name: 'breaking-news', description: 'Get breaking news' },
        { path: '/articles/search', name: 'news-search', description: 'Search news articles' },
        { path: '/articles/{id}', name: 'article-detail', description: 'Get article details' }
      ],
      parameters: [
        { name: 'category', type: 'string', description: 'Filter by news category' },
        { name: 'source', type: 'string', description: 'Filter by news source' },
        { name: 'dateFrom', type: 'string', description: 'Filter from date' },
        { name: 'dateTo', type: 'string', description: 'Filter to date' },
        { name: 'search', type: 'string', description: 'Search query' },
        { name: 'limit', type: 'number', description: 'Number of results to return' }
      ]
    },
    'job-board': {
      endpoints: [
        { path: '/jobs', name: 'jobs', description: 'List all job listings' },
        { path: '/jobs/search', name: 'job-search', description: 'Search job listings' },
        { path: '/jobs/{id}', name: 'job-detail', description: 'Get job details' },
        { path: '/companies', name: 'companies', description: 'List hiring companies' }
      ],
      parameters: [
        { name: 'location', type: 'string', description: 'Filter by location' },
        { name: 'company', type: 'string', description: 'Filter by company' },
        { name: 'jobType', type: 'string', description: 'Filter by job type' },
        { name: 'salaryMin', type: 'number', description: 'Minimum salary' },
        { name: 'remote', type: 'boolean', description: 'Remote jobs only' },
        { name: 'search', type: 'string', description: 'Search query' },
        { name: 'limit', type: 'number', description: 'Number of results to return' }
      ]
    },
    'real-estate': {
      endpoints: [
        { path: '/properties', name: 'properties', description: 'List all properties' },
        { path: '/properties/search', name: 'property-search', description: 'Search properties' },
        { path: '/properties/{id}', name: 'property-detail', description: 'Get property details' }
      ],
      parameters: [
        { name: 'location', type: 'string', description: 'Filter by location' },
        { name: 'propertyType', type: 'string', description: 'Filter by property type' },
        { name: 'minPrice', type: 'number', description: 'Minimum price' },
        { name: 'maxPrice', type: 'number', description: 'Maximum price' },
        { name: 'bedrooms', type: 'number', description: 'Number of bedrooms' },
        { name: 'bathrooms', type: 'number', description: 'Number of bathrooms' },
        { name: 'search', type: 'string', description: 'Search query' },
        { name: 'limit', type: 'number', description: 'Number of results to return' }
      ]
    }
  };

  static async generateApiSpec(
    baseUrl: string,
    apiKey: string,
    classification: WebsiteClassification,
    extractionResult: ExtractionResult
  ): Promise<GeneratedApiSpec> {
    console.log(`🏗️ Generating API specification for ${classification.primaryType} website`);

    const template = this.ENDPOINT_TEMPLATES[classification.primaryType] || this.getGenericTemplate();
    
    // Generate endpoints based on extracted data
    const endpoints = this.createEndpoints(template, extractionResult);
    
    // Generate schemas based on detected fields
    const schemas = this.generateSchemas(extractionResult.fields, classification.primaryType);
    
    // Generate OpenAPI specification
    const openApiSpec = this.generateOpenApiSpec(baseUrl, endpoints, schemas, extractionResult);
    
    // Generate documentation
    const documentation = this.generateDocumentation(endpoints, schemas, classification);

    return {
      baseUrl,
      apiKey,
      endpoints,
      schemas,
      documentation,
      openApiSpec
    };
  }

  private static createEndpoints(template: any, extractionResult: ExtractionResult): ApiEndpoint[] {
    const endpoints: ApiEndpoint[] = [];

    template.endpoints.forEach((endpointTemplate: any) => {
      const endpoint: ApiEndpoint = {
        path: endpointTemplate.path,
        method: 'GET',
        description: endpointTemplate.description,
        parameters: this.createParametersForEndpoint(template.parameters, endpointTemplate.path),
        responseFormat: this.createResponseFormat(extractionResult.fields),
        examples: this.createExamples(extractionResult.data, endpointTemplate.path)
      };

      endpoints.push(endpoint);
    });

    return endpoints;
  }

  private static createParametersForEndpoint(templateParams: any[], endpointPath: string): ApiParameter[] {
    const parameters: ApiParameter[] = [];

    // Add common parameters
    templateParams.forEach(param => {
      parameters.push({
        name: param.name,
        type: param.type as any,
        required: false,
        description: param.description,
        defaultValue: this.getDefaultValue(param.type),
        validation: this.getValidationPattern(param.name, param.type)
      });
    });

    // Add path parameters if endpoint has them
    if (endpointPath.includes('{id}')) {
      parameters.push({
        name: 'id',
        type: 'string',
        required: true,
        description: 'Unique identifier for the resource'
      });
    }

    return parameters;
  }

  private static createResponseFormat(fields: SmartFieldDetection[]): any {
    const format: any = {
      type: 'object',
      properties: {}
    };

    fields.forEach(field => {
      format.properties[field.fieldName] = {
        type: this.mapDataTypeToOpenApi(field.dataType),
        description: `The ${field.fieldName} of the item`,
        example: field.examples[0] || this.getExampleValue(field.dataType)
      };
    });

    return {
      data: {
        type: 'array',
        items: format
      },
      metadata: {
        type: 'object',
        properties: {
          total: { type: 'integer', description: 'Total number of items' },
          limit: { type: 'integer', description: 'Number of items per page' },
          offset: { type: 'integer', description: 'Number of items skipped' },
          hasMore: { type: 'boolean', description: 'Whether there are more items' }
        }
      }
    };
  }

  private static createExamples(data: any[], endpointPath: string): any[] {
    if (endpointPath.includes('{id}')) {
      // Single item endpoint
      return data.slice(0, 1);
    } else {
      // List endpoint
      return [
        {
          data: data.slice(0, 5),
          metadata: {
            total: data.length,
            limit: 5,
            offset: 0,
            hasMore: data.length > 5
          }
        }
      ];
    }
  }

  private static generateSchemas(fields: SmartFieldDetection[], websiteType: string): { [key: string]: any } {
    const entityName = this.getEntityName(websiteType);
    
    const schema = {
      type: 'object',
      required: fields.filter(f => f.confidence > 0.8).map(f => f.fieldName),
      properties: {}
    };

    fields.forEach(field => {
      schema.properties[field.fieldName] = {
        type: this.mapDataTypeToOpenApi(field.dataType),
        description: `The ${field.fieldName} of the ${entityName.toLowerCase()}`,
        example: field.examples[0] || this.getExampleValue(field.dataType)
      };
    });

    return {
      [entityName]: schema,
      [`${entityName}List`]: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${entityName}` }
          },
          metadata: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' },
              hasMore: { type: 'boolean' }
            }
          }
        }
      }
    };
  }

  private static generateOpenApiSpec(
    baseUrl: string,
    endpoints: ApiEndpoint[],
    schemas: { [key: string]: any },
    extractionResult: ExtractionResult
  ): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Generated API',
        description: `Auto-generated API from website content using AI-powered extraction`,
        version: '1.0.0',
        contact: {
          name: 'API Craft',
          url: 'https://apicraft.com'
        }
      },
      servers: [
        {
          url: baseUrl,
          description: 'Production server'
        }
      ],
      security: [
        {
          apiKey: []
        }
      ],
      paths: this.generateOpenApiPaths(endpoints),
      components: {
        schemas,
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key'
          }
        }
      }
    };
  }

  private static generateOpenApiPaths(endpoints: ApiEndpoint[]): any {
    const paths: any = {};

    endpoints.forEach(endpoint => {
      paths[endpoint.path] = {
        [endpoint.method.toLowerCase()]: {
          summary: endpoint.description,
          description: `${endpoint.description} with advanced filtering and pagination`,
          parameters: endpoint.parameters.map(param => ({
            name: param.name,
            in: param.name === 'id' ? 'path' : 'query',
            required: param.required,
            description: param.description,
            schema: {
              type: param.type,
              default: param.defaultValue
            }
          })),
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: endpoint.responseFormat,
                  examples: {
                    default: {
                      value: endpoint.examples[0]
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid API key'
            },
            '429': {
              description: 'Rate limit exceeded'
            }
          }
        }
      };
    });

    return paths;
  }

  private static generateDocumentation(
    endpoints: ApiEndpoint[],
    schemas: { [key: string]: any },
    classification: WebsiteClassification
  ): string {
    const entityName = this.getEntityName(classification.primaryType);
    
    let doc = `# API Documentation\n\n`;
    doc += `## Overview\n`;
    doc += `This API provides access to ${entityName.toLowerCase()} data extracted from a ${classification.primaryType} website.\n`;
    doc += `Classification confidence: ${(classification.confidence * 100).toFixed(1)}%\n\n`;

    doc += `## Authentication\n`;
    doc += `All requests require an API key sent in the \`x-api-key\` header.\n\n`;

    doc += `## Endpoints\n\n`;
    endpoints.forEach(endpoint => {
      doc += `### ${endpoint.method} ${endpoint.path}\n`;
      doc += `${endpoint.description}\n\n`;
      
      if (endpoint.parameters.length > 0) {
        doc += `#### Parameters\n`;
        endpoint.parameters.forEach(param => {
          const required = param.required ? ' (required)' : ' (optional)';
          doc += `- **${param.name}**${required}: ${param.description}\n`;
        });
        doc += `\n`;
      }

      doc += `#### Example Response\n`;
      doc += `\`\`\`json\n${JSON.stringify(endpoint.examples[0], null, 2)}\n\`\`\`\n\n`;
    });

    doc += `## Rate Limits\n`;
    doc += `- 1000 requests per hour for free tier\n`;
    doc += `- 10000 requests per hour for premium tier\n\n`;

    doc += `## Error Handling\n`;
    doc += `The API returns standard HTTP status codes. Error responses include a message explaining the issue.\n`;

    return doc;
  }

  private static getGenericTemplate(): any {
    return {
      endpoints: [
        { path: '/items', name: 'items', description: 'List all items' },
        { path: '/items/search', name: 'search', description: 'Search items' },
        { path: '/items/{id}', name: 'item-detail', description: 'Get item details' }
      ],
      parameters: [
        { name: 'search', type: 'string', description: 'Search query' },
        { name: 'limit', type: 'number', description: 'Number of results to return' },
        { name: 'offset', type: 'number', description: 'Number of results to skip' }
      ]
    };
  }

  private static getEntityName(websiteType: string): string {
    const entityNames: { [key: string]: string } = {
      ecommerce: 'Product',
      blog: 'Article',
      news: 'NewsArticle',
      'job-board': 'Job',
      'real-estate': 'Property',
      restaurant: 'MenuItem'
    };

    return entityNames[websiteType] || 'Item';
  }

  private static mapDataTypeToOpenApi(dataType: string): string {
    const typeMap: { [key: string]: string } = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'string',
      url: 'string',
      email: 'string',
      price: 'string'
    };

    return typeMap[dataType] || 'string';
  }

  private static getDefaultValue(type: string): any {
    const defaults: { [key: string]: any } = {
      string: '',
      number: 0,
      boolean: false
    };

    return defaults[type];
  }

  private static getValidationPattern(name: string, type: string): RegExp | undefined {
    const patterns: { [key: string]: RegExp } = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^https?:\/\/.+/,
      search: /^.{1,100}$/,
      limit: /^\d{1,3}$/,
      offset: /^\d+$/
    };

    return patterns[name];
  }

  private static getExampleValue(dataType: string): any {
    const examples: { [key: string]: any } = {
      string: 'Sample text',
      number: 42,
      boolean: true,
      date: '2023-12-01',
      url: 'https://example.com',
      email: 'user@example.com',
      price: '$29.99'
    };

    return examples[dataType] || 'Sample value';
  }
}
