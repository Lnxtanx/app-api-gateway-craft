
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import CodeBlock from './CodeBlock';

interface QualityMetrics {
  overall: number;
  completeness: number;
  validity: number;
  consistency?: number;
  uniqueness?: number;
}

interface QualityIssue {
  type: string;
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: boolean;
}

interface ApiResponseData {
  data: any[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    executionTime: number;
    cacheHit: boolean;
  };
  quality: {
    score: number;
    metrics: QualityMetrics;
    issues: QualityIssue[];
    autoFixApplied: boolean;
  };
  api: {
    id: string;
    source_url: string;
    created_at: string;
    version: string;
  };
}

interface ApiResponseDisplayProps {
  data: ApiResponseData;
  endpoint: string;
  apiKey: string;
}

const ApiResponseDisplay: React.FC<ApiResponseDisplayProps> = ({ data, endpoint, apiKey }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={endpoint} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={apiKey} />
        </CardContent>
      </Card>

      {/* Enhanced Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Response Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.metadata.total}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.metadata.executionTime}ms</div>
              <div className="text-sm text-muted-foreground">Execution Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                {data.metadata.cacheHit ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-500" />
                )}
                <span className="text-sm font-medium">
                  {data.metadata.cacheHit ? 'Cache Hit' : 'Fresh Data'}
                </span>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="outline">
                v{data.api.version}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Data Quality Assessment
            <Badge variant={data.quality.score >= 0.8 ? 'default' : data.quality.score >= 0.6 ? 'secondary' : 'destructive'}>
              {(data.quality.score * 100).toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Quality</span>
                <span>{(data.quality.metrics.overall * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.quality.metrics.overall * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completeness</span>
                <span>{(data.quality.metrics.completeness * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.quality.metrics.completeness * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Validity</span>
                <span>{(data.quality.metrics.validity * 100).toFixed(1)}%</span>
              </div>
              <Progress value={data.quality.metrics.validity * 100} className="h-2" />
            </div>
          </div>

          {data.quality.autoFixApplied && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Auto-fix has been applied to improve data quality.
              </AlertDescription>
            </Alert>
          )}

          {data.quality.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quality Issues ({data.quality.issues.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {data.quality.issues.slice(0, 5).map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(issue.severity) as any} className="text-xs">
                          {issue.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{issue.field}</span>
                      </div>
                      <p className="text-sm">{issue.message}</p>
                      {issue.autoFixable && (
                        <p className="text-xs text-green-600">✓ Auto-fixable</p>
                      )}
                    </div>
                  </div>
                ))}
                {data.quality.issues.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ...and {data.quality.issues.length - 5} more issues
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* cURL Example */}
      <Card>
        <CardHeader>
          <CardTitle>cURL Example with Query Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={`curl "${endpoint}?search=product&page=1&limit=10&sort=price&order=asc" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json"`} />
        </CardContent>
      </Card>

      {/* Sample Response */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Response Data</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={JSON.stringify(data, null, 2)} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiResponseDisplay;
