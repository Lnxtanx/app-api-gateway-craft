
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedApiTester from '@/components/EnhancedApiTester';
import ApiStatsCard from '@/components/ApiStatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, Zap, Globe, Shield } from 'lucide-react';

export default function ApiTesterPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the API testing tools
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
          <TestTube className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">API Testing Suite</h1>
            <p className="text-muted-foreground">
              Comprehensive API testing and monitoring tools
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-900">Fast Testing</h3>
              <p className="text-xs text-blue-700">Quick API response testing</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <Globe className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-900">Global Reach</h3>
              <p className="text-xs text-green-700">Test APIs worldwide</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-purple-900">Secure</h3>
              <p className="text-xs text-purple-700">Protected testing environment</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 text-center">
              <TestTube className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-orange-900">Advanced</h3>
              <p className="text-xs text-orange-700">Full HTTP method support</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnhancedApiTester />
        </div>
        <div>
          <ApiStatsCard />
        </div>
      </div>
    </div>
  );
}
