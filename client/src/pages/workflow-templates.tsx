import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Play, 
  Download, 
  Star, 
  Users, 
  Clock,
  Zap,
  Bot,
  MessageSquare,
  FileText,
  Database,
  Globe,
  Code,
  Sparkles
} from 'lucide-react';
import { useLocation } from 'wouter';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  author: string;
  rating: number;
  downloads: number;
  lastUpdated: string;
  thumbnail?: string;
  nodes: number;
  estimatedTime: string;
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'AI agent that handles customer inquiries with sentiment analysis and escalation',
    category: 'Customer Service',
    difficulty: 'intermediate',
    tags: ['customer-support', 'sentiment-analysis', 'escalation', 'automation'],
    author: 'AgentFlow Team',
    rating: 4.8,
    downloads: 1250,
    lastUpdated: '2024-01-15',
    nodes: 8,
    estimatedTime: '15-20 min'
  },
  {
    id: 'content-generator',
    name: 'Content Generation Workflow',
    description: 'Generate blog posts, social media content, and marketing materials',
    category: 'Content Creation',
    difficulty: 'beginner',
    tags: ['content-generation', 'blog-writing', 'social-media', 'marketing'],
    author: 'AgentFlow Team',
    rating: 4.6,
    downloads: 890,
    lastUpdated: '2024-01-10',
    nodes: 5,
    estimatedTime: '10-15 min'
  },
  {
    id: 'document-qa',
    name: 'Document Q&A System',
    description: 'RAG-based system for answering questions from uploaded documents',
    category: 'Document Processing',
    difficulty: 'advanced',
    tags: ['rag', 'document-processing', 'qa-system', 'vector-store'],
    author: 'AgentFlow Team',
    rating: 4.9,
    downloads: 2100,
    lastUpdated: '2024-01-20',
    nodes: 12,
    estimatedTime: '25-30 min'
  },
  {
    id: 'web-research',
    name: 'Web Research Agent',
    description: 'Automated web research and information gathering agent',
    category: 'Research',
    difficulty: 'intermediate',
    tags: ['web-research', 'automation', 'information-gathering', 'data-collection'],
    author: 'AgentFlow Team',
    rating: 4.7,
    downloads: 1560,
    lastUpdated: '2024-01-18',
    nodes: 10,
    estimatedTime: '20-25 min'
  },
  {
    id: 'ai-code-assistant',
    name: 'AI Code Assistant',
    description: 'Code review, generation, and optimization using multiple AI models',
    category: 'Development',
    difficulty: 'advanced',
    tags: ['code-generation', 'code-review', 'optimization', 'ai-models'],
    author: 'AgentFlow Team',
    rating: 4.9,
    downloads: 3200,
    lastUpdated: '2024-01-22',
    nodes: 15,
    estimatedTime: '30-35 min'
  },
  {
    id: 'conversational-ai',
    name: 'Conversational AI Chatbot',
    description: 'Memory-enabled chatbot with conversation history and context',
    category: 'Chatbots',
    difficulty: 'beginner',
    tags: ['chatbot', 'conversation', 'memory', 'context'],
    author: 'AgentFlow Team',
    rating: 4.5,
    downloads: 2100,
    lastUpdated: '2024-01-12',
    nodes: 6,
    estimatedTime: '12-15 min'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Pipeline',
    description: 'Automated data processing, analysis, and visualization workflow',
    category: 'Data Science',
    difficulty: 'advanced',
    tags: ['data-analysis', 'processing', 'visualization', 'pipeline'],
    author: 'AgentFlow Team',
    rating: 4.8,
    downloads: 980,
    lastUpdated: '2024-01-16',
    nodes: 18,
    estimatedTime: '35-40 min'
  },
  {
    id: 'email-automation',
    name: 'Email Automation System',
    description: 'Automated email processing, classification, and response system',
    category: 'Communication',
    difficulty: 'intermediate',
    tags: ['email', 'automation', 'classification', 'response'],
    author: 'AgentFlow Team',
    rating: 4.6,
    downloads: 1340,
    lastUpdated: '2024-01-14',
    nodes: 9,
    estimatedTime: '18-22 min'
  }
];

const CATEGORIES = [
  'All',
  'Customer Service',
  'Content Creation',
  'Document Processing',
  'Research',
  'Development',
  'Chatbots',
  'Data Science',
  'Communication'
];

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [, navigate] = useLocation();

  // Filter and sort templates
  useEffect(() => {
    let filtered = TEMPLATES.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setTemplates(filtered);
  }, [searchTerm, selectedCategory, sortBy]);

  const handleUseTemplate = (template: WorkflowTemplate) => {
    navigate(`/workflow-builder?template=${template.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Customer Service': return <Users className="h-4 w-4" />;
      case 'Content Creation': return <FileText className="h-4 w-4" />;
      case 'Document Processing': return <Database className="h-4 w-4" />;
      case 'Research': return <Globe className="h-4 w-4" />;
      case 'Development': return <Code className="h-4 w-4" />;
      case 'Chatbots': return <MessageSquare className="h-4 w-4" />;
      case 'Data Science': return <Database className="h-4 w-4" />;
      case 'Communication': return <MessageSquare className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Workflow Templates</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover and use professional workflow templates to jumpstart your automation projects. 
          From simple chatbots to complex AI pipelines, we have templates for every use case.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
            <TabsList>
              {CATEGORIES.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {templates.length} of {TEMPLATES.length} templates
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Updated</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Templates Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {template.downloads.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    {template.nodes} nodes
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    by {template.author} • {new Date(template.lastUpdated).toLocaleDateString()}
                  </div>
                  <Button onClick={() => handleUseTemplate(template)} size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(template.category)}
                      <h3 className="text-xl font-semibold">{template.name}</h3>
                      <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{template.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{template.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Downloads: {template.downloads.toLocaleString()}</span>
                      <span>Nodes: {template.nodes}</span>
                      <span>Time: {template.estimatedTime}</span>
                      <span>Updated: {new Date(template.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-6">
                    <Button onClick={() => handleUseTemplate(template)}>
                      <Play className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or category filters
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
          <Sparkles className="h-4 w-4" />
          <span>More templates coming soon!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Can't find what you're looking for? Create your own workflow from scratch or request a custom template.
        </p>
      </div>
    </div>
  );
}
