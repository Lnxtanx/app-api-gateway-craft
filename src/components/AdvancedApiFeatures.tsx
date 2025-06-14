
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
    _level_3_enhancements?: {
      real_time_sync?: {
        content_hash: string;
        change_detected: boolean;
        change_type: string;
        sync_status?: string;
      };
      ai_data_enhancement?: {
        items_enhanced: number;
        sentiment_analyzed: number;
        content_summarized: number;
        price_analyzed: number;
      };
      deduplication?: {
        original: number;
        unique: number;
        duplicatesRemoved: number;
      };
      predictive_caching?: {
        cache_expiry: number;
        priority_score: number;
        refresh_interval: number;
      };
    };
    data?: {
      page_type: string;
      confidence_score: number;
      detected_entities: string[];
      item_count: number;
      items?: any[];
    };
  };
}

const AdvancedApiFeatures = ({ apiData }: AdvancedApiFeaturesProps) => {
  const { _semantic_api, _graphql_schema, _advanced_features, _level_3_enhancements, data } = apiData;

  if (!_semantic_api && !_graphql_schema && !_advanced_features && !_level_3_enhancements) {
    return null;
  }

  const hasLevel3Features = !!_level_3_enhancements;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasLevel3Features ? (
              <>
                🚀 Level 3: AI-Enhanced Real-Time API
                <Badge variant="default">AI-Powered + Real-Time</Badge>
              </>
            ) : (
              <>
                🚀 Level 2: Advanced API Features
                <Badge variant="secondary">AI-Powered</Badge>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={hasLevel3Features ? "realtime" : "semantic"} className="w-full">
            <TabsList className={`grid w-full ${hasLevel3Features ? 'grid-cols-5' : 'grid-cols-3'}`}>
              {hasLevel3Features && <TabsTrigger value="realtime">Real-Time Sync</TabsTrigger>}
              {hasLevel3Features && <TabsTrigger value="ai-enhancement">AI Enhancement</TabsTrigger>}
              <TabsTrigger value="semantic">Semantic API</TabsTrigger>
              <TabsTrigger value="graphql">GraphQL Schema</TabsTrigger>
              <TabsTrigger value="automation">Browser Automation</TabsTrigger>
            </TabsList>

            {hasLevel3Features && (
              <TabsContent value="realtime" className="space-y-4">
                {_level_3_enhancements?.real_time_sync && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Change Detection</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant={_level_3_enhancements.real_time_sync.change_detected ? "default" : "secondary"}>
                            {_level_3_enhancements.real_time_sync.change_type}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Content monitoring active
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Sync Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="default">
                            {_level_3_enhancements.real_time_sync.sync_status || 'Active'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Real-time updates enabled
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Content Hash</h4>
                      <CodeBlock code={_level_3_enhancements.real_time_sync.content_hash} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used for detecting content changes and differential updates
                      </p>
                    </div>

                    {_level_3_enhancements.predictive_caching && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Cache Strategy</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg font-bold">{_level_3_enhancements.predictive_caching.cache_expiry}s</div>
                            <p className="text-xs text-muted-foreground">Cache expiry</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Priority Score</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg font-bold">{_level_3_enhancements.predictive_caching.priority_score}/100</div>
                            <p className="text-xs text-muted-foreground">Usage priority</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Refresh Interval</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-lg font-bold">{_level_3_enhancements.predictive_caching.refresh_interval}s</div>
                            <p className="text-xs text-muted-foreground">Auto-refresh</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            )}

            {hasLevel3Features && (
              <TabsContent value="ai-enhancement" className="space-y-4">
                {_level_3_enhancements?.ai_data_enhancement && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold mb-2">AI Enhancement Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Items Enhanced:</span>
                            <Badge variant="outline">{_level_3_enhancements.ai_data_enhancement.items_enhanced}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Sentiment Analyzed:</span>
                            <Badge variant="outline">{_level_3_enhancements.ai_data_enhancement.sentiment_analyzed}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Content Summarized:</span>
                            <Badge variant="outline">{_level_3_enhancements.ai_data_enhancement.content_summarized}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Price Analyzed:</span>
                            <Badge variant="outline">{_level_3_enhancements.ai_data_enhancement.price_analyzed}</Badge>
                          </div>
                        </div>
                      </div>

                      {_level_3_enhancements.deduplication && (
                        <div>
                          <h4 className="font-semibold mb-2">Deduplication Results</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Original Items:</span>
                              <Badge variant="secondary">{_level_3_enhancements.deduplication.original}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Unique Items:</span>
                              <Badge variant="default">{_level_3_enhancements.deduplication.unique}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Duplicates Removed:</span>
                              <Badge variant="destructive">{_level_3_enhancements.deduplication.duplicatesRemoved}</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {data?.items && data.items.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Enhanced Data Sample</h4>
                        <div className="grid gap-4">
                          {data.items.slice(0, 2).map((item, idx) => (
                            <Card key={idx}>
                              <CardContent className="pt-4">
                                <div className="space-y-2">
                                  <h5 className="font-medium">{item.title || 'Untitled Item'}</h5>
                                  
                                  {item._sentiment_analysis && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant={
                                        item._sentiment_analysis.sentiment === 'positive' ? 'default' :
                                        item._sentiment_analysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                                      }>
                                        {item._sentiment_analysis.sentiment} ({Math.round(item._sentiment_analysis.confidence * 100)}%)
                                      </Badge>
                                      {item._sentiment_analysis.keywords.length > 0 && (
                                        <div className="flex gap-1">
                                          {item._sentiment_analysis.keywords.slice(0, 3).map((keyword, kidx) => (
                                            <Badge key={kidx} variant="outline" className="text-xs">{keyword}</Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {item._price_analysis && (
                                    <div className="text-sm text-muted-foreground">
                                      <div>Normalized Price: {item._price_analysis.normalizedPrice} {item._price_analysis.currency}</div>
                                      {item._price_analysis.marketComparison && (
                                        <div className="mt-1 italic">"{item._price_analysis.marketComparison}"</div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {item._content_summary && (
                                    <div className="text-sm">
                                      <div className="font-medium">Summary:</div>
                                      <div className="text-muted-foreground">{item._content_summary.summary}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {item._content_summary.readingTime} min read
                                        </Badge>
                                        {item._content_summary.keyPoints.length > 0 && (
                                          <Badge variant="outline" className="text-xs">
                                            {item._content_summary.keyPoints.length} key points
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            )}

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
