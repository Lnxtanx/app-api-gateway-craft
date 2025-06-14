import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

import { RealTimeDataServingEngine } from '../../../src/services/RealTimeDataServingEngine.ts';
import { QueryProcessingEngine } from '../../../src/services/QueryProcessingEngine.ts';
import { DataQualityAssuranceEngine } from '../../../src/services/DataQualityAssuranceEngine.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiId = req.url.split('/').pop()
    if (!apiId) {
      return new Response(JSON.stringify({ error: 'API ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
            auth: {
                persistSession: false
            }
        }
    );

    // Get API details from database
    const { data: apiData, error: apiError } = await supabase
      .from('generated_apis')
      .select('*')
      .eq('id', apiId)
      .single()

    if (apiError || !apiData) {
      return new Response(JSON.stringify({ error: 'API not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse query parameters for advanced processing
    const url = new URL(req.url);
    const queryParams = {
      search: url.searchParams.get('search') || undefined,
      filters: {},
      sort: url.searchParams.get('sort') ? {
        field: url.searchParams.get('sort')!,
        order: (url.searchParams.get('order') as 'asc' | 'desc') || 'asc'
      } : undefined,
      pagination: {
        page: parseInt(url.searchParams.get('page') || '1'),
        limit: Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
      },
      fields: url.searchParams.get('fields')?.split(',') || undefined
    };

    // Parse filters from query parameters
    for (const [key, value] of url.searchParams.entries()) {
      if (!['search', 'sort', 'order', 'page', 'limit', 'fields'].includes(key)) {
        queryParams.filters[key] = value;
      }
    }

    console.log(`🚀 Processing request for API ${apiId} with query params:`, queryParams);

    // Use Real-Time Data Serving Engine for intelligent caching
    const rawData = await RealTimeDataServingEngine.serveData(
      apiId,
      queryParams,
      'ecommerce' // This would be detected from website classification
    );

    // Apply Data Quality Assurance
    const qualityReport = await DataQualityAssuranceEngine.assessDataQuality(rawData, 'ecommerce');
    console.log(`📊 Data quality score: ${(qualityReport.metrics.overall * 100).toFixed(1)}%`);

    // Clean data if quality is below threshold
    let processedData = rawData;
    if (qualityReport.metrics.overall < 0.7) {
      console.log(`🧹 Auto-cleaning data due to quality score below threshold`);
      processedData = DataQualityAssuranceEngine.cleanDataAutomatically(rawData, 'ecommerce');
    }

    // Apply Query Processing Intelligence
    const queryResult = await QueryProcessingEngine.processQuery(
      processedData,
      queryParams,
      'ecommerce'
    );

    console.log(`✅ Processed ${queryResult.data.length} items in ${queryResult.metadata.executionTime}ms`);

    // Enhanced response with quality metrics and processing info
    const enhancedResponse = {
      ...queryResult,
      quality: {
        score: qualityReport.metrics.overall,
        metrics: qualityReport.metrics,
        issues: qualityReport.issues.filter(issue => issue.severity === 'high' || issue.severity === 'critical'),
        autoFixApplied: qualityReport.autoFixApplied
      },
      api: {
        id: apiData.id,
        source_url: apiData.source_url,
        created_at: apiData.created_at,
        version: '2.0'
      }
    };

    return new Response(JSON.stringify(enhancedResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Extract API Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      version: '2.0'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
