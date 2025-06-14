
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the token
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { source_url } = await req.json()
    if (!source_url) {
      return new Response(JSON.stringify({ error: 'source_url is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase admin client to interact with the database
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    
    // Generate new API details
    const randomId = crypto.randomUUID().split('-')[0];
    const generatedApiKey = `ac_live_${crypto.randomUUID().replace(/-/g, '')}`;
    const generatedEndpoint = `https://api.apicraft.dev/v1/extract/${randomId}`;
    
    // Insert the new API into the database
    const { data: newApi, error } = await supabaseAdmin
      .from('generated_apis')
      .insert({
        user_id: user.id,
        source_url: source_url,
        api_endpoint: generatedEndpoint,
        api_key: generatedApiKey,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting API:', error)
      throw error
    }

    // Return the newly created API details
    return new Response(JSON.stringify(newApi), {
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
