import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, LoaderCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import ApiResponseDisplay from '@/components/ApiResponseDisplay';
import ApiQueryInterface from '@/components/ApiQueryInterface';
import Header from '@/components/Header'; // Added Header import

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
    setActiveTab('response');

    try {
      const { data: generatedApiData, error } = await supabase.functions.invoke('generate-api', {
        body: { source_url: url },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (generatedApiData.error) {
        throw new Error(generatedApiData.error);
      }

      // Fetch initial data from the new endpoint to show response
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
      
      if (fields.length === 0) {
        fields = ['title', 'content', 'price', 'category', 'author', 'date'];
      }
      setAvailableFields(fields);

      const result = {
        endpoint: generatedApiData.api_endpoint,
        apiKey: generatedApiData.api_key,
        responseData: scrapedData,
      };
      
      setApiResult(result);
      setQueryResult(scrapedData);

      toast({
        title: "API Generated Successfully",
        description: `Your API is ready with ${scrapedData.metadata?.total || 0} items.`,
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Detailed Overview Section */}
      <section className="bg-muted px-4 py-8 mb-6 border-b">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-primary">
            Advanced API Generation & Testing Platform
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Welcome to your one-stop solution for transforming website data into powerful APIs for business intelligence and automation.
            <br /><br />
            <b>How it works:</b> Instantly generate structured API endpoints from any website URL and receive a secure API key. Use our intelligent platform to query, test, and analyze the generated endpoints with customizable parameters, sorting, and filtering—no manual backend coding required! 
            <br /><br />
            <b>Key Benefits:</b>
            <ul className="list-disc text-left mx-auto max-w-xl mt-2 mb-0 pl-8 text-base text-muted-foreground">
              <li>🔑 <b>API Maker:</b> Generate unique API keys for each website, unlocking secure access to real-time web data.</li>
              <li>🧠 <b>Intelligent Query Engine:</b> Easily test, sort, and filter data using a modern and user-friendly interface.</li>
              <li>📈 <b>Business-Ready:</b> Empower your applications, automate workflows, and enhance analytics with reliable API endpoints tailored for any business need.</li>
              <li>🤖 <b>No-Code & Secure:</b> Forget about complex backend logic or scraping scripts—our system handles everything with enterprise-grade security.</li>
            </ul>
            <br />
            <b>Get started by generating your API below. Perfect for analysts, developers, and business teams seeking advanced, intelligent data integration.</b>
          </p>
        </div>
      </section>

      <header className="py-8">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 text-primary">
            API Maker
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter a website URL to instantly generate a structured API endpoint.
          </p>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center text-center">
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
                <p className="font-semibold">Login required</p>
                <p className="text-sm mt-1">
                  Please <Link to="/auth" className="font-bold underline hover:text-amber-700 transition-colors">log in</Link> to save and manage your generated APIs.
                </p>
              </div>
            </div>
          </div>
        )}

        {apiResult && (
          <div className="w-full max-w-6xl text-left animate-in fade-in-50 duration-500">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="response">API Response</TabsTrigger>
                <TabsTrigger value="query">Query Interface</TabsTrigger>
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
            </Tabs>
          </div>
        )}
      </main>
      <footer className="py-6 border-t">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <span className="text-red-500">♥</span>
            <span>by Lovable &amp; Vivek</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
