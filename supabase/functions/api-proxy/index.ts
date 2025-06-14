
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
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const { method, url, headers: clientHeaders, body: requestBody } = requestData;

    if (!url) {
      console.error('URL is missing from request');
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const upperCaseMethod = method?.toUpperCase() || 'GET';
    console.log(`Making ${upperCaseMethod} request to: ${url}`);

    // Prepare headers - ensure it's an object
    const headers = clientHeaders && typeof clientHeaders === 'object' ? clientHeaders : {};

    // Prepare and send the request to the target API from the server
    const fetchOptions: RequestInit = {
      method: upperCaseMethod,
      headers: headers,
    };

    // Only add a body for methods that support it, and if a body is provided.
    if (requestBody && !['GET', 'HEAD'].includes(upperCaseMethod)) {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    }

    console.log('Fetch options:', { ...fetchOptions, headers: Object.keys(headers) });

    const targetApiResponse = await fetch(url, fetchOptions);
    console.log('Target API response status:', targetApiResponse.status);

    // Read the response from the target API
    const responseHeaders: Record<string, string> = {};
    targetApiResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    const responseBody = await targetApiResponse.text();
    console.log('Response body length:', responseBody.length);
    
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
    console.error('Proxy function error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Check the URL and request format'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
