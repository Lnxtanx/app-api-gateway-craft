
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Level 5: Intelligent Pricing & Access Control Engine
 * Dynamic pricing based on complexity, demand, and usage patterns
 */

interface PricingTier {
  name: string;
  base_price: number;
  features: string[];
  rate_limits: {
    calls_per_minute: number;
    calls_per_day: number;
  };
}

interface ComplexityScore {
  base_score: number;
  javascript_required: number;
  captcha_present: number;
  rate_limiting: number;
  dynamic_content: number;
  total_score: number;
}

class IntelligentPricingEngine {
  private supabase: any;
  
  private pricingTiers: PricingTier[] = [
    {
      name: 'Basic',
      base_price: 0.01,
      features: ['Basic scraping', 'Standard support'],
      rate_limits: { calls_per_minute: 60, calls_per_day: 1000 }
    },
    {
      name: 'Professional', 
      base_price: 0.025,
      features: ['Anti-detection', 'Priority support', 'Custom headers'],
      rate_limits: { calls_per_minute: 300, calls_per_day: 10000 }
    },
    {
      name: 'Enterprise',
      base_price: 0.05,
      features: ['Full stealth mode', 'CAPTCHA solving', 'Dedicated resources'],
      rate_limits: { calls_per_minute: 1000, calls_per_day: 100000 }
    }
  ];

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async calculateComplexityScore(url: string): Promise<ComplexityScore> {
    console.log(`Calculating complexity score for: ${url}`);
    
    let score: ComplexityScore = {
      base_score: 1.0,
      javascript_required: 0,
      captcha_present: 0,
      rate_limiting: 0,
      dynamic_content: 0,
      total_score: 1.0
    };

    try {
      // Analyze URL patterns for complexity indicators
      const urlLower = url.toLowerCase();
      
      // Social media sites often require JS
      if (urlLower.includes('facebook') || urlLower.includes('twitter') || urlLower.includes('instagram')) {
        score.javascript_required = 0.5;
        score.dynamic_content = 0.3;
      }
      
      // E-commerce sites often have anti-bot measures
      if (urlLower.includes('amazon') || urlLower.includes('ebay') || urlLower.includes('shop')) {
        score.rate_limiting = 0.3;
        score.captcha_present = 0.2;
      }
      
      // Government and financial sites have high security
      if (urlLower.includes('.gov') || urlLower.includes('bank') || urlLower.includes('finance')) {
        score.captcha_present = 0.4;
        score.rate_limiting = 0.4;
      }
      
      // News sites often have paywalls
      if (urlLower.includes('news') || urlLower.includes('times') || urlLower.includes('post')) {
        score.javascript_required = 0.2;
        score.dynamic_content = 0.2;
      }

      score.total_score = score.base_score + 
                         score.javascript_required + 
                         score.captcha_present + 
                         score.rate_limiting + 
                         score.dynamic_content;

      return score;
    } catch (error) {
      console.error('Error calculating complexity score:', error);
      return score;
    }
  }

  async calculateDynamicPrice(apiId: string, url: string): Promise<any> {
    try {
      // Get usage statistics
      const usageStats = await this.getUsageStatistics(apiId);
      
      // Calculate complexity score
      const complexity = await this.calculateComplexityScore(url);
      
      // Get demand metrics
      const demand = await this.getDemandMetrics(apiId);
      
      // Base pricing calculation
      let basePrice = this.pricingTiers[0].base_price;
      
      // Complexity multiplier (1x to 3x)
      const complexityMultiplier = Math.min(complexity.total_score, 3.0);
      
      // Demand multiplier (0.5x to 2x)
      const demandMultiplier = Math.max(0.5, Math.min(demand.popularity_score, 2.0));
      
      // Usage-based adjustment
      const usageMultiplier = this.calculateUsageMultiplier(usageStats);
      
      const finalPrice = basePrice * complexityMultiplier * demandMultiplier * usageMultiplier;
      
      return {
        api_id: apiId,
        base_price: basePrice,
        complexity_score: complexity.total_score,
        complexity_multiplier: complexityMultiplier,
        demand_multiplier: demandMultiplier,
        usage_multiplier: usageMultiplier,
        final_price: Math.round(finalPrice * 1000) / 1000,
        recommended_tier: this.getRecommendedTier(complexity.total_score),
        reasoning: this.generatePricingReasoning(complexity, demand, usageStats)
      };
    } catch (error) {
      console.error('Error calculating dynamic price:', error);
      throw error;
    }
  }

