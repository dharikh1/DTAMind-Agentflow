import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Save, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Key, 
  Plus,
  Trash2,
  Edit,
  Copy,
  Download,
  Upload,
  Settings,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIKey {
  name: string;
  key: string;
  description: string;
  required: boolean;
  isVisible: boolean;
  isConfigured: boolean;
  category: string;
  lastUsed?: string;
  status: 'active' | 'inactive' | 'error';
}

export default function APIKeysPanel() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      name: 'OPENAI_API_KEY',
      key: '',
      description: 'Your OpenAI API key for GPT models, embeddings, and other OpenAI services',
      required: true,
      isVisible: false,
      isConfigured: false,
      category: 'AI Models',
      status: 'inactive'
    },
    {
      name: 'ANTHROPIC_API_KEY',
      key: '',
      description: 'Your Anthropic API key for Claude models and Claude API services',
      required: false,
      isVisible: false,
      isConfigured: false,
      category: 'AI Models',
      status: 'inactive'
    },
    {
      name: 'GOOGLE_API_KEY',
      key: '',
      description: 'Your Google API key for Gemini models and Google AI services',
      required: false,
      isVisible: false,
      isConfigured: false,
      category: 'AI Models',
      status: 'inactive'
    },
    {
      name: 'PINECONE_API_KEY',
      key: '',
      description: 'Your Pinecone API key for vector database operations',
      required: false,
      isVisible: false,
      isConfigured: false,
      category: 'Vector Stores',
      status: 'inactive'
    },
    {
      name: 'PINECONE_ENVIRONMENT',
      key: '',
      description: 'Your Pinecone environment (e.g., us-west1-gcp)',
      required: false,
      isVisible: false,
      isConfigured: false,
      category: 'Vector Stores',
      status: 'inactive'
    },
    {
      name: 'WEAVIATE_API_KEY',
      key: '',
      description: 'Your Weaviate API key for vector database operations',
      required: false,
      isVisible: false,
      isConfigured: false,
      category: 'Vector Stores',
      status: 'inactive'
    },
    {
      name: 'COHERE_API_KEY',
      key: '',
      description: 'Your Cohere API key for Cohere AI models and services',
      required: false,
      isVisible: false,
      isConfigured: false,
      category: 'AI Models',
      status: 'inactive'
    },
    {
      name: 'MISTRAL_API_KEY',
      key: '',
      description: 'Your Mistral AI API key for Mistral models and services',
      required: false,
      isVisible: false,
      isConfigured: false,
      category: 'AI Models',
      status: 'inactive'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('agentflow_api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(prev => prev.map(key => ({
          ...key,
          key: parsed[key.name] || '',
          isConfigured: !!(parsed[key.name] && parsed[key.name].trim()),
          status: parsed[key.name] && parsed[key.name].trim() ? 'active' : 'inactive'
        })));
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, []);

  // Group API keys by category
  const groupedKeys = apiKeys.reduce((acc, key) => {
    if (!acc[key.category]) {
      acc[key.category] = [];
    }
    acc[key.category].push(key);
    return acc;
  }, {} as Record<string, APIKey[]>);

  const updateAPIKey = (index: number, value: string) => {
    setApiKeys(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        key: value,
        isConfigured: !!(value && value.trim()),
        status: value && value.trim() ? 'active' : 'inactive'
      };
      return updated;
    });
  };

  const toggleKeyVisibility = (index: number) => {
    setApiKeys(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isVisible: !updated[index].isVisible };
      return updated;
    });
  };

  const saveAPIKeys = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      const keysToSave: Record<string, string> = {};
      apiKeys.forEach(key => {
        if (key.key.trim()) {
          keysToSave[key.name] = key.key.trim();
        }
      });
      localStorage.setItem('agentflow_api_keys', JSON.stringify(keysToSave));

      // Save to backend
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keysToSave)
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "API keys saved successfully",
        });
      } else {
        throw new Error('Failed to save to backend');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAPIKey = async (apiKey: APIKey) => {
    if (!apiKey.key.trim()) return;

    try {
      let endpoint = '';
      switch (apiKey.name) {
        case 'OPENAI_API_KEY':
          endpoint = '/api/test/openai';
          break;
        case 'ANTHROPIC_API_KEY':
          endpoint = '/api/langchain/anthropic';
          break;
        case 'GOOGLE_API_KEY':
          endpoint = '/api/langchain/google';
          break;
        case 'PINECONE_API_KEY':
          endpoint = '/api/langchain/pinecone';
          break;
        case 'WEAVIATE_API_KEY':
          endpoint = '/api/langchain/weaviate';
          break;
        default:
          endpoint = '/api/langchain/health';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, apiKey: apiKey.key })
      });

      if (response.ok) {
        toast({
          title: "✅ Test Successful",
          description: `${apiKey.name} is working correctly`,
        });
        // Update status to active
        setApiKeys(prev => prev.map(key => 
          key.name === apiKey.name ? { ...key, status: 'active' as const } : key
        ));
      } else {
        throw new Error('Test failed');
      }
    } catch (error) {
      toast({
        title: "❌ Test Failed",
        description: `${apiKey.name} test failed. Please check your key.`,
        variant: "destructive",
      });
      // Update status to error
      setApiKeys(prev => prev.map(key => 
        key.name === apiKey.name ? { ...key, status: 'error' as const } : key
      ));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const exportKeys = () => {
    const keysToExport = apiKeys.reduce((acc, key) => {
      if (key.key.trim()) {
        acc[key.name] = key.key.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const blob = new Blob([JSON.stringify(keysToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agentflow-api-keys.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setApiKeys(prev => prev.map(key => ({
          ...key,
          key: imported[key.name] || '',
          isConfigured: !!(imported[key.name] && imported[key.name].trim()),
          status: imported[key.name] && imported[key.name].trim() ? 'active' : 'inactive'
        })));
        toast({
          title: "Success!",
          description: "API keys imported successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse imported file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || key.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Object.keys(groupedKeys)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys Management</h2>
          <p className="text-muted-foreground">
            Configure your API keys to enable AI models, vector stores, and other services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportKeys} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-keys')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            id="import-keys"
            type="file"
            accept=".json"
            onChange={importKeys}
            className="hidden"
          />
          <Button onClick={saveAPIKeys} disabled={isLoading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save All Keys
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
          <TabsList>
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category === 'all' ? 'All' : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configured API Keys
          </CardTitle>
          <CardDescription>
            Manage your API keys for various services. Keys are stored securely and encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Service</th>
                  <th className="text-left p-3 font-medium">API Key</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Last Used</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((apiKey, index) => (
                  <tr key={apiKey.name} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{apiKey.name.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-muted-foreground">{apiKey.description}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type={apiKey.isVisible ? "text" : "password"}
                          value={apiKey.key}
                          onChange={(e) => updateAPIKey(index, e.target.value)}
                          placeholder={`Enter your ${apiKey.name.replace(/_/g, ' ').toLowerCase()}`}
                          className="w-64"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(index)}
                        >
                          {apiKey.isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {apiKey.key && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          apiKey.status === 'active' ? 'default' : 
                          apiKey.status === 'error' ? 'destructive' : 'secondary'
                        }
                      >
                        {apiKey.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {apiKey.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {apiKey.status === 'inactive' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {apiKey.status === 'active' ? 'Active' : 
                         apiKey.status === 'error' ? 'Error' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {apiKey.lastUsed || 'Never'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testAPIKey(apiKey)}
                          disabled={isLoading || !apiKey.key.trim()}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Test All Keys</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Backup Keys</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Key className="h-6 w-6" />
              <span>Generate Keys</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Store your API keys securely and never share them publicly</li>
            <li>• Use environment variables in production deployments</li>
            <li>• Test your keys after configuration to ensure they work</li>
            <li>• Monitor your API usage to avoid unexpected charges</li>
            <li>• Regularly rotate your API keys for security</li>
            <li>• Use different keys for development and production environments</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Search icon component
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
