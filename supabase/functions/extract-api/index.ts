
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'
import puppeteer, { Browser } from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Extracts common data fields from a single item element.
 * This helps in creating a structured object for each item in a list.
 */
function extractItemData(element: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI) {
  const getAttr = (selector: string, attr: string) => $(element).find(selector).first().attr(attr) || null
  const getText = (selector: string) => $(element).find(selector).first().text().trim() || null

  const title = getText('h1, h2, h3, h4, h5, h6, [itemprop="name"]') || getAttr('a', 'title')
  const link = getAttr('a', 'href')
  const image = getAttr('img', 'src') || getAttr('img', 'data-src')
  const description = getText('p, [itemprop="description"]')
  
  // A simple regex to find price-like text
  const priceText = getText('[class*="price"], [id*="price"], [itemprop="price"], [itemprop="offers"]');
  const price = priceText ? (priceText.match(/[\$€£]?\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/)?.[0] || null) : null;

  // --- NEW: Extract author and date (simple NER) ---
  const author = getText('[class*="author"], [class*="byline"], [rel="author"], [itemprop="author"]');
  const date = getAttr('time', 'datetime') || getText('time, [class*="date"], [itemprop="datePublished"]');
  // --- END NEW ---

  const item: { [key: string]: string | null } = { title, link, image, description, price, author, date };

  // Remove null/undefined properties for a cleaner output
  Object.keys(item).forEach(key => (item[key] == null) && delete item[key]);

  // Only return an object if it has some meaningful content (a title, link, or image)
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

      // --- NEW: Auto-scroll to handle infinite loading ---
      console.log('Auto-scrolling to load dynamic content...');
      let previousHeight;
      for (let i = 0; i < 5; i++) { // Scroll a maximum of 5 times
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        // Wait for new content to load
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) {
          console.log('Scrolling finished, no new content loaded.');
          break; // Exit if page height hasn't changed
        }
        console.log(`Scrolled down, new page height: ${newHeight}`);
      }
      // --- END NEW ---

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

    // 5. Parse with Cheerio and attempt to extract structured data
    const $ = cheerio.load(html)
    
    let extractedData;
    let items: any[] = [];
    
    // Strategy: Find common list/item container selectors and extract data from their children
    const itemSelectors = 'article, li, [class*="item"], [class*="product"], [class*="post"]';
    $(itemSelectors).each((_, el) => {
      const itemData = extractItemData($(el), $);
      if (itemData) {
        items.push(itemData);
      }
    });

    // If we found a good number of structured items, use that as the primary data.
    if (items.length > 3) {
      extractedData = {
        data: {
          page_title: $('title').text(),
          item_count: items.length,
          items: items,
        },
        source_url: api.source_url,
        _extraction_method: 'structured_list_pattern',
      }
    } else {
      // Fallback to the original simple extraction if no structured data is found
      console.log("Structured extraction failed, using simple fallback.");
      const title = $('title').text()
      const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get()
      const links = $('a').map((_, el) => $(el).attr('href')).get().filter(Boolean)
      const images = $('img').map((_, el) => $(el).attr('src')).get().filter(Boolean)

      extractedData = {
        data: {
          title,
          headings,
          links,
          images,
        },
        source_url: api.source_url,
        _extraction_method: 'simple_fallback',
      }
    }

    // 6. Return extracted data
    return new Response(JSON.stringify(extractedData, null, 2), {
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

