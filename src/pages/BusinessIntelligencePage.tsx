
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PricingDashboard from '@/components/PricingDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart } from 'lucide-react';

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
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Business Intelligence</h1>
            <p className="text-muted-foreground">
              Advanced analytics, pricing optimization, and revenue insights
            </p>
          </div>
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
