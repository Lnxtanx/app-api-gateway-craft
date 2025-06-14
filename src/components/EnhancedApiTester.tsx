
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Code, Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  status: number;
  data: any;
  responseTime: number;
  headers: any;
}

export default function EnhancedApiTester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testApi = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to test",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      let requestHeaders = {};
      try {
        requestHeaders = headers ? JSON.parse(headers) : {};
      } catch (e) {
        toast({
          title: "Invalid Headers",
          description: "Headers must be valid JSON",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: {
          url: url.trim(),
          method: method,
          headers: requestHeaders,
          ...(method !== 'GET' && body && { body: body })
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) throw error;

      setResult({
        status: data?.status || 200,
        data: data,
        responseTime: responseTime,
        headers: data?.headers || {}
      });

      toast({
        title: "API Test Successful",
        description: `Response received in ${responseTime}ms`,
      });

    } catch (error) {
      console.error('API test failed:', error);
      setResult({
        status: 500,
        data: { error: error.message },
        responseTime: Date.now() - startTime,
        headers: {}
      });

      toast({
        title: "API Test Failed",
        description: error.message || "Failed to test the API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportResult = () => {
    if (!result) return;
    
    const exportData = {
      request: { url, method, headers, body },
      response: result,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url_export = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url_export;
    a.download = `api-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url_export);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-yellow-500';
    if (status >= 400 && status < 500) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Enhanced API Tester
          </CardTitle>
          <CardDescription>
            Test APIs with advanced features including headers, different methods, and detailed response analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter API URL (e.g., https://api.example.com/data)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testApi} disabled={loading}>
              {loading ? 'Testing...' : 'Test API'}
            </Button>
          </div>

          <Tabs defaultValue="headers" className="w-full">
            <TabsList>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>
            
            <TabsContent value="headers" className="space-y-2">
              <label className="text-sm font-medium">Request Headers (JSON)</label>
              <Textarea
                placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
              />
            </TabsContent>
            
            <TabsContent value="body" className="space-y-2">
              <label className="text-sm font-medium">Request Body</label>
              <Textarea
                placeholder="Request body (for POST, PUT, PATCH requests)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                disabled={method === 'GET'}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Response
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
                <Badge variant="outline">
                  {result.responseTime}ms
                </Badge>
                <Button variant="outline" size="sm" onClick={exportResult}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="response" className="w-full">
              <TabsList>
                <TabsTrigger value="response">Response Data</TabsTrigger>
                <TabsTrigger value="response-headers">Headers</TabsTrigger>
                <TabsTrigger value="raw">Raw</TabsTrigger>
              </TabsList>
              
              <TabsContent value="response">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="response-headers">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(result.headers, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="raw">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
