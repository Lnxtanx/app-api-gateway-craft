import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, LoaderCircle, Shield, Sparkles, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import ApiResponseDisplay from '@/components/ApiResponseDisplay';
import ApiQueryInterface from '@/components/ApiQueryInterface';
import Header from '@/components/Header';

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
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden animate-aurora">
      <Header />

      {/* Hero Section with Dark Theme */}
      <section className="relative bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 px-4 py-16 mb-8 border-b border-gray-800 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
            <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Advanced API Generation Platform
            </h2>
            <Zap className="h-8 w-8 text-blue-400 animate-pulse" />
          </div>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 animate-fade-in delay-200">
            Transform any website into a powerful, intelligent API endpoint with our cutting-edge platform.
            <br />
            <span className="font-semibold text-white">No coding required. Enterprise-grade security included.</span>
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12 animate-fade-in delay-400">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 transition-all duration-300 shadow-2xl hover-lift">
              <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-white">Universal Compatibility</h3>
              <p className="text-sm text-gray-400">Works with any website, any data structure</p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 transition-all duration-300 shadow-2xl hover-lift delay-200">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-white">Enterprise Security</h3>
              <p className="text-sm text-gray-400">Bank-grade encryption and access control</p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 transition-all duration-300 shadow-2xl hover-lift delay-400">
              <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-white">Lightning Fast</h3>
              <p className="text-sm text-gray-400">Sub-second response times guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <header className="py-12 relative z-10">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-fade-in">
            API Maker
          </h1>
          <p className="text-xl text-gray-300 animate-fade-in delay-200">
            Enter a website URL to instantly generate a structured API endpoint.
          </p>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center text-center relative z-10">
        <form onSubmit={handleGenerateApi} className="w-full max-w-2xl flex items-center gap-3 mb-12 animate-fade-in delay-400">
          <div className="relative flex-1">
            <Input 
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="h-14 text-lg border-2 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 backdrop-blur-sm shadow-2xl hover:shadow-blue-500/10 pl-4"
            />
            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10 blur opacity-50"></div>
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="h-14 px-8 gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20 hover:scale-105 text-white font-semibold border-0 shimmer-effect" 
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
          <div className="text-lg text-amber-400 bg-gradient-to-r from-amber-900/20 to-orange-900/20 backdrop-blur-sm border border-amber-700/30 p-8 rounded-2xl mb-12 animate-fade-in delay-600 transition-all duration-300 shadow-2xl hover-lift">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-amber-400" />
              <div>
                <p className="font-semibold text-xl text-white">Authentication Required</p>
                <p className="text-base mt-2 text-gray-300">
                  Please <Link to="/auth" className="font-bold underline hover:text-amber-300 transition-colors">log in</Link> to save and manage your generated APIs.
                </p>
              </div>
            </div>
          </div>
        )}

        {apiResult && (
          <div className="w-full max-w-7xl text-left animate-fade-in duration-700">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
                <TabsTrigger value="response" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300 text-gray-300">
                  API Response
                </TabsTrigger>
                <TabsTrigger value="query" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300 text-gray-300">
                  Query Interface
                </TabsTrigger>
              </TabsList>

              <TabsContent value="response" className="space-y-6 mt-6">
                {queryResult ? (
                  <div className="animate-fade-in">
                    <ApiResponseDisplay
                      data={queryResult}
                      endpoint={apiResult.endpoint}
                      apiKey={apiResult.apiKey}
                    />
                  </div>
                ) : (
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-2 border-gray-800 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="h-5 w-5 text-green-400" />
                        API Generated Successfully!
                      </CardTitle>
                      <CardDescription className="text-gray-400">Your API is ready! Use the Query Interface to test it.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-gray-700">
                        <p className="text-sm font-medium text-gray-300 mb-2">Endpoint:</p>
                        <code className="bg-gray-800 text-green-400 px-3 py-2 rounded border border-gray-700 text-sm break-all block">{apiResult.endpoint}</code>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-gray-700">
                        <p className="text-sm font-medium text-gray-300 mb-2">API Key:</p>
                        <code className="bg-gray-800 text-purple-400 px-3 py-2 rounded border border-gray-700 text-sm break-all block">{apiResult.apiKey}</code>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="query" className="space-y-6 mt-6">
                <div className="animate-fade-in">
                  <ApiQueryInterface
                    endpoint={apiResult.endpoint}
                    apiKey={apiResult.apiKey}
                    onQuery={handleQuery}
                    isLoading={isQuerying}
                    availableFields={availableFields}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-gray-800 bg-gray-900/30 backdrop-blur-sm relative z-10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span>Built with</span>
            <span className="text-red-400 animate-pulse">♥</span>
            <span>by Lovable &amp; Vivek</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
