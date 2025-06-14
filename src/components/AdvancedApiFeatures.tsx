
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock from "./CodeBlock";

interface AdvancedApiFeaturesProps {
  apiData: {
    _semantic_api?: {
      endpoint: string;
      entity_name: string;
      parameters: any[];
      sort_options: string[];
    };
    _graphql_schema?: string;
    _advanced_features?: {
      spa_detected: boolean;
      forms_analyzed: number;
      websocket_connections: string[];
      infinite_scroll_applied: boolean;
      session_management: boolean;
    };
    data?: {
      page_type: string;
      confidence_score: number;
      detected_entities: string[];
      item_count: number;
    };
  };
}

const AdvancedApiFeatures = ({ apiData }: AdvancedApiFeaturesProps) => {
  const { _semantic_api, _graphql_schema, _advanced_features, data } = apiData;

  if (!_semantic_api && !_graphql_schema && !_advanced_features) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Level 2: Advanced API Features
            <Badge variant="secondary">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="semantic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="semantic">Semantic API</TabsTrigger>
              <TabsTrigger value="graphql">GraphQL Schema</TabsTrigger>
              <TabsTrigger value="automation">Browser Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="semantic" className="space-y-4">
              {_semantic_api && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-2">Page Classification</h4>
                      <Badge variant="outline" className="mb-2">
                        {data?.page_type || 'Unknown'} 
                        {data?.confidence_score && ` (${Math.round(data.confidence_score * 100)}% confident)`}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Items found: {data?.item_count || 0}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Detected Entities</h4>
                      <div className="flex flex-wrap gap-1">
                        {data?.detected_entities?.map((entity, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Smart Endpoint</h4>
                    <CodeBlock code={_semantic_api.endpoint} />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Auto-Generated Parameters</h4>
                    <div className="space-y-2">
                      {_semantic_api.parameters.map((param, idx) => (
                        <div key={idx} className="border rounded p-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{param.type}</Badge>
                            <code className="text-sm">{param.name}</code>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {param.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Smart Sorting Options</h4>
                    <div className="flex flex-wrap gap-2">
                      {_semantic_api.sort_options.map((option, idx) => (
                        <Badge key={idx} variant="secondary">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="graphql" className="space-y-4">
              {_graphql_schema && (
                <div>
                  <h4 className="font-semibold mb-2">Auto-Generated GraphQL Schema</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automatically generated based on detected data patterns and relationships.
                  </p>
                  <CodeBlock code={_graphql_schema} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              {_advanced_features && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">SPA Detection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={_advanced_features.spa_detected ? "default" : "secondary"}>
                        {_advanced_features.spa_detected ? "SPA Detected" : "Static Site"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Single-page application support
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Infinite Scroll</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={_advanced_features.infinite_scroll_applied ? "default" : "secondary"}>
                        {_advanced_features.infinite_scroll_applied ? "Applied" : "N/A"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically loaded all content
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Form Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">
                        {_advanced_features.forms_analyzed} forms found
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Interactive elements detected
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">WebSocket Monitoring</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">
                        {_advanced_features.websocket_connections?.length || 0} connections
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Real-time data streams
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {_advanced_features?.websocket_connections && _advanced_features.websocket_connections.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">WebSocket Connections Found</h4>
                  <div className="space-y-2">
                    {_advanced_features.websocket_connections.map((url, idx) => (
                      <CodeBlock key={idx} code={url} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedApiFeatures;
