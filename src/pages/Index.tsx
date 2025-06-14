
import { useState } from 'react';
import Header from '@/components/Header';
import CodeBlock from '@/components/CodeBlock';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';

const Index = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<{
    endpoint: string;
    apiKey: string;
    curl: string;
    response: string;
  } | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerateApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // --- Start Debugging Logs ---
    console.log("Attempting to generate API...");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("User object from AuthContext:", user);
    console.log("Current session from Supabase client:", session);
    // --- End Debugging Logs ---

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

      // Fetch initial data from the new endpoint to show a real example
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

      const result = {
        endpoint: generatedApiData.api_endpoint,
        apiKey: generatedApiData.api_key,
        curl: `curl "${generatedApiData.api_endpoint}" \\\n  -H "x-api-key: ${generatedApiData.api_key}"`,
        response: JSON.stringify(scrapedData, null, 2),
      };
      
      setApiResult(result);

    } catch (error: any) {
       let errorMessage = error.message;
       try {
         // Supabase function errors can be stringified JSON, try to parse for a cleaner message.
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
          Create an API from any website
        </h2>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
          Enter a URL, and we'll give you a structured API to access its content. No-code, no-hassle, instant results.
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
            <p className="text-muted-foreground">Crafting your API... this might take a moment.</p>
           </div>
        )}

        {apiResult && (
          <div className="w-full max-w-4xl grid gap-6 text-left animate-in fade-in-50 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={apiResult.endpoint} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={apiResult.apiKey} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>cURL Example</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={apiResult.curl} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Example Response</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={apiResult.response} />
              </CardContent>
            </Card>
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
