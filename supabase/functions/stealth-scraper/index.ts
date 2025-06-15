
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { handleScrape, handleEnqueue } from './handlers.ts';
import { parseRequestBody } from './validators.ts';
import { logAndRespondError } from './errors.ts';
import { getOperationalIntelligence } from './operational-intelligence.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const operationId = crypto.randomUUID();
  const startTime = Date.now();
  try {
    if (req.method === 'GET') {
      const operationalStatus = await getOperationalIntelligence();
      return new Response(JSON.stringify(operationalStatus), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      let requestData: any;
      let bodyText: string | undefined;
      try {
        bodyText = await req.text();
        console.log(`[DEBUG] [${operationId}] Raw POST body:`, bodyText);
        if (!bodyText || bodyText.trim() === '' || bodyText.trim() === '{}' || bodyText.trim() === 'null') {
          console.error(`[ERROR] [${operationId}] Missing or empty request body in POST. Raw:`, bodyText);
          return logAndRespondError(operationId, "Missing or empty request body in POST.", 400);
        }
        requestData = JSON.parse(bodyText);
        if (!requestData || typeof requestData !== 'object') {
          console.error(`[ERROR] [${operationId}] POST body did not resolve to object. Raw:`, bodyText);
          return logAndRespondError(operationId, "POST body did not resolve to a valid object", 400, bodyText);
        }
      } catch (parseError: any) {
        console.error(`[ERROR] [${operationId}] Failed to parse JSON. Raw:`, bodyText, parseError);
        return logAndRespondError(operationId, 'Bad POST body: failed to parse JSON', 400, { error: parseError, raw: bodyText });
      }

      console.log(`[DEBUG] [${operationId}] Parsed POST keys:`, Object.keys(requestData));
      console.log(`[DEBUG] [${operationId}] Parsed POST body:`, JSON.stringify(requestData));

      const action = requestData.action;
      if (!action) {
        console.error(`[ERROR] [${operationId}] Missing 'action' in request.`);
        return logAndRespondError(operationId, "Missing 'action' in scrape request.", 400, requestData);
      }

      if (action === 'scrape') {
        return await handleScrape(requestData, operationId, startTime, corsHeaders, logAndRespondError);
      } else if (action === 'enqueue') {
        return await handleEnqueue(requestData, operationId, corsHeaders, logAndRespondError);
      } else {
        console.error(`[ERROR] [${operationId}] Invalid action: '${action}'`);
        return logAndRespondError(operationId, `Invalid military operation '${action}'`, 400, {
          supported_operations: ['scrape', 'enqueue'],
          received_operation: action
        });
      }
    }

    console.error(`[ERROR] [${operationId}] Method not supported: ${req.method}`);
    return logAndRespondError(operationId, `Method ${req.method} not supported`, 405, {
      allowed_methods: ['GET', 'POST']
    });
  } catch (error: any) {
    console.error(`[CRITICAL] [${operationId}] Top-level failure:`, error);
    return logAndRespondError(operationId, `Critical top-level failure: ${error.message || String(error)}`, 500);
  }
});
