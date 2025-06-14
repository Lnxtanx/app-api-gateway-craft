import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StealthScrapingInterface from '@/components/StealthScrapingInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Globe, Brain } from 'lucide-react';

export default function StealthScrapingPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the stealth scraping engine
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
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Stealth Scraping Engine</h1>
            <p className="text-muted-foreground">
              Level 4: Advanced anti-detection and distributed architecture
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-900">Anti-Detection</h3>
              <p className="text-xs text-blue-700">Browser fingerprint rotation</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <Globe className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-900">Distributed</h3>
              <p className="text-xs text-green-700">Multi-region processing</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-purple-900">AI-Powered</h3>
              <p className="text-xs text-purple-700">CAPTCHA auto-solving</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-orange-900">Human-Like</h3>
              <p className="text-xs text-orange-700">Behavioral simulation</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <StealthScrapingInterface />
    </div>
  );
}
