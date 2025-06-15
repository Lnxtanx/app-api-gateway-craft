import { useState } from 'react';
import Header from '@/components/Header';
import AdvancedApiFeatures from '@/components/AdvancedApiFeatures';
import RealTimeNotifications from '@/components/RealTimeNotifications';
import IntelligentContentAnalyzer from '@/components/IntelligentContentAnalyzer';
import ApiResponseDisplay from '@/components/ApiResponseDisplay';
import ApiQueryInterface from '@/components/ApiQueryInterface';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, LoaderCircle, Brain, Zap, Database, Search, Shield, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import AdvancedLogger from '@/components/AdvancedLogger';
import EnhancedStatusDashboard from '@/components/EnhancedStatusDashboard';

interface QueryParams {
  search?: string;
  page: number;
  limit: number;
  sort?: string;
  order: 'asc' | 'desc';
  filters: { [key: string]: string };
}

const Index = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [showIntelligentAnalysis, setShowIntelligentAnalysis] = useState(false);
  const [scrapedHtml, setScrapedHtml] = useState('');
  const [apiResult, setApiResult] = useState<{
    endpoint: string;
    apiKey: string;
    responseData?: any;
  } | null>(null);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('response');
  const [showAdvancedLogger, setShowAdvancedLogger] = useState(false);
  const [intelligenceLevel, setIntelligenceLevel] = useState(5); // Default to Level 5

  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerateApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    console.log("Attempting to generate API...");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("User object from AuthContext:", user);
    console.log("Current session from Supabase client:", session);

    if (!user) {
      toast({
        title: "Authentication Required",
        description: (
          <p>
            Please <Link to="/auth" className="font-bold underline">log in or sign up</Link> to generate an API.
          </p>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setShowAdvancedLogger(true);
    setApiResult(null);
    setQueryResult(null);
    setShowIntelligentAnalysis(false);
    setActiveTab('response');

    try {
      const { data: generatedApiData, error } = await supabase.functions.invoke('generate-api', {
        body: { source_url: url },
      });

      console.log("Response from 'generate-api' function:", { generatedApiData, error });

      if (error) {
        throw new Error(error.message);
      }
      
      if (generatedApiData.error) {
        throw new Error(generatedApiData.error);
      }

      // Fetch initial data from the new endpoint to show enhanced response
      const initialScrapeResponse = await fetch(generatedApiData.api_endpoint, {
        headers: {
          'x-api-key': generatedApiData.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (!initialScrapeResponse.ok) {
        const errData = await initialScrapeResponse.json();
        throw new Error(`API call failed: ${errData.error || initialScrapeResponse.statusText}`);
      }
      
      const scrapedData = await initialScrapeResponse.json();

      // Extract available fields for query interface
      let fields: string[] = [];
      if (scrapedData.data && Array.isArray(scrapedData.data) && scrapedData.data.length > 0) {
        const firstItem = scrapedData.data[0];
        if (firstItem && typeof firstItem === 'object') {
          fields = Object.keys(firstItem);
        }
      }
      
      // Set fallback fields if no fields were extracted
      if (fields.length === 0) {
        fields = ['title', 'content', 'price', 'category', 'author', 'date'];
      }
      
      setAvailableFields(fields);

      // Extract HTML content for intelligent analysis
      if (scrapedData.api?.source_url) {
        try {
          const htmlResponse = await fetch(url);
          const htmlContent = await htmlResponse.text();
          setScrapedHtml(htmlContent);
          setShowIntelligentAnalysis(true);
        } catch (htmlError) {
          console.warn("Could not fetch HTML for analysis:", htmlError);
        }
      }

      const result = {
        endpoint: generatedApiData.api_endpoint,
        apiKey: generatedApiData.api_key,
        responseData: scrapedData,
      };
      
      setApiResult(result);
      setQueryResult(scrapedData);

      toast({
        title: "API Generated Successfully",
        description: `Your API is ready with ${scrapedData.metadata?.total || 0} items and ${(scrapedData.quality?.score * 100).toFixed(1)}% data quality.`,
      });

    } catch (error: any) {
       let errorMessage = error.message;
       try {
         const parsed = JSON.parse(error.message);
         errorMessage = parsed.message || parsed.error || errorMessage;
       } catch (e) {
         // Not a JSON error, use as is.
       }
       toast({
        title: "Error Generating API",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowAdvancedLogger(false), 3000); // Show logger a bit longer for military effect
    }
  };

  const handleQuery = async (params: QueryParams) => {
    if (!apiResult) return;

    setIsQuerying(true);
    try {
      // Build query URL
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.sort) {
        queryParams.append('sort', params.sort);
        queryParams.append('order', params.order);
      }
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParams.append(key, value);
      });

      const queryUrl = `${apiResult.endpoint}?${queryParams.toString()}`;
      
      const response = await fetch(queryUrl, {
        headers: {
          'x-api-key': apiResult.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Query failed: ${errData.error || response.statusText}`);
      }

      const result = await response.json();
      setQueryResult(result);

      // Switch to response tab to show results
      setActiveTab('response');

      toast({
        title: "Query Executed",
        description: `Found ${result.metadata?.total || 0} items in ${result.metadata?.executionTime || 0}ms`,
      });

    } catch (error: any) {
      toast({
        title: "Query Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleAnalysisComplete = (result: any) => {
    console.log('🎉 Intelligent analysis completed:', result);
    toast({
      title: "AI Analysis Complete",
      description: `Detected ${result.classification.primaryType} website with ${result.extraction.data.length} structured items and ${result.apiSpec.endpoints.length} API endpoints.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Create an API from any website
        </h2>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
          Enter a URL, and we'll give you a structured API to access its content. 
          Now with Level 5 Military-Grade AI enhancement, quantum stealth protocols, and zero-footprint intelligence.
        </p>

        {/* Enhanced Status Dashboard */}
        {!isLoading && !apiResult && (
          <div className="w-full max-w-6xl mb-8">
            <EnhancedStatusDashboard />
          </div>
        )}

        <form onSubmit={handleGenerateApi} className="w-full max-w-xl flex items-center gap-2 mb-8">
          <Input 
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="h-12 text-base border-2 focus:border-primary transition-colors"
          />
          <Button 
            type="submit" 
            size="lg" 
            className="h-12 gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300" 
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Generate API <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {!user && !isLoading && (
          <div className="text-lg text-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-xl mb-8 animate-in fade-in-50">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-amber-500" />
              <div>
                <p className="font-semibold">Enhanced features available with account</p>
                <p className="text-sm mt-1">
                  Please <Link to="/auth" className="font-bold underline hover:text-amber-700 transition-colors">log in</Link> to save and manage your generated APIs with Level 5 Military-Grade features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Military-Grade Logger */}
        {showAdvancedLogger && (
          <div className="w-full max-w-6xl mb-8 animate-in fade-in-50 duration-500">
            <AdvancedLogger 
              isActive={isLoading} 
              url={url}
              intelligenceLevel={intelligenceLevel}
              onComplete={() => {
                console.log('Military-grade intelligence operation completed');
              }} 
            />
          </div>
        )}

        {isLoading && !showAdvancedLogger && (
           <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 border-2 border-purple-200 rounded-2xl animate-in fade-in-50">
            <div className="relative">
              <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
              <Crown className="h-6 w-6 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Deploying Level {intelligenceLevel} Military-Grade Intelligence
              </h3>
              <p className="text-muted-foreground mb-4">Quantum protocols initializing for maximum stealth...</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground max-w-lg">
              <p className="flex items-center gap-2"><Brain className="h-4 w-4 text-purple-500" /> Neural behavior simulation</p>
              <p className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-500" /> Quantum fingerprint masking</p>
              <p className="flex items-center gap-2"><Database className="h-4 w-4 text-green-500" /> Multi-vector extraction</p>
              <p className="flex items-center gap-2"><Search className="h-4 w-4 text-orange-500" /> Zero-footprint intelligence</p>
            </div>
           </div>
        )}

        {/* Show intelligent analysis when HTML is available */}
        {showIntelligentAnalysis && scrapedHtml && (
          <div className="w-full max-w-6xl mb-6">
            <IntelligentContentAnalyzer
              url={url}
              html={scrapedHtml}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        )}

        {/* Show real-time notifications for logged-in users */}
        {user && !isLoading && (
          <div className="w-full max-w-4xl mb-6">
            <RealTimeNotifications />
          </div>
        )}

        {apiResult && (
          <div className="w-full max-w-6xl text-left animate-in fade-in-50 duration-500">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="response">API Response</TabsTrigger>
                <TabsTrigger value="query">Query Interface</TabsTrigger>
                <TabsTrigger value="features">Advanced Features</TabsTrigger>
              </TabsList>

              <TabsContent value="response" className="space-y-6">
                {queryResult ? (
                  <ApiResponseDisplay
                    data={queryResult}
                    endpoint={apiResult.endpoint}
                    apiKey={apiResult.apiKey}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>API Generated</CardTitle>
                      <CardDescription>Your API is ready! Use the Query Interface to test it.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Endpoint: <code className="bg-muted px-2 py-1 rounded">{apiResult.endpoint}</code>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        API Key: <code className="bg-muted px-2 py-1 rounded">{apiResult.apiKey}</code>
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="query" className="space-y-6">
                <ApiQueryInterface
                  endpoint={apiResult.endpoint}
                  apiKey={apiResult.apiKey}
                  onQuery={handleQuery}
                  isLoading={isQuerying}
                  availableFields={availableFields}
                />
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                {apiResult.responseData ? (
                  <AdvancedApiFeatures apiData={apiResult.responseData} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Features</CardTitle>
                      <CardDescription>
                        Advanced API features will be available once data is loaded.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Execute a query first to see advanced features and analytics.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t bg-gradient-to-r from-background to-muted/20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <span className="text-red-500">♥</span>
            <span>by Lovable</span>
            <span className="mx-2">•</span>
            <span className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-amber-500" />
              Level 5 Military-Grade AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
