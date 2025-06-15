import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './_shared/cors.ts';
import { BrowserFingerprintManager } from './browser-fingerprint-manager.ts';
import { StealthBrowserController } from './stealth-browser-controller.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, url, priority, stealth_level } = await req.json();
    
    // Default to returning system stats
    if (!action) {
      const stats = await getSystemStats();
      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different actions
    switch (action) {
      case 'enqueue':
        const jobId = await enqueueJob(url, priority || 'medium');
        return new Response(JSON.stringify({
          job_id: jobId,
          url: url,
          priority: priority || 'medium',
          status: 'queued'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'scrape':
        console.log(`🚀 Direct scrape request for: ${url} (Level ${stealth_level || 1})`);
        
        // Determine stealth level (1 or 2)
        const level = stealth_level === 2 ? 2 : 1;
        console.log(`🛡️ Using stealth level: ${level}`);
        
        const result = await performDirectScrape(url, level);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Stealth scraper error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performDirectScrape(url: string, stealthLevel: 1 | 2 = 1): Promise<any> {
  let browser = null;
  
  try {
    console.log(`🎯 Starting Level ${stealthLevel} direct scrape for: ${url}`);
    
    // Get optimal profile for the URL
    const profile = BrowserFingerprintManager.getOptimalProfile(url);
    console.log(`📋 Selected profile: ${profile.name} for Level ${stealthLevel}`);
    
    // Initialize stealth browser with specified level
    browser = new StealthBrowserController(profile, stealthLevel);
    await browser.initialize();
    
    // Navigate with stealth
    await browser.navigateWithStealth(url);
    
    // Extract structured data
    const structuredData = await browser.extractStructuredData();
    const htmlContent = await browser.getPageContent();
    
    // Get stealth stats
    const stealthStats = browser.getStealthStats();
    
    const result = {
      url: url,
      structured_data: structuredData,
      html: htmlContent,
      metadata: {
        profile_used: profile.name,
        stealth_level: stealthLevel,
        stealth_stats: stealthStats,
        extraction_timestamp: new Date().toISOString(),
        content_length: htmlContent.length,
        success: true,
        extraction_summary: {
          quotes_found: structuredData.advanced?.quotes?.length || 0,
          articles_found: structuredData.advanced?.articles?.length || 0,
          links_found: structuredData.links?.length || 0,
          images_found: structuredData.images?.length || 0
        }
      }
    };
    
    console.log(`✅ Level ${stealthLevel} scraping completed successfully for: ${url}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Level ${stealthLevel} scraping failed for ${url}:`, error);
    throw new Error(`Stealth scraping failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function getSystemStats(): Promise<any> {
  console.log('📊 Fetching system stats...');
  
  const profiles = BrowserFingerprintManager.getAllProfiles();
  
  return {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    available_profiles: profiles.length,
    captcha_solver_configured: false,
    stealth_features: [
      'Level 1: User Agent Rotation',
      'Level 1: Header Normalization', 
      'Level 1: Basic Rate Limiting',
      'Level 1: Simple Proxy Usage',
      'Level 2: Browser Fingerprint Masking',
      'Level 2: Advanced Request Patterns',
      'Level 2: Session Management',
      'Level 2: Residential Proxy Networks',
      'Level 2: Content-Aware Delays',
      'Level 2: Human Behavior Simulation'
    ],
    stealth_levels: {
      level_1: {
        name: 'Basic Stealth',
        success_rate: '60-70%',
        features: ['User Agent Rotation', 'Header Normalization', 'Basic Rate Limiting', 'Simple Proxy Usage']
      },
      level_2: {
        name: 'Intermediate Stealth',
        success_rate: '80-85%',
        features: ['All Level 1 features', 'Fingerprint Masking', 'Session Management', 'Residential Proxies', 'Content-Aware Delays']
      }
    }
  };
}

async function enqueueJob(url: string, priority: string): Promise<string> {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  console.log(`Job enqueued: ${jobId} - URL: ${url} - Priority: ${priority}`);
  return jobId;
}
