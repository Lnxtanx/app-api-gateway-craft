
import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CodeBlock from '@/components/CodeBlock';
import { LoaderCircle, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

const ApiTesterPage = () => {
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [responseMeta, setResponseMeta] = useState<{ status: number; statusText: string; headers: Record<string, string> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setResponseMeta(null);
    setError(null);

    if (!endpoint.startsWith('http')) {
      setError('Please enter a valid URL (e.g., https://...)');
      setLoading(false);
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        try {
          JSON.parse(body); // Validate JSON for user feedback
          headers['Content-Type'] = 'application/json';
        } catch (jsonError) {
          setError('Request body contains invalid JSON.');
          setLoading(false);
          return;
        }
      }

      const requestPayload: { [key: string]: any } = {
        method,
        url: endpoint,
        headers,
      };

      // Only include body for relevant methods
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestPayload.body = body || null;
      }

      // Call the 'api-proxy' edge function with the correctly formed payload
      const { data: proxyResponse, error: functionError } = await supabase.functions.invoke('api-proxy', {
        body: requestPayload,
      });

      if (functionError) {
        throw new Error(functionError.message);
      }
      
      if (proxyResponse.error) {
        throw new Error(proxyResponse.error);
      }

      const { status, statusText, headers: responseHeaders, body: responseBodyText } = proxyResponse;
      
      setResponseMeta({ status, statusText, headers: responseHeaders });

      let responseData: any;
      if (responseBodyText) {
        try {
          responseData = JSON.parse(responseBodyText);
        } catch (e) {
          responseData = responseBodyText;
        }
      }

      if (status >= 400) {
        const errorMessage = (typeof responseData === 'object' && responseData !== null && (responseData.error?.message || responseData.message))
          ? (responseData.error?.message || responseData.message)
          : (typeof responseData === 'string' && responseData) ? responseData : `Request failed: ${status} ${statusText}`;
        setError(errorMessage); // Use setError to display API errors, not throw
      }

      if (responseData) {
        setResponse(responseData);
      }

    } catch (err: any) {
      // General error handler for function call issues
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">API Tester</CardTitle>
              <CardDescription>
                Enter an API endpoint, choose a method, and optionally provide an API key and request body. All requests are proxied to avoid CORS issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestApi} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-1/4">
                    <Label htmlFor="method">Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-grow space-y-2">
                    <Label htmlFor="endpoint">API Endpoint</Label>
                    <Input
                      id="endpoint"
                      type="url"
                      placeholder="https://api.example.com/data"
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (Bearer Token)</Label>
                  <Input
                    id="apiKey"
                    type="text"
                    placeholder="Your API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                {['POST', 'PUT', 'PATCH'].includes(method) && (
                  <div className="space-y-2">
                    <Label htmlFor="body">Request Body (JSON)</Label>
                    <Textarea
                      id="body"
                      placeholder='{ "key": "value" }'
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Test API
                </Button>
              </form>
              
              <div className="mt-6 space-y-4">
                {error && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
                    <div className="bg-destructive/10 text-destructive rounded-md p-4 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
                    </div>
                  </div>
                )}
                
                {responseMeta && !error && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${responseMeta.status >= 400 ? 'text-destructive' : 'text-primary'}`}>
                      Response
                    </h3>
                    <div className="space-y-4 rounded-md border p-4">
                      <div>
                        <div className={`font-semibold ${responseMeta.status >= 400 ? 'text-destructive' : 'text-green-600'}`}>
                          Status: {responseMeta.status} {responseMeta.statusText}
                        </div>
                        <h4 className="font-semibold mt-4 mb-2">Headers</h4>
                        <div className="bg-muted rounded-md max-h-48 overflow-auto">
                           <CodeBlock code={Object.entries(responseMeta.headers).map(([key, value]) => `${key}: ${value}`).join('\n')} />
                        </div>
                      </div>
                      
                      {response && (
                        <div>
                          <h4 className="font-semibold mt-4 mb-2">Body</h4>
                          <div className="bg-muted rounded-md max-h-96 overflow-auto">
                             <CodeBlock code={typeof response === 'object' ? JSON.stringify(response, null, 2) : String(response)} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ApiTesterPage;
