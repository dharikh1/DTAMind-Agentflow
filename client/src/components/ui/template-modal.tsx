import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: any[];
  edges: any[];
}

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (template: Template) => void;
}

export function TemplateModal({ open, onOpenChange, onTemplateSelect }: TemplateModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/templates'],
    enabled: open,
  });

  const filteredTemplates = (templates as Template[]).filter((template: Template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
    onOpenChange(false);
  };

  const getNodeTypeColor = (nodeType: string) => {
    if (nodeType.includes('webhook') || nodeType.includes('manual') || nodeType.includes('schedule')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (nodeType.includes('openai') || nodeType.includes('ai') || nodeType.includes('gpt')) {
      return 'bg-amber-100 text-amber-800';
    }
    if (nodeType.includes('code') || nodeType.includes('condition') || nodeType.includes('merge')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    return 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" data-testid="template-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Workflow Templates
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Choose from pre-built templates to get started quickly
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="template-search"
          />
          
          <div className="overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading templates...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template: Template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => handleTemplateSelect(template)}
                    data-testid={`template-${template.id}`}
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.nodes?.slice(0, 4).map((node: any, index: number) => {
                          const nodeType = node.data?.name || node.type || `Node ${index + 1}`;
                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={`text-xs ${getNodeTypeColor(nodeType)}`}
                            >
                              {nodeType}
                            </Badge>
                          );
                        })}
                        {template.nodes && template.nodes.length > 4 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{template.nodes.length - 4} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{template.nodes?.length || 0} nodes</span>
                          <span>•</span>
                          <span>{template.edges?.length || 0} connections</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary/80"
                          data-testid={`use-template-${template.id}`}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No templates found matching your search.' : 'No templates available.'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
