
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PricingDashboard from '@/components/PricingDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, DollarSign, TrendingUp, Target } from 'lucide-react';

export default function BusinessIntelligencePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access business intelligence features
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Business Intelligence</h1>
            <p className="text-muted-foreground">
              Advanced analytics, pricing optimization, and revenue insights
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 text-center">
              <BarChart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-900">Analytics Engine</h3>
              <p className="text-xs text-blue-700">Usage pattern analysis</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-900">Smart Pricing</h3>
              <p className="text-xs text-green-700">Dynamic pricing optimization</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-purple-900">Revenue Insights</h3>
              <p className="text-xs text-purple-700">Performance optimization</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-orange-900">Predictive Scaling</h3>
              <p className="text-xs text-orange-700">Resource optimization</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
