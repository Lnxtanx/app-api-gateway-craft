
import React from 'react';
import Header from '@/components/Header';
import StealthScrapingInterface from '@/components/StealthScrapingInterface';
import EnhancedStatusDashboard from '@/components/EnhancedStatusDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, Crown, Zap, Brain } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const StealthScrapingPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex justify-center items-center gap-3 mb-6">
                <Shield className="h-12 w-12 text-primary" />
                <Crown className="h-10 w-10 text-amber-500" />
                <Brain className="h-12 w-12 text-purple-500" />
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
                🛡️ Stealth Scraping Engine
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Level 4 Military-Grade Intelligence: Anti-detection scraping with human behavior simulation, 
                CAPTCHA handling, and distributed job processing.
              </p>
            </div>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Level 1-4 Stealth Protection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Military-Grade Anti-Detection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">AI-Powered Behavior Simulation</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-green-500" />
                      <span className="font-medium">98-99% Success Rate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Banking/Government Grade</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Legal Compliance Integration</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-4">Authentication Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Access to advanced stealth scraping requires a secure account
                  </p>
                  <Link 
                    to="/auth" 
                    className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Secure Access Portal
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
                🛡️ Stealth Scraping Engine
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Level 4 Military-Grade Intelligence: Anti-detection scraping with human behavior simulation, 
                CAPTCHA handling, and distributed job processing.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Status Dashboard */}
        <div className="mb-8">
          <EnhancedStatusDashboard />
        </div>
        
        <StealthScrapingInterface />
      </div>
    </div>
  );
};

export default StealthScrapingPage;
