
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowUpDown, RefreshCw } from 'lucide-react';

interface QueryParams {
  search?: string;
  page: number;
  limit: number;
  sort?: string;
  order: 'asc' | 'desc';
  filters: { [key: string]: string };
}

interface ApiQueryInterfaceProps {
  endpoint: string;
  apiKey: string;
  onQuery: (params: QueryParams) => void;
  isLoading?: boolean;
  availableFields?: string[];
}

const ApiQueryInterface: React.FC<ApiQueryInterfaceProps> = ({
  endpoint,
  apiKey,
  onQuery,
  isLoading = false,
  availableFields = ['title', 'price', 'category', 'rating']
}) => {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 20,
    order: 'asc',
    filters: {}
  });

  const [newFilterField, setNewFilterField] = useState('');
  const [newFilterValue, setNewFilterValue] = useState('');

  const handleSearch = () => {
    onQuery(queryParams);
  };

  const addFilter = () => {
    if (newFilterField && newFilterValue) {
      setQueryParams(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          [newFilterField]: newFilterValue
        }
      }));
      setNewFilterField('');
      setNewFilterValue('');
    }
  };

  const removeFilter = (field: string) => {
    setQueryParams(prev => ({
      ...prev,
      filters: Object.fromEntries(
        Object.entries(prev.filters).filter(([key]) => key !== field)
      )
    }));
  };

  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.sort) {
      params.append('sort', queryParams.sort);
      params.append('order', queryParams.order);
    }
    params.append('page', queryParams.page.toString());
    params.append('limit', queryParams.limit.toString());
    
    Object.entries(queryParams.filters).forEach(([key, value]) => {
      params.append(key, value);
    });

    return `${endpoint}?${params.toString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          API Query Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Search across all content..."
              value={queryParams.search || ''}
              onChange={(e) => setQueryParams(prev => ({ ...prev, search: e.target.value }))}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label>Filters</Label>
          </div>
          
          {/* Active Filters */}
          {Object.keys(queryParams.filters).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(queryParams.filters).map(([field, value]) => (
                <Badge key={field} variant="secondary" className="flex items-center gap-1">
                  {field}: {value}
                  <button
                    onClick={() => removeFilter(field)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add New Filter */}
          <div className="flex gap-2">
            <Select value={newFilterField} onValueChange={setNewFilterField}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Value"
              value={newFilterValue}
              onChange={(e) => setNewFilterValue(e.target.value)}
            />
            <Button onClick={addFilter} variant="outline" disabled={!newFilterField || !newFilterValue}>
              Add Filter
            </Button>
          </div>
        </div>

        {/* Sorting */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <Label>Sorting</Label>
          </div>
          <div className="flex gap-2">
            <Select 
              value={queryParams.sort || ''} 
              onValueChange={(value) => setQueryParams(prev => ({ ...prev, sort: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No sorting</SelectItem>
                {availableFields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={queryParams.order} 
              onValueChange={(value: 'asc' | 'desc') => setQueryParams(prev => ({ ...prev, order: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination */}
        <div className="space-y-2">
          <Label>Pagination</Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="page" className="text-sm">Page:</Label>
              <Input
                id="page"
                type="number"
                min="1"
                value={queryParams.page}
                onChange={(e) => setQueryParams(prev => ({ ...prev, page: parseInt(e.target.value) || 1 }))}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="limit" className="text-sm">Limit:</Label>
              <Select 
                value={queryParams.limit.toString()} 
                onValueChange={(value) => setQueryParams(prev => ({ ...prev, limit: parseInt(value) }))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Generated URL Preview */}
        <div className="space-y-2">
          <Label>Generated Query URL</Label>
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-sm break-all">{buildQueryUrl()}</code>
          </div>
        </div>

        <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Executing Query...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Execute Query
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApiQueryInterface;
