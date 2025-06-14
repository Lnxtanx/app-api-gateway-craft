
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Activity, Users, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  usage_patterns: any[];
  revenue_metrics: any;
  performance_data: any[];
  user_segments: any[];
}

interface PricingRecommendation {
  api_id: string;
  current_price: number;
  recommended_price: number;
  confidence_score: number;
  reasoning: string;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [pricingRecs, setPricingRecs] = useState<PricingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analytics-engine', {
        body: { action: 'get_analytics' }
      });

      if (error) throw error;
      setAnalytics(data.analytics);
      setPricingRecs(data.pricing_recommendations || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizePerformance = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analytics-engine', {
        body: { action: 'optimize_performance' }
      });

      if (error) throw error;
      console.log('Performance optimization completed:', data);
      loadAnalytics(); // Refresh data
    } catch (error) {
      console.error('Performance optimization failed:', error);
    }
  };

  const applyPricingRecommendation = async (apiId: string, newPrice: number) => {
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
      loadAnalytics(); // Refresh data
    } catch (error) {
      console.error('Pricing update failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const usageData = analytics?.usage_patterns || [];
  const revenueData = analytics?.revenue_metrics || {};
  const performanceData = analytics?.performance_data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Business Intelligence Dashboard</h2>
          <p className="text-muted-foreground">Advanced analytics and monetization insights</p>
        </div>
        <Button onClick={optimizePerformance} className="gap-2">
          <Zap className="h-4 w-4" />
          Optimize Performance
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{revenueData.growth_percentage || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.total_calls || 0}</div>
            <p className="text-xs text-muted-foreground">
              {revenueData.calls_growth || 0}% increase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.active_apis || 0}</div>
            <p className="text-xs text-muted-foreground">
              {revenueData.new_apis || 0} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.avg_response_time || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              -{revenueData.response_improvement || 0}% improved
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pricing">Smart Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage Distribution</CardTitle>
                <CardDescription>Most popular API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageData.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage_count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {usageData.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Pattern Analysis</CardTitle>
              <CardDescription>Detailed breakdown of API usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls_per_hour" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Response times and throughput analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="response_time" stroke="#8884d8" name="Response Time (ms)" />
                  <Line type="monotone" dataKey="throughput" stroke="#82ca9d" name="Throughput (req/s)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Pricing Recommendations</CardTitle>
              <CardDescription>AI-powered pricing optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingRecs.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">API: {rec.api_id}</h4>
                      <Badge variant={rec.confidence_score > 0.8 ? "default" : "secondary"}>
                        {Math.round(rec.confidence_score * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="font-bold">${rec.current_price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Price</p>
                        <p className="font-bold text-green-600">${rec.recommended_price}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
                    <Button 
                      size="sm" 
                      onClick={() => applyPricingRecommendation(rec.api_id, rec.recommended_price)}
                    >
                      Apply Recommendation
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
