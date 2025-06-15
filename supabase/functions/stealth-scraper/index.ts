
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Stealth scraper function called');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const jobManager = new DistributedJobManager(supabaseAdmin);

    // Handle stats request (no body needed)
    if (req.method === 'GET') {
      console.log('Getting system stats');
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
      
      return new Response(JSON.stringify(systemStatus), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle POST requests with body
    let requestBody: any = {};
    try {
      const text = await req.text();
      if (text) {
        requestBody = JSON.parse(text);
      }
    } catch (error) {
      console.log('No JSON body found, using empty object');
    }

    const action = requestBody.action || 'stats';
    console.log('Action:', action);

    switch (action) {
      case 'scrape': {
        const targetUrl = requestBody.url;
        
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'URL required for scraping' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Starting direct scrape for: ${targetUrl}`);
        const profile = BrowserFingerprintManager.getRandomProfile();
        const stealthBrowser = new StealthBrowserController(profile);
        
        try {
          await stealthBrowser.initialize();
          await stealthBrowser.navigateWithStealth(targetUrl);
          
          const html = await stealthBrowser.getPageContent();
          const structuredData = await stealthBrowser.extractStructuredData();
          
          await stealthBrowser.close();

          console.log(`Scraping completed for ${targetUrl}. Profile used: ${profile.name}`);
          console.log('Extracted data summary:', {
            title: structuredData.title,
            quotes: structuredData.quotes?.length || 0,
            articles: structuredData.articles?.length || 0,
            links: structuredData.links?.length || 0,
            images: structuredData.images?.length || 0
          });
          
          return new Response(JSON.stringify({
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
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          
        } catch (error) {
          await stealthBrowser.close();
          console.error('Direct scraping failed:', error);
          return new Response(JSON.stringify({ 
            error: 'Direct scraping failed',
            details: error.message,
            url: targetUrl
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
          return new Response(JSON.stringify({ error: 'URL required for enqueue' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const jobId = await jobManager.enqueueJob(targetUrl, priority);
        
        return new Response(JSON.stringify({ 
          job_id: jobId,
          url: targetUrl,
          priority: priority,
          stats: await jobManager.getJobStats()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default: {
        // Default to stats
        console.log('Getting system stats (default)');
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
        
        return new Response(JSON.stringify(systemStatus), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('Enhanced Stealth Scraper Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
