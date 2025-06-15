
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

import { BrowserFingerprintManager } from './browser-fingerprint-manager.ts';
import { StealthBrowserController } from './stealth-browser-controller.ts';
import { DistributedJobManager } from './job-manager.ts';

/**
 * Level 4: Enhanced Stealth Scraping Engine
 * Implements comprehensive anti-detection and distributed architecture
 */

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🛡️ Stealth scraper function called with method:', req.method);
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const jobManager = new DistributedJobManager(supabaseAdmin);

    // Handle stats request (no body needed)
    if (req.method === 'GET') {
      console.log('📊 Getting system stats');
      try {
        const stats = await jobManager.getJobStats();
        const systemStatus = {
          ...stats,
          available_profiles: BrowserFingerprintManager.getAllProfiles().length,
          captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
          stealth_features: [
            'Browser Fingerprint Rotation',
            'Human Behavior Simulation',
            'Anti-Detection Techniques',
            'Request Pattern Randomization',
            'Distributed Job Processing',
            'Enhanced Data Extraction'
          ]
        };
        
        console.log('✅ System stats retrieved successfully:', systemStatus);
        
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
    try {
      const text = await req.text();
      console.log('📝 Request body text:', text);
      if (text) {
        requestBody = JSON.parse(text);
        console.log('📋 Parsed request body:', requestBody);
      }
    } catch (error) {
      console.log('⚠️ No JSON body found or parse error:', error.message);
    }

    const action = requestBody.action || 'stats';
    console.log('🎯 Action to perform:', action);

    switch (action) {
      case 'scrape': {
        const targetUrl = requestBody.url;
        
        if (!targetUrl) {
          console.error('❌ URL required for scraping');
          return new Response(JSON.stringify({ error: 'URL required for scraping' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`🚀 Starting direct scrape for: ${targetUrl}`);
        
        try {
          const profile = BrowserFingerprintManager.getRandomProfile();
          console.log(`🎭 Using profile: ${profile.name}`);
          
          const stealthBrowser = new StealthBrowserController(profile);
          
          console.log('🔧 Initializing stealth browser...');
          await stealthBrowser.initialize();
          
          console.log('🌐 Navigating to target URL with stealth mode...');
          await stealthBrowser.navigateWithStealth(targetUrl);
          
          console.log('📄 Extracting page content...');
          const html = await stealthBrowser.getPageContent();
          
          console.log('🔍 Extracting structured data...');
          const structuredData = await stealthBrowser.extractStructuredData();
          
          console.log('🧹 Closing browser...');
          await stealthBrowser.close();

          const result = {
            url: targetUrl,
            html: html.substring(0, 5000) + (html.length > 5000 ? '...' : ''),
            structured_data: structuredData,
            metadata: {
              profile_used: profile.name,
              captcha_encountered: false,
              content_length: html.length,
              extraction_summary: {
                title: structuredData.title || 'No title found',
                quotes_found: structuredData.quotes?.length || 0,
                articles_found: structuredData.articles?.length || 0,
                links_found: structuredData.links?.length || 0,
                images_found: structuredData.images?.length || 0,
                navigation_items: structuredData.navigation?.length || 0,
                list_items: structuredData.listItems?.length || 0
              }
            }
          };

          console.log(`✅ Scraping completed successfully for ${targetUrl}`);
          console.log('📊 Extraction summary:', result.metadata.extraction_summary);
          
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          
        } catch (error) {
          console.error('❌ Direct scraping failed:', error);
          console.error('Error stack:', error.stack);
          
          return new Response(JSON.stringify({ 
            error: 'Direct scraping failed',
            details: error.message,
            url: targetUrl,
            stack: error.stack
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
          return new Response(JSON.stringify({ error: 'URL required for enqueue' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.log(`📋 Enqueuing job for: ${targetUrl} with priority: ${priority}`);
        
        try {
          const jobId = await jobManager.enqueueJob(targetUrl, priority);
          const stats = await jobManager.getJobStats();
          
          console.log(`✅ Job enqueued successfully: ${jobId}`);
          
          return new Response(JSON.stringify({ 
            job_id: jobId,
            url: targetUrl,
            priority: priority,
            stats: stats
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('❌ Failed to enqueue job:', error);
          return new Response(JSON.stringify({ 
            error: 'Failed to enqueue job',
            details: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      default: {
        // Default to stats
        console.log('📊 Getting system stats (default action)');
        try {
          const stats = await jobManager.getJobStats();
          const systemStatus = {
            ...stats,
            available_profiles: BrowserFingerprintManager.getAllProfiles().length,
            captcha_solver_configured: !!Deno.env.get('CAPTCHA_SOLVER_API_KEY'),
            stealth_features: [
              'Browser Fingerprint Rotation',
              'Human Behavior Simulation',
              'Anti-Detection Techniques',
              'Request Pattern Randomization',
              'Distributed Job Processing',
              'Enhanced Data Extraction'
            ]
          };
          
          console.log('✅ System stats retrieved successfully:', systemStatus);
          
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
    }

  } catch (error) {
    console.error('💥 Enhanced Stealth Scraper Critical Error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
