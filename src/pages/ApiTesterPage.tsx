
import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CodeBlock from '@/components/CodeBlock';
import { LoaderCircle, AlertCircle } from 'lucide-react';

const ApiTesterPage = () => {
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    if (!endpoint.startsWith('http')) {
      setError('Please enter a valid URL (e.g., https://...)');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data?.error?.message || data?.message || JSON.stringify(data);
        throw new Error(errorMessage);
      }

      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API. Check the endpoint and network connection.');
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
                Enter an API endpoint and key to make a test request. The API key will be sent in the `Authorization: Bearer &lt;key&gt;` header.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestApi} className="space-y-4">
                <div className="space-y-2">
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Test API
                </Button>
              </form>
              
              <div className="mt-6 space-y-4">
                {response && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-600">Success Response</h3>
                    <div className="bg-muted rounded-md p-4 max-h-96 overflow-auto">
                      <CodeBlock language="json" code={JSON.stringify(response, null, 2)} />
                    </div>
                  </div>
                )}

                {error && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
                    <div className="bg-destructive/10 text-destructive rounded-md p-4 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
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
