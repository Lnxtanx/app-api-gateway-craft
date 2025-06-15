
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
import { ArrowRight, LoaderCircle, Brain, Zap, Database, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';

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
      if (scrapedData.data && scrapedData.data.length > 0) {
        const fields = Object.keys(scrapedData.data[0]);
        setAvailableFields(fields);
      } else {
        // Fallback fields if no data is available
        setAvailableFields(['title', 'content', 'price', 'category', 'author', 'date']);
      }

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
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
          Create an API from any website
        </h2>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
          Enter a URL, and we'll give you a structured API to access its content. 
          Now with Level 3 AI enhancement, real-time sync, and intelligent data processing.
        </p>

        <form onSubmit={handleGenerateApi} className="w-full max-w-xl flex items-center gap-2 mb-8">
          <Input 
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="h-12 text-base"
          />
          <Button type="submit" size="lg" className="h-12 gap-2" disabled={isLoading}>
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
          <p className="text-lg text-amber-500 bg-amber-500/10 p-4 rounded-md mb-8 animate-in fade-in-50">
            Please <Link to="/auth" className="font-bold underline">log in</Link> to save and manage your generated APIs.
          </p>
        )}

        {isLoading && (
           <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Crafting your API with Level 3 AI intelligence... this might take a moment.</p>
            <div className="text-sm text-muted-foreground max-w-md">
              <p className="flex items-center gap-2"><Brain className="h-4 w-4" /> AI is analyzing content patterns and entities</p>
              <p className="flex items-center gap-2"><Zap className="h-4 w-4" /> Setting up real-time synchronization</p>
              <p className="flex items-center gap-2"><Database className="h-4 w-4" /> Enhancing data with quality assessment</p>
              <p className="flex items-center gap-2"><Search className="h-4 w-4" /> Generating smart query interface</p>
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
      
      <footer className="py-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Built with love by Lovable.
        </div>
      </footer>
    </div>
  );
};

export default Index;
