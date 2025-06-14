
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Brain, Database, Globe, Zap } from 'lucide-react';
import { ContentUnderstandingEngine, WebsiteClassification, DataPattern, ExtractedEntity } from '@/services/ContentUnderstandingEngine';
import { SmartDataExtractor, ExtractionResult } from '@/services/SmartDataExtractor';
import { DynamicEndpointGenerator, GeneratedApiSpec } from '@/services/DynamicEndpointGenerator';

interface IntelligentContentAnalyzerProps {
  url: string;
  html: string;
  onAnalysisComplete: (result: {
    classification: WebsiteClassification;
    extraction: ExtractionResult;
    apiSpec: GeneratedApiSpec;
  }) => void;
}

const IntelligentContentAnalyzer: React.FC<IntelligentContentAnalyzerProps> = ({
  url,
  html,
  onAnalysisComplete
}) => {
  const [analysisStage, setAnalysisStage] = useState<'idle' | 'classification' | 'extraction' | 'generation' | 'complete'>('idle');
  const [classification, setClassification] = useState<WebsiteClassification | null>(null);
  const [dataPatterns, setDataPatterns] = useState<DataPattern[]>([]);
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [apiSpec, setApiSpec] = useState<GeneratedApiSpec | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (html) {
      performIntelligentAnalysis();
    }
  }, [html]);

  const performIntelligentAnalysis = async () => {
    console.log('🚀 Starting intelligent content analysis...');
    
    try {
      // Stage 1: Website Classification
      setAnalysisStage('classification');
      setProgress(20);
      
      const websiteClassification = await ContentUnderstandingEngine.classifyWebsite(html, url);
      setClassification(websiteClassification);
      console.log('✅ Website classified:', websiteClassification);

      // Stage 2: Pattern Detection
      setProgress(40);
      const patterns = ContentUnderstandingEngine.detectDataPatterns(html);
      setDataPatterns(patterns);
      console.log('✅ Data patterns detected:', patterns.length);

      // Stage 3: Entity Extraction
      setProgress(60);
      const extractedEntities = ContentUnderstandingEngine.extractEntities(html);
      setEntities(extractedEntities);
      console.log('✅ Entities extracted:', extractedEntities.length);

      // Stage 4: Smart Data Extraction
      setAnalysisStage('extraction');
      setProgress(75);
      
      const extraction = await SmartDataExtractor.extractData(html, websiteClassification, patterns);
      setExtractionResult(extraction);
      console.log('✅ Data extracted:', extraction.data.length, 'items');

      // Stage 5: API Generation
      setAnalysisStage('generation');
      setProgress(90);
      
      const generatedSpec = await DynamicEndpointGenerator.generateApiSpec(
        `${window.location.origin}/api`,
        'generated-key',
        websiteClassification,
        extraction
      );
      setApiSpec(generatedSpec);
      console.log('✅ API specification generated');

      setAnalysisStage('complete');
      setProgress(100);

      // Notify parent component
      onAnalysisComplete({
        classification: websiteClassification,
        extraction,
        apiSpec: generatedSpec
      });

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setAnalysisStage('idle');
    }
  };

  if (!html) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No content to analyze</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Intelligent Content Analysis
          </CardTitle>
          <CardDescription>
            AI-powered analysis of website structure and content patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Analysis Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          
          <div className="flex items-center gap-2">
            {analysisStage === 'classification' && <Zap className="h-4 w-4 animate-pulse text-blue-500" />}
            {analysisStage !== 'classification' && classification && <CheckCircle className="h-4 w-4 text-green-500" />}
            <span className={`text-sm ${analysisStage === 'classification' ? 'text-blue-600' : classification ? 'text-green-600' : 'text-muted-foreground'}`}>
              Website Classification
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {analysisStage === 'extraction' && <Database className="h-4 w-4 animate-pulse text-blue-500" />}
            {analysisStage !== 'extraction' && extractionResult && <CheckCircle className="h-4 w-4 text-green-500" />}
            <span className={`text-sm ${analysisStage === 'extraction' ? 'text-blue-600' : extractionResult ? 'text-green-600' : 'text-muted-foreground'}`}>
              Smart Data Extraction
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {analysisStage === 'generation' && <Globe className="h-4 w-4 animate-pulse text-blue-500" />}
            {analysisStage !== 'generation' && apiSpec && <CheckCircle className="h-4 w-4 text-green-500" />}
            <span className={`text-sm ${analysisStage === 'generation' ? 'text-blue-600' : apiSpec ? 'text-green-600' : 'text-muted-foreground'}`}>
              API Endpoint Generation
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {analysisStage === 'complete' && (
        <Tabs defaultValue="classification" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="patterns">Data Patterns</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classification" className="space-y-4">
            {classification && (
              <Card>
                <CardHeader>
                  <CardTitle>Website Classification</CardTitle>
                  <CardDescription>AI-detected website type and characteristics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="default" className="text-lg py-2 px-4">
                      {classification.primaryType.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Badge variant="outline">
                        {(classification.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  {classification.subCategories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Sub-categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {classification.subCategories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Detection Indicators</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {classification.indicators.map((indicator, index) => (
                        <li key={index}>• {indicator}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Patterns</CardTitle>
                <CardDescription>Detected repeating content structures</CardDescription>
              </CardHeader>
              <CardContent>
                {dataPatterns.length > 0 ? (
                  <div className="space-y-4">
                    {dataPatterns.map((pattern, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{pattern.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {pattern.itemCount} items
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Selector: <code className="bg-muted px-1 rounded">{pattern.selector}</code>
                        </p>
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Consistency: </span>
                          <Progress value={pattern.consistency * 100} className="w-24 inline-block" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No structured patterns detected</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Entities</CardTitle>
                <CardDescription>AI-identified data entities and their types</CardDescription>
              </CardHeader>
              <CardContent>
                {entities.length > 0 ? (
                  <div className="space-y-3">
                    {entities.slice(0, 10).map((entity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{entity.type}</Badge>
                          <span className="text-sm">{entity.value}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(entity.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    ))}
                    {entities.length > 10 && (
                      <p className="text-sm text-muted-foreground">
                        ...and {entities.length - 10} more entities
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No entities detected</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            {apiSpec && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated API Endpoints</CardTitle>
                  <CardDescription>Automatically created API endpoints based on content analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiSpec.endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default">{endpoint.method}</Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {endpoint.description}
                        </p>
                        {endpoint.parameters.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Parameters:</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {endpoint.parameters.slice(0, 4).map((param, paramIndex) => (
                                <div key={paramIndex} className="text-xs">
                                  <code>{param.name}</code>
                                  <span className="text-muted-foreground ml-1">
                                    ({param.type})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default IntelligentContentAnalyzer;
