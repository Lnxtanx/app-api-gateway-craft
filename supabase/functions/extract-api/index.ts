
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Simple data quality assessment
function assessDataQuality(data: any[]): { score: number; metrics: any; issues: any[]; autoFixApplied: boolean } {
  if (!data || data.length === 0) {
    return { score: 0, metrics: { overall: 0 }, issues: [], autoFixApplied: false };
  }

  let completenessScore = 0;
  let validityScore = 0;
  let totalFields = 0;
  let filledFields = 0;

  data.forEach(record => {
    Object.values(record).forEach(value => {
      totalFields++;
      if (value !== null && value !== undefined && value !== '') {
        filledFields++;
      }
    });
  });

  completenessScore = totalFields > 0 ? filledFields / totalFields : 0;
  validityScore = 0.8; // Simple assumption for now

  const overallScore = (completenessScore + validityScore) / 2;

  return {
    score: overallScore,
    metrics: { overall: overallScore, completeness: completenessScore, validity: validityScore },
    issues: [],
    autoFixApplied: false
  };
}

// Simple query processing
function processQuery(data: any[], queryParams: any): any {
  let processedData = [...data];
  
  // Apply search if provided
  if (queryParams.search) {
    const searchTerm = queryParams.search.toLowerCase();
    processedData = processedData.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm)
    );
  }

  // Apply filters
  Object.entries(queryParams.filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      processedData = processedData.filter(item => {
        const fieldValue = item[key];
        if (typeof value === 'string' && typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(value.toLowerCase());
        }
        return fieldValue == value;
      });
    }
  });

  // Apply sorting
  if (queryParams.sort) {
    processedData.sort((a, b) => {
      const aVal = a[queryParams.sort.field];
      const bVal = b[queryParams.sort.field];
      
      if (aVal < bVal) return queryParams.sort.order === 'desc' ? 1 : -1;
      if (aVal > bVal) return queryParams.sort.order === 'desc' ? -1 : 1;
      return 0;
    });
  }

  // Apply pagination
  const page = queryParams.pagination?.page || 1;
  const limit = Math.min(queryParams.pagination?.limit || 20, 100);
  const offset = (page - 1) * limit;
  
  const paginatedData = processedData.slice(offset, offset + limit);

  return {
    data: paginatedData,
    metadata: {
      total: processedData.length,
      page,
      limit,
      hasMore: offset + limit < processedData.length,
      executionTime: 50, // Mock timing
      cacheHit: false
    }
  };
}

// Simple data serving (mock for now)
async function serveData(apiId: string, queryParams: any): Promise<any> {
  // Mock data for now - in real implementation this would fetch from the actual API
  const mockData = [
    { id: 1, title: "Sample Product", price: "$29.99", category: "Electronics" },
    { id: 2, title: "Another Item", price: "$45.00", category: "Home" },
    { id: 3, title: "Third Product", price: "$12.99", category: "Books" }
  ];

  return mockData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extract API ID from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const apiId = pathParts[pathParts.length - 1]; // Get the last part of the path
    
    console.log('Extracted API ID:', apiId);
    console.log('Full URL path:', url.pathname);
    
    if (!apiId || apiId === 'extract-api') {
      return new Response(JSON.stringify({ error: 'API ID is required in the URL path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase admin client to query the database
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
            auth: {
                persistSession: false
            }
        }
    );

    // Get API details from database using the extracted API ID
    const { data: apiData, error: apiError } = await supabase
      .from('generated_apis')
      .select('*')
      .eq('api_endpoint', `${Deno.env.get('SUPABASE_URL')}/functions/v1/extract-api/${apiId}`)
      .single()

    console.log('Database query result:', { apiData, apiError });

    if (apiError || !apiData) {
      console.error('API not found in database:', apiError);
      return new Response(JSON.stringify({ 
        error: 'API not found',
        details: `No API found with endpoint ending in ${apiId}`,
        apiId 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse query parameters for advanced processing
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

    // Serve data (simplified for now)
    const rawData = await serveData(apiId, queryParams);

    // Apply Data Quality Assessment
    const qualityReport = assessDataQuality(rawData);
    console.log(`📊 Data quality score: ${(qualityReport.score * 100).toFixed(1)}%`);

    // Apply Query Processing
    const queryResult = processQuery(rawData, queryParams);

    console.log(`✅ Processed ${queryResult.data.length} items`);

    // Enhanced response with quality metrics and processing info
    const enhancedResponse = {
      ...queryResult,
      quality: {
        score: qualityReport.score,
        metrics: qualityReport.metrics,
        issues: qualityReport.issues,
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
