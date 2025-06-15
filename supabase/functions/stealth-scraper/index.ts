
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
      try {
        requestData = await parseRequestBody(req, operationId);
      } catch (parseError: any) {
        return logAndRespondError(operationId, parseError.err || 'Bad POST body', 400, parseError.details);
      }

      const action = requestData.action;
      if (!action) {
        return logAndRespondError(operationId, "Missing 'action' in scrape request.", 400, requestData);
      }

      if (action === 'scrape') {
        return await handleScrape(requestData, operationId, startTime, corsHeaders, logAndRespondError);
      } else if (action === 'enqueue') {
        return await handleEnqueue(requestData, operationId, corsHeaders, logAndRespondError);
      } else {
        return logAndRespondError(operationId, `Invalid military operation '${action}'`, 400, {
          supported_operations: ['scrape', 'enqueue'],
          received_operation: action
        });
      }
    }

    return logAndRespondError(operationId, `Method ${req.method} not supported`, 405, {
      allowed_methods: ['GET', 'POST']
    });
  } catch (error: any) {
    return logAndRespondError(operationId, `Critical top-level failure: ${error.message || String(error)}`, 500);
  }
});
