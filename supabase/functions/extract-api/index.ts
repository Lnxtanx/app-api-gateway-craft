
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'
import puppeteer, { Browser } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

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

    // 4. Scrape the source URL with a headless browser (Puppeteer)
    console.log(`Scraping ${api.source_url} with Puppeteer...`);
    let browser: Browser | null = null;
    let html: string;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(api.source_url, { waitUntil: 'networkidle2', timeout: 30000 });
      html = await page.content();
      console.log(`Successfully scraped content from ${api.source_url}`);
    } catch (scrapeError) {
        console.error('Puppeteer scraping error:', scrapeError);
        throw new Error(`Failed to scrape source URL with headless browser: ${scrapeError.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // 5. Parse with Cheerio and extract data
    const $ = cheerio.load(html)
    
    const title = $('title').text()
    const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get()
    const links = $('a').map((_, el) => $(el).attr('href')).get().filter(Boolean)
    const images = $('img').map((_, el) => $(el).attr('src')).get().filter(Boolean)

    const extractedData = {
      data: {
        title,
        headings,
        links,
        images,
      },
      source_url: api.source_url,
    }

    // 6. Return extracted data
    return new Response(JSON.stringify(extractedData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Handler Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
