
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Respond to CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the request details from the client
    const { method, url, headers: clientHeaders, body: requestBody } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const upperCaseMethod = method.toUpperCase();

    // Prepare and send the request to the target API from the server
    const fetchOptions: RequestInit = {
      method: upperCaseMethod,
      headers: clientHeaders || {}, // Ensure headers is an object
    };

    // Only add a body for methods that support it, and if a body is provided.
    if (requestBody && !['GET', 'HEAD'].includes(upperCaseMethod)) {
      fetchOptions.body = requestBody;
    }

    const targetApiResponse = await fetch(url, fetchOptions);

    // Read the response from the target API
    const responseHeaders: Record<string, string> = {};
    targetApiResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    const responseBody = await targetApiResponse.text();
    
    // Package the full response to send back to the client
    const proxyResponsePayload = {
      status: targetApiResponse.status,
      statusText: targetApiResponse.statusText,
      headers: responseHeaders,
      body: responseBody,
    };

    return new Response(JSON.stringify(proxyResponsePayload), {
      status: 200, // The proxy request itself was successful
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Handle errors within the proxy function
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