  private async getUsageStatistics(apiId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('api_usage_patterns')
        .select('*')
        .eq('api_id', apiId)
        .order('access_time', { ascending: false })
        .limit(100);

      if (error) throw error;

      const totalCalls = data?.length || 0;
      const uniqueUsers = new Set(data?.map(d => d.user_location)).size || 0;
      
      return {
        total_calls: totalCalls,
        unique_users: uniqueUsers,
        avg_calls_per_user: totalCalls / Math.max(uniqueUsers, 1),
        recent_activity: data?.slice(0, 10) || []
      };
    } catch (error) {
      console.error('Error getting usage statistics:', error);
      return { total_calls: 0, unique_users: 0, avg_calls_per_user: 0, recent_activity: [] };
    }
  }

  private async getDemandMetrics(apiId: string): Promise<any> {
    // Simulate demand calculation based on usage patterns
    const usageStats = await this.getUsageStatistics(apiId);
    
    let popularityScore = 1.0;
    
    if (usageStats.total_calls > 100) popularityScore += 0.5;
    if (usageStats.unique_users > 10) popularityScore += 0.3;
    if (usageStats.avg_calls_per_user > 5) popularityScore += 0.2;
    
    return {
      popularity_score: Math.min(popularityScore, 2.0),
      growth_trend: Math.random() * 0.4 + 0.8, // 0.8 to 1.2
      market_demand: usageStats.total_calls / 100 // Normalize to 0-1 range
    };
  }

  private calculateUsageMultiplier(usageStats: any): number {
    // High usage = higher price
    if (usageStats.total_calls > 1000) return 1.3;
    if (usageStats.total_calls > 500) return 1.2;
    if (usageStats.total_calls > 100) return 1.1;
    if (usageStats.total_calls < 10) return 0.8; // Encourage adoption
    return 1.0;
  }

  private getRecommendedTier(complexityScore: number): string {
    if (complexityScore >= 2.5) return 'Enterprise';
    if (complexityScore >= 1.5) return 'Professional';
    return 'Basic';
  }

  private generatePricingReasoning(complexity: ComplexityScore, demand: any, usage: any): string {
    const reasons = [];
    
    if (complexity.javascript_required > 0.3) {
      reasons.push('JavaScript rendering required');
    }
    if (complexity.captcha_present > 0.2) {
      reasons.push('CAPTCHA protection detected');
    }
    if (complexity.rate_limiting > 0.2) {
      reasons.push('Rate limiting measures present');
    }
    if (demand.popularity_score > 1.5) {
      reasons.push('High demand endpoint');
    }
    if (usage.total_calls > 500) {
      reasons.push('Heavy usage patterns');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Standard pricing applies';
  }

  async updateApiPricing(apiId: string, newPrice: number): Promise<any> {
    try {
      // Update pricing in the generated_apis table (add pricing column if needed)
      const { data, error } = await this.supabase
        .from('generated_apis')
        .update({ pricing: newPrice })
        .eq('id', apiId)
        .select();

      if (error) throw error;

      // Log pricing change
      console.log(`Updated pricing for API ${apiId} to $${newPrice}`);
      
      return {
        success: true,
        api_id: apiId,
        new_price: newPrice,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating API pricing:', error);
      throw error;
    }
  }

  async getAccessControlSettings(userId: string, apiId: string): Promise<any> {
    try {
      // Get user's subscription tier
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const tier = userData?.subscription_tier || 'free';
      const tierIndex = this.pricingTiers.findIndex(t => t.name.toLowerCase() === tier.toLowerCase());
      const userTier = tierIndex >= 0 ? this.pricingTiers[tierIndex] : this.pricingTiers[0];

      // Get current usage
      const { data: usageData, error: usageError } = await this.supabase
        .from('api_usage_patterns')
        .select('*')
        .eq('api_id', apiId)
        .gte('access_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const todayUsage = usageData?.length || 0;
      
      return {
        user_tier: userTier.name,
        rate_limits: userTier.rate_limits,
        features_available: userTier.features,
        current_usage: {
          today: todayUsage,
          remaining: Math.max(0, userTier.rate_limits.calls_per_day - todayUsage)
        },
        access_granted: todayUsage < userTier.rate_limits.calls_per_day
      };
    } catch (error) {
      console.error('Error getting access control settings:', error);
      throw error;
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, api_id, url, user_id, new_price } = await req.json();
    const pricingEngine = new IntelligentPricingEngine(supabaseAdmin);

    switch (action) {
      case 'calculate_price': {
        if (!api_id || !url) {
          return new Response(JSON.stringify({ error: 'api_id and url required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const pricing = await pricingEngine.calculateDynamicPrice(api_id, url);
        return new Response(JSON.stringify(pricing), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'update_pricing': {
        if (!api_id || !new_price) {
          return new Response(JSON.stringify({ error: 'api_id and new_price required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await pricingEngine.updateApiPricing(api_id, new_price);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'check_access': {
        if (!user_id || !api_id) {
          return new Response(JSON.stringify({ error: 'user_id and api_id required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const accessControl = await pricingEngine.getAccessControlSettings(user_id, api_id);
        return new Response(JSON.stringify(accessControl), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'complexity_score': {
        if (!url) {
          return new Response(JSON.stringify({ error: 'url required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const complexity = await pricingEngine.calculateComplexityScore(url);
        return new Response(JSON.stringify(complexity), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default: {
        return new Response(JSON.stringify({ 
          error: 'Invalid action',
          available_actions: ['calculate_price', 'update_pricing', 'check_access', 'complexity_score']
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
  } catch (error) {
    console.error('Pricing Engine Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
