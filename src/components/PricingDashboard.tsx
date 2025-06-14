
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Target, Zap, Calculator, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PricingData {
  api_id: string;
  base_price: number;
  complexity_score: number;
  complexity_multiplier: number;
  demand_multiplier: number;
  usage_multiplier: number;
  final_price: number;
  recommended_tier: string;
  reasoning: string;
}

export default function PricingDashboard() {
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [complexityResult, setComplexityResult] = useState<any>(null);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      const { data: apis, error } = await supabase
        .from('generated_apis')
        .select('*')
        .limit(10);

      if (error) throw error;

      const pricingPromises = (apis || []).map(async (api) => {
        try {
          const { data, error } = await supabase.functions.invoke('pricing-engine', {
            body: {
              action: 'calculate_price',
              api_id: api.id,
              url: api.source_url
            }
          });

          if (error) throw error;
          return data;
        } catch (error) {
          console.error(`Failed to calculate pricing for API ${api.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(pricingPromises);
      setPricingData(results.filter(r => r !== null));
    } catch (error) {
      console.error('Failed to load pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testComplexityScore = async () => {
    if (!testUrl) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('pricing-engine', {
        body: {
          action: 'complexity_score',
          url: testUrl
        }
      });

      if (error) throw error;
      setComplexityResult(data);
    } catch (error) {
      console.error('Failed to test complexity score:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = async (apiId: string, newPrice: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('pricing-engine', {
        body: {
          action: 'update_pricing',
          api_id: apiId,
          new_price: newPrice
        }
      });

      if (error) throw error;
      console.log('Pricing updated:', data);
      loadPricingData(); // Refresh data
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Smart Pricing Dashboard</h2>
          <p className="text-muted-foreground">AI-powered dynamic pricing and complexity analysis</p>
        </div>
        <Button onClick={loadPricingData} disabled={loading} className="gap-2">
          <Zap className="h-4 w-4" />
          Refresh Pricing
        </Button>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="complexity">Complexity Analysis</TabsTrigger>
          <TabsTrigger value="tiers">Access Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${pricingData.length > 0 ? 
                    (pricingData.reduce((sum, p) => sum + p.final_price, 0) / pricingData.length).toFixed(3) : 
                    '0.000'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Per API call</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price Range</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pricingData.length > 0 ? 
                    `$${Math.min(...pricingData.map(p => p.final_price)).toFixed(3)} - $${Math.max(...pricingData.map(p => p.final_price)).toFixed(3)}` :
                    '$0.000 - $0.000'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Min - Max pricing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Complexity Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pricingData.length > 0 ? 
                    (pricingData.reduce((sum, p) => sum + p.complexity_score, 0) / pricingData.length).toFixed(1) : 
                    '0.0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Average complexity</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Pricing Overview</CardTitle>
              <CardDescription>Dynamic pricing based on complexity, demand, and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingData.map((pricing, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">API {pricing.api_id.slice(0, 8)}...</h4>
                        <p className="text-sm text-muted-foreground">{pricing.reasoning}</p>
                      </div>
                      <Badge className={getTierColor(pricing.recommended_tier)}>
                        {pricing.recommended_tier}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Base Price</p>
                        <p className="font-medium">${pricing.base_price.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Complexity</p>
                        <p className="font-medium">{pricing.complexity_multiplier.toFixed(1)}x</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Demand</p>
                        <p className="font-medium">{pricing.demand_multiplier.toFixed(1)}x</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Final Price</p>
                        <p className="font-bold text-green-600">${pricing.final_price.toFixed(3)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updatePricing(pricing.api_id, pricing.final_price)}
                      >
                        Apply Pricing
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complexity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Complexity Score Calculator
              </CardTitle>
              <CardDescription>Test scraping complexity for any URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL to analyze..."
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={testComplexityScore} disabled={loading || !testUrl}>
                  Analyze
                </Button>
              </div>

              {complexityResult && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Complexity Analysis Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Score</p>
                      <p className="font-bold">{complexityResult.base_score}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">JavaScript Required</p>
                      <p className="font-bold">{complexityResult.javascript_required}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CAPTCHA Present</p>
                      <p className="font-bold">{complexityResult.captcha_present}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate Limiting</p>
                      <p className="font-bold">{complexityResult.rate_limiting}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dynamic Content</p>
                      <p className="font-bold">{complexityResult.dynamic_content}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <p className="font-bold text-lg">{complexityResult.total_score.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Basic Tier</CardTitle>
                <CardDescription>Standard scraping capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">$0.01</div>
                  <p className="text-sm text-muted-foreground">per API call</p>
                  <ul className="text-sm space-y-1">
                    <li>• Basic scraping</li>
                    <li>• Standard support</li>
                    <li>• 60 calls/minute</li>
                    <li>• 1,000 calls/day</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Professional Tier</CardTitle>
                <CardDescription>Enhanced anti-detection features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">$0.025</div>
                  <p className="text-sm text-muted-foreground">per API call</p>
                  <ul className="text-sm space-y-1">
                    <li>• Anti-detection</li>
                    <li>• Priority support</li>
                    <li>• Custom headers</li>
                    <li>• 300 calls/minute</li>
                    <li>• 10,000 calls/day</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Enterprise Tier</CardTitle>
                <CardDescription>Full stealth capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">$0.05</div>
                  <p className="text-sm text-muted-foreground">per API call</p>
                  <ul className="text-sm space-y-1">
                    <li>• Full stealth mode</li>
                    <li>• CAPTCHA solving</li>
                    <li>• Dedicated resources</li>
                    <li>• 1,000 calls/minute</li>
                    <li>• 100,000 calls/day</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
