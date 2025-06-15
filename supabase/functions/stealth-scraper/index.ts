
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

import { BrowserFingerprintManager } from './browser-fingerprint-manager.ts';
import { StealthBrowserController } from './stealth-browser-controller.ts';
import { DistributedJobManager } from './job-manager.ts';

/**
 * Level 5: Advanced Logical Scraping Engine
 * Implements comprehensive multi-strategy extraction with AI-like decision making
 */

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🛡️ Advanced Stealth Scraper called with method:', req.method);
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const jobManager = new DistributedJobManager(supabaseAdmin);

    // Handle stats request (no body needed)
    if (req.method === 'GET') {
      console.log('📊 Getting advanced system stats');
      try {
        const stats = await jobManager.getJobStats();
        const systemStatus = {
          ...stats,
          available_profiles: BrowserFingerprintManager.getAllProfiles().length,
          captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
          version: 'Level 5 - Advanced Logical Flow',
          capabilities: [
            'Multi-Strategy Content Analysis',
            'AI-Powered Website Classification',
            'Advanced API Key Extraction',
            'SPA Dynamic Content Handling',
            'E-commerce Data Mining',
            'Social Media Content Parsing',
            'Real-time Data Quality Assessment',
            'Intelligent Retry Mechanisms',
            'Human Behavior Simulation',
            'Anti-Detection Techniques'
          ],
          extraction_methods: [
            'Pattern-Based Recognition',
            'Structural Analysis',
            'Semantic Content Understanding',
            'Dynamic Flow Adaptation',
            'Cross-Reference Validation'
          ]
        };
        
        console.log('✅ Advanced system stats retrieved:', systemStatus);
        
        return new Response(JSON.stringify(systemStatus), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('❌ Error getting system stats:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to get system stats',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle POST requests with body
    let requestBody: any = {};
    const contentType = req.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        const text = await req.text();
        console.log('📝 Request body received:', text.substring(0, 200) + '...');
        if (text.trim()) {
          requestBody = JSON.parse(text);
          console.log('📋 Parsed request body action:', requestBody.action);
        }
      }
    } catch (error) {
      console.log('⚠️ JSON parse error, returning stats:', error.message);
      // Return stats as fallback
      const stats = await jobManager.getJobStats();
      const systemStatus = {
        ...stats,
        available_profiles: BrowserFingerprintManager.getAllProfiles().length,
        captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
        version: 'Level 5 - Advanced Logical Flow',
        capabilities: [
          'Multi-Strategy Content Analysis',
          'AI-Powered Website Classification',
          'Advanced API Key Extraction',
          'SPA Dynamic Content Handling',
          'E-commerce Data Mining'
        ]
      };
      
      return new Response(JSON.stringify(systemStatus), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const action = requestBody.action || 'stats';
    console.log('🎯 Executing action:', action);

    switch (action) {
      case 'scrape': {
        const targetUrl = requestBody.url;
        
        if (!targetUrl) {
          console.error('❌ URL required for scraping');
          return new Response(JSON.stringify({ 
            error: 'URL required for scraping',
            required_fields: ['url'],
            example: { action: 'scrape', url: 'https://example.com' }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`🚀 Starting advanced logical scrape for: ${targetUrl}`);
        
        try {
          // Select optimal profile for this URL
          const profile = BrowserFingerprintManager.getOptimalProfile(targetUrl);
          console.log(`🎭 Selected optimal profile: ${profile.name} for ${targetUrl}`);
          
          const stealthBrowser = new StealthBrowserController(profile);
          
          console.log('🔧 Initializing advanced stealth browser...');
          await stealthBrowser.initialize();
          
          console.log('🌐 Navigating with advanced stealth techniques...');
          await stealthBrowser.navigateWithStealth(targetUrl);
          
          console.log('📄 Extracting page content...');
          const html = await stealthBrowser.getPageContent();
          
          console.log('🧠 Executing advanced logical extraction flow...');
          const structuredData = await stealthBrowser.extractStructuredData();
          
          console.log('🧹 Closing browser...');
          await stealthBrowser.close();

          // Analyze extraction quality
          const extractionQuality = analyzeExtractionQuality(structuredData);
          console.log('📊 Extraction quality assessment:', extractionQuality);

          const result = {
            url: targetUrl,
            html: html.substring(0, 10000) + (html.length > 10000 ? '...' : ''),
            structured_data: structuredData,
            metadata: {
              profile_used: profile.name,
              extraction_method: structuredData.extraction_method || 'advanced_logical_flow',
              content_length: html.length,
              quality_score: extractionQuality.score,
              confidence: structuredData.confidence || 0.7,
              timestamp: new Date().toISOString(),
              capabilities_used: extractionQuality.capabilities_used,
              data_types_found: extractionQuality.data_types_found,
              extraction_summary: generateExtractionSummary(structuredData)
            }
          };

          console.log(`✅ Advanced scraping completed for ${targetUrl}`);
          console.log('📊 Final extraction summary:', result.metadata.extraction_summary);
          
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          
        } catch (error) {
          console.error('❌ Advanced scraping failed:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack?.substring(0, 1000)
          });
          
          return new Response(JSON.stringify({ 
            error: 'Advanced scraping failed',
            details: error.message,
            url: targetUrl,
            error_type: error.name || 'UnknownError',
            timestamp: new Date().toISOString(),
            suggestions: [
              'Check if the URL is accessible',
              'Verify the website allows automated access',
              'Try again with a different URL',
              'Contact support if the issue persists'
            ]
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'enqueue': {
        const targetUrl = requestBody.url;
        const priority = requestBody.priority || 'medium';
        
        if (!targetUrl) {
          console.error('❌ URL required for enqueue');
          return new Response(JSON.stringify({ 
            error: 'URL required for enqueue',
            required_fields: ['url'],
            optional_fields: ['priority'],
            example: { action: 'enqueue', url: 'https://example.com', priority: 'high' }
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.log(`📋 Enqueuing advanced job for: ${targetUrl} with priority: ${priority}`);
        
        try {
          const jobId = await jobManager.enqueueJob(targetUrl, priority);
          const stats = await jobManager.getJobStats();
          
          console.log(`✅ Job enqueued successfully: ${jobId}`);
          
          return new Response(JSON.stringify({ 
            job_id: jobId,
            url: targetUrl,
            priority: priority,
            stats: stats,
            estimated_completion: calculateEstimatedCompletion(priority, stats),
            queue_position: stats.pending
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('❌ Failed to enqueue job:', error);
          return new Response(JSON.stringify({ 
            error: 'Failed to enqueue job',
            details: error.message,
            url: targetUrl
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      default: {
        // Default to advanced stats
        console.log('📊 Getting advanced system stats (default action)');
        try {
          const stats = await jobManager.getJobStats();
          const systemStatus = {
            ...stats,
            available_profiles: BrowserFingerprintManager.getAllProfiles().length,
            captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
            version: 'Level 5 - Advanced Logical Flow',
            capabilities: [
              'Multi-Strategy Content Analysis',
              'AI-Powered Website Classification', 
              'Advanced API Key Extraction',
              'SPA Dynamic Content Handling',
              'E-commerce Data Mining',
              'Social Media Content Parsing',
              'Real-time Data Quality Assessment',
              'Intelligent Retry Mechanisms',
              'Human Behavior Simulation',
              'Anti-Detection Techniques'
            ],
            extraction_methods: [
              'Pattern-Based Recognition',
              'Structural Analysis', 
              'Semantic Content Understanding',
              'Dynamic Flow Adaptation',
              'Cross-Reference Validation'
            ],
            supported_websites: [
              'E-commerce Platforms',
              'Social Media Sites',
              'News Websites',
              'Blog Platforms',
              'Job Boards',
              'Real Estate Sites',
              'API Documentation',
              'SPA Applications',
              'Any Web Content'
            ]
          };
          
          console.log('✅ Advanced system stats retrieved successfully');
          
          return new Response(JSON.stringify(systemStatus), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('❌ Error getting advanced system stats:', error);
          return new Response(JSON.stringify({ 
            error: 'Failed to get system stats',
            details: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

  } catch (error) {
    console.error('💥 Advanced Stealth Scraper Critical Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 1000)
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      error_type: error.name || 'UnknownError',
      timestamp: new Date().toISOString(),
      version: 'Level 5 - Advanced Logical Flow'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeExtractionQuality(structuredData: any): any {
  const quality = {
    score: 0,
    capabilities_used: [],
    data_types_found: [],
    recommendations: []
  };

  // Analyze data completeness
  if (structuredData.title) {
    quality.score += 0.1;
    quality.data_types_found.push('title');
  }
  
  if (structuredData.advanced) {
    quality.score += 0.3;
    quality.capabilities_used.push('advanced_logical_flow');
    
    if (structuredData.advanced.type) {
      quality.data_types_found.push(structuredData.advanced.type);
      quality.score += 0.2;
    }
  }

  if (structuredData.links?.length > 0) {
    quality.score += 0.1;
    quality.data_types_found.push('links');
  }

  if (structuredData.images?.length > 0) {
    quality.score += 0.1;
    quality.data_types_found.push('images');
  }

  if (structuredData.structuredContent) {
    quality.score += 0.2;
    quality.capabilities_used.push('structured_content_analysis');
  }

  // Cap the score at 1.0
  quality.score = Math.min(quality.score, 1.0);

  return quality;
}

function generateExtractionSummary(structuredData: any): any {
  return {
    title: structuredData.title || 'No title found',
    data_types: Object.keys(structuredData).length,
    links_found: structuredData.links?.length || 0,
    images_found: structuredData.images?.length || 0,
    headings_found: structuredData.headings?.length || 0,
    forms_found: structuredData.forms?.length || 0,
    advanced_extraction: !!structuredData.advanced,
    extraction_confidence: structuredData.confidence || 0.5,
    structured_content_types: structuredData.structuredContent ? 
      Object.keys(structuredData.structuredContent).filter(key => 
        structuredData.structuredContent[key]?.length > 0
      ) : []
  };
}

function calculateEstimatedCompletion(priority: string, stats: any): string {
  const baseTime = 30; // seconds
  const queueMultiplier = Math.max(1, stats.pending * 0.5);
  
  let priorityMultiplier = 1;
  switch (priority) {
    case 'high': priorityMultiplier = 0.5; break;
    case 'medium': priorityMultiplier = 1; break;
    case 'low': priorityMultiplier = 2; break;
  }
  
  const estimatedSeconds = baseTime * queueMultiplier * priorityMultiplier;
  const minutes = Math.ceil(estimatedSeconds / 60);
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
