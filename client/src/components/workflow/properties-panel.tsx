import React from 'react';
import { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { NODE_TYPES } from '@/lib/node-types';
import { LLM_PROVIDERS, getProviderModels, getProviderName, supportsSystemPrompt } from '@/lib/llm-providers';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, updates: any) => void;
  onNodeDelete: (nodeId: string) => void;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
}

export function PropertiesPanel({ 
  selectedNode, 
  onNodeUpdate, 
  onNodeDelete,
  workflowName,
  onWorkflowNameChange
}: PropertiesPanelProps) {
  const updateNodeData = (key: string, value: any) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, { [key]: value });
    }
  };

  if (!selectedNode) {
    return (
      <>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Workflow Properties</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name" className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Workflow Settings
              </Label>
              <div className="mt-2 space-y-3">
                <div>
                  <Label htmlFor="workflow-name" className="text-sm font-medium text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="workflow-name"
                    value={workflowName}
                    onChange={(e) => onWorkflowNameChange(e.target.value)}
                    className="mt-1"
                    data-testid="workflow-name-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="workflow-description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="workflow-description"
                    rows={3}
                    placeholder="Describe your workflow..."
                    className="mt-1"
                    data-testid="workflow-description"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Execution Settings
              </Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center space-x-3">
                  <Switch id="error-handling" defaultChecked data-testid="error-handling-switch" />
                  <Label htmlFor="error-handling" className="text-sm text-gray-700">
                    Continue on error
                  </Label>
                </div>
                
                <div>
                  <Label htmlFor="timeout" className="text-sm font-medium text-gray-700">
                    Timeout (seconds)
                  </Label>
                  <Input
                    id="timeout"
                    type="number"
                    defaultValue={300}
                    className="mt-1"
                    data-testid="timeout-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const nodeConfig = NODE_TYPES[selectedNode.data.nodeType as keyof typeof NODE_TYPES];
  const colorMap: Record<string, { bg: string; accent: string }> = {
    inputs: { bg: 'bg-blue-50', accent: 'bg-blue-500' },
    ai: { bg: 'bg-amber-50', accent: 'bg-amber-500' },
    processing: { bg: 'bg-emerald-50', accent: 'bg-emerald-500' },
    outputs: { bg: 'bg-red-50', accent: 'bg-red-500' },
  };
  const colors = colorMap[selectedNode.data.category] || { bg: 'bg-gray-50', accent: 'bg-gray-500' };

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Node Properties</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Node Header */}
          <div className={`flex items-center space-x-3 p-3 ${colors.bg} rounded-lg`}>
            <div className={`w-4 h-4 ${colors.accent} rounded-full`} />
            <div>
              <h4 className="text-sm font-semibold text-gray-900" data-testid="selected-node-name">
                {selectedNode.data.label}
              </h4>
              <p className="text-xs text-gray-600" data-testid="selected-node-id">
                {selectedNode.id}
              </p>
            </div>
          </div>

          {/* Basic Properties */}
          <div>
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Basic Settings
            </Label>
            <div className="mt-2 space-y-3">
              <div>
                <Label htmlFor="node-label" className="text-sm font-medium text-gray-700">
                  Label
                </Label>
                <Input
                  id="node-label"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => updateNodeData('label', e.target.value)}
                  className="mt-1"
                  data-testid="node-label-input"
                />
              </div>
              
              <div>
                <Label htmlFor="node-description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="node-description"
                  rows={2}
                  value={selectedNode.data.description || ''}
                  onChange={(e) => updateNodeData('description', e.target.value)}
                  className="mt-1"
                  data-testid="node-description-input"
                />
              </div>
            </div>
          </div>

          {/* Node-specific Configuration */}
          {selectedNode.data.nodeType === 'openai' && (
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                OpenAI Configuration
              </Label>
              <div className="mt-2 space-y-3">
                <div>
                  <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                    Model
                  </Label>
                  <Select 
                    value={selectedNode.data.model || 'gpt-4o'} 
                    onValueChange={(value) => updateNodeData('model', value)}
                  >
                    <SelectTrigger className="mt-1" data-testid="model-select">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">
                    Temperature: {selectedNode.data.temperature || 0.7}
                  </Label>
                  <Slider
                    value={[selectedNode.data.temperature || 0.7]}
                    onValueChange={([value]) => updateNodeData('temperature', value)}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                    data-testid="temperature-slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (Deterministic)</span>
                    <span>1 (Creative)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="max-tokens" className="text-sm font-medium text-gray-700">
                    Max Tokens
                  </Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={selectedNode.data.maxTokens || 150}
                    onChange={(e) => updateNodeData('maxTokens', parseInt(e.target.value))}
                    className="mt-1"
                    data-testid="max-tokens-input"
                  />
                </div>

                <div>
                  <Label htmlFor="system-prompt" className="text-sm font-medium text-gray-700">
                    System Prompt
                  </Label>
                  <Textarea
                    id="system-prompt"
                    rows={4}
                    value={selectedNode.data.systemPrompt || ''}
                    onChange={(e) => updateNodeData('systemPrompt', e.target.value)}
                    placeholder="You are a helpful assistant..."
                    className="mt-1"
                    data-testid="system-prompt-input"
                  />
                </div>

                <div>
                  <Label htmlFor="user-message" className="text-sm font-medium text-gray-700">
                    User Message Template
                  </Label>
                  <Textarea
                    id="user-message"
                    rows={3}
                    value={selectedNode.data.userMessage || ''}
                    onChange={(e) => updateNodeData('userMessage', e.target.value)}
                    placeholder="{{input}} or custom message..."
                    className="mt-1"
                    data-testid="user-message-input"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedNode.data.nodeType === 'agent' && (
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                AI Agent Configuration
              </Label>
              <div className="mt-2 space-y-3">
                <div>
                  <Label htmlFor="provider" className="text-sm font-medium text-gray-700">
                    LLM Provider
                  </Label>
                  <Select 
                    value={selectedNode.data.provider || 'openai'} 
                    onValueChange={(value) => {
                      updateNodeData('provider', value);
                      // Reset model when provider changes
                      const models = getProviderModels(value);
                      if (models.length > 0) {
                        updateNodeData('model', models[0]);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1" data-testid="provider-select">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LLM_PROVIDERS).map(([id, provider]) => (
                        <SelectItem key={id} value={id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                    Model
                  </Label>
                  <Select 
                    value={selectedNode.data.model || 'gpt-4o'} 
                    onValueChange={(value) => updateNodeData('model', value)}
                  >
                    <SelectTrigger className="mt-1" data-testid="agent-model-select">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {getProviderModels(selectedNode.data.provider || 'openai').map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">
                    Temperature: {selectedNode.data.temperature || 0.7}
                  </Label>
                  <Slider
                    value={[selectedNode.data.temperature || 0.7]}
                    onValueChange={([value]) => updateNodeData('temperature', value)}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                    data-testid="agent-temperature-slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (Deterministic)</span>
                    <span>1 (Creative)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="max-tokens" className="text-sm font-medium text-gray-700">
                    Max Tokens
                  </Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={selectedNode.data.maxTokens || 500}
                    onChange={(e) => updateNodeData('maxTokens', parseInt(e.target.value))}
                    className="mt-1"
                    data-testid="agent-max-tokens-input"
                  />
                </div>

                <div>
                  <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">
                    Agent Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    rows={4}
                    value={selectedNode.data.prompt || ''}
                    onChange={(e) => updateNodeData('prompt', e.target.value)}
                    placeholder="You are an AI agent with access to tools..."
                    className="mt-1"
                    data-testid="agent-prompt-input"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Features
                  </Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="memory"
                        checked={selectedNode.data.memory || false}
                        onCheckedChange={(checked) => updateNodeData('memory', checked)}
                        data-testid="memory-switch"
                      />
                      <Label htmlFor="memory" className="text-sm">
                        Memory (Context retention)
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Provider Status
                  </Label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="text-sm">
                      <Badge variant={selectedNode.data.provider === 'openai' ? 'default' : 'secondary'}>
                        {getProviderName(selectedNode.data.provider || 'openai')}
                      </Badge>
                    </div>
                    {selectedNode.data.provider !== 'openai' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: This provider needs API key configuration
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedNode.data.nodeType === 'condition' && (
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Condition Settings
              </Label>
              <div className="mt-2 space-y-3">
                <div>
                  <Label htmlFor="condition" className="text-sm font-medium text-gray-700">
                    Condition Expression
                  </Label>
                  <Input
                    id="condition"
                    value={selectedNode.data.condition || ''}
                    onChange={(e) => updateNodeData('condition', e.target.value)}
                    placeholder="e.g., sentiment > 0.7"
                    className="mt-1 font-mono"
                    data-testid="condition-input"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedNode.data.nodeType === 'email' && (
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Email Settings
              </Label>
              <div className="mt-2 space-y-3">
                <div>
                  <Label htmlFor="email-to" className="text-sm font-medium text-gray-700">
                    To
                  </Label>
                  <Input
                    id="email-to"
                    value={selectedNode.data.to || ''}
                    onChange={(e) => updateNodeData('to', e.target.value)}
                    placeholder="recipient@example.com"
                    className="mt-1"
                    data-testid="email-to-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email-subject" className="text-sm font-medium text-gray-700">
                    Subject
                  </Label>
                  <Input
                    id="email-subject"
                    value={selectedNode.data.subject || ''}
                    onChange={(e) => updateNodeData('subject', e.target.value)}
                    placeholder="Email subject..."
                    className="mt-1"
                    data-testid="email-subject-input"
                  />
                </div>

                <div>
                  <Label htmlFor="email-body" className="text-sm font-medium text-gray-700">
                    Body
                  </Label>
                  <Textarea
                    id="email-body"
                    rows={4}
                    value={selectedNode.data.body || ''}
                    onChange={(e) => updateNodeData('body', e.target.value)}
                    placeholder="Email body..."
                    className="mt-1"
                    data-testid="email-body-input"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedNode.data.nodeType === 'code' && (
            <div>
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Code Settings
              </Label>
              <div className="mt-2 space-y-3">
                <div>
                  <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                    Language
                  </Label>
                  <Select 
                    value={selectedNode.data.language || 'javascript'} 
                    onValueChange={(value) => updateNodeData('language', value)}
                  >
                    <SelectTrigger className="mt-1" data-testid="language-select">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                    Code
                  </Label>
                  <Textarea
                    id="code"
                    rows={8}
                    value={selectedNode.data.code || ''}
                    onChange={(e) => updateNodeData('code', e.target.value)}
                    placeholder="// Your code here..."
                    className="mt-1 font-mono"
                    data-testid="code-input"
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              data-testid="test-node-button"
            >
              Test Node
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => onNodeDelete(selectedNode.id)}
              data-testid="delete-node-button"
            >
              Delete Node
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
