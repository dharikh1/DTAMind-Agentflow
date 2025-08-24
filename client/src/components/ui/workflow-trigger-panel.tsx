import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Zap, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkflowInput {
  name: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'file' | 'url';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: string | number;
  options?: string[];
  placeholder?: string;
}

interface WorkflowTrigger {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: WorkflowInput[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  executionTime?: number;
}

export function WorkflowTriggerPanel() {
  const [workflows, setWorkflows] = useState<WorkflowTrigger[]>([
    {
      id: 'document-qa',
      name: 'Document Q&A System',
      description: 'Ask questions about your documents using AI-powered search',
      category: 'RAG',
      status: 'idle',
      inputs: [
        {
          name: 'question',
          type: 'textarea',
          label: 'Your Question',
          description: 'What would you like to know about your documents?',
          required: true,
          placeholder: 'e.g., What are the main points about machine learning?'
        },
        {
          name: 'document_type',
          type: 'select',
          label: 'Document Type',
          description: 'Select the type of documents to search',
          required: false,
          options: ['All Documents', 'PDFs', 'CSVs', 'Web Pages'],
          defaultValue: 'All Documents'
        },
        {
          name: 'search_depth',
          type: 'select',
          label: 'Search Depth',
          description: 'How thorough should the search be?',
          required: false,
          options: ['Quick', 'Standard', 'Deep'],
          defaultValue: 'Standard'
        }
      ]
    },
    {
      id: 'web-research-agent',
      name: 'Web Research Agent',
      description: 'AI agent that researches topics by searching the web and analyzing content',
      category: 'Research',
      status: 'idle',
      inputs: [
        {
          name: 'research_topic',
          type: 'textarea',
          label: 'Research Topic',
          description: 'What topic would you like me to research?',
          required: true,
          placeholder: 'e.g., Latest developments in quantum computing'
        },
        {
          name: 'search_engines',
          type: 'select',
          label: 'Search Engines',
          description: 'Which search engines to use',
          required: false,
          options: ['Google', 'Bing', 'DuckDuckGo', 'All'],
          defaultValue: 'Google'
        },
        {
          name: 'max_results',
          type: 'number',
          label: 'Maximum Results',
          description: 'How many search results to analyze',
          required: false,
          defaultValue: 5
        }
      ]
    },
    {
      id: 'ai-code-assistant',
      name: 'AI Code Assistant',
      description: 'Get AI-powered code review, generation, and optimization',
      category: 'Development',
      status: 'idle',
      inputs: [
        {
          name: 'code',
          type: 'textarea',
          label: 'Your Code',
          description: 'Paste the code you want me to review or optimize',
          required: true,
          placeholder: '// Paste your code here...'
        },
        {
          name: 'language',
          type: 'select',
          label: 'Programming Language',
          description: 'Select the programming language',
          required: false,
          options: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go'],
          defaultValue: 'Python'
        },
        {
          name: 'task',
          type: 'select',
          label: 'What do you need?',
          description: 'Select the type of assistance',
          required: false,
          options: ['Code Review', 'Optimization', 'Bug Fix', 'Documentation', 'All'],
          defaultValue: 'Code Review'
        }
      ]
    },
    {
      id: 'conversational-ai',
      name: 'Conversational AI',
      description: 'Chat with an AI that remembers your conversation context',
      category: 'Conversation',
      status: 'idle',
      inputs: [
        {
          name: 'message',
          type: 'textarea',
          label: 'Your Message',
          description: 'What would you like to chat about?',
          required: true,
          placeholder: 'Hello! How can you help me today?'
        },
        {
          name: 'personality',
          type: 'select',
          label: 'AI Personality',
          description: 'Choose how the AI should behave',
          required: false,
          options: ['Helpful Assistant', 'Creative Writer', 'Technical Expert', 'Friendly Chat'],
          defaultValue: 'Helpful Assistant'
        }
      ]
    }
  ]);

  const [inputValues, setInputValues] = useState<Record<string, Record<string, any>>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const updateInputValue = (workflowId: string, inputName: string, value: any) => {
    setInputValues(prev => ({
      ...prev,
      [workflowId]: {
        ...prev[workflowId],
        [inputName]: value
      }
    }));
  };

  const executeWorkflow = async (workflow: WorkflowTrigger) => {
    if (isExecuting) return;

    // Validate required inputs
    const requiredInputs = workflow.inputs.filter(input => input.required);
    const missingInputs = requiredInputs.filter(input => {
      const value = inputValues[workflow.id]?.[input.name];
      return !value || (typeof value === 'string' && !value.trim());
    });

    if (missingInputs.length > 0) {
      toast({
        title: "Missing Required Inputs",
        description: `Please fill in: ${missingInputs.map(i => i.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    // Update workflow status
    setWorkflows(prev => prev.map(w => 
      w.id === workflow.id ? { ...w, status: 'running' } : w
    ));

    try {
      const startTime = Date.now();
      
      // Prepare execution data
      const executionData = {
        workflowId: workflow.id,
        inputs: inputValues[workflow.id] || {},
        timestamp: new Date().toISOString()
      };

      // Execute workflow (this would call your backend)
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executionData)
      });

      const executionTime = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        
        setWorkflows(prev => prev.map(w => 
          w.id === workflow.id ? { 
            ...w, 
            status: 'completed', 
            lastRun: new Date(),
            executionTime 
          } : w
        ));

        toast({
          title: "Workflow Completed",
          description: `${workflow.name} executed successfully in ${executionTime}ms!`,
        });

        // Show results in a modal or expand the workflow
        console.log('Workflow result:', result);
      } else {
        throw new Error('Workflow execution failed');
      }
    } catch (error) {
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id ? { ...w, status: 'failed' } : w
      ));

      toast({
        title: "Workflow Failed",
        description: `Failed to execute ${workflow.name}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const resetWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'idle' } : w
    ));
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[workflowId];
      return newValues;
    });
  };

  const renderInputField = (workflowId: string, input: WorkflowInput) => {
    const value = inputValues[workflowId]?.[input.name] ?? input.defaultValue ?? '';

    switch (input.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateInputValue(workflowId, input.name, e.target.value)}
            placeholder={input.placeholder}
            rows={3}
            className="mt-1"
          />
        );
      
      case 'select':
        return (
          <Select
            value={value?.toString()}
            onValueChange={(val) => updateInputValue(workflowId, input.name, val)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={`Select ${input.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateInputValue(workflowId, input.name, parseFloat(e.target.value) || 0)}
            placeholder={input.placeholder}
            className="mt-1"
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateInputValue(workflowId, input.name, e.target.value)}
            placeholder={input.placeholder}
            className="mt-1"
          />
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Triggers</h2>
          <p className="text-muted-foreground">
            Start your AI workflows with custom inputs and parameters.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Create Custom Workflow
        </Button>
      </div>

      <div className="grid gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {workflow.name}
                    <Badge variant="outline" className="text-xs">
                      {workflow.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(workflow.status)} border`}>
                    {getStatusIcon(workflow.status)}
                    <span className="ml-1 capitalize">{workflow.status}</span>
                  </Badge>
                  {workflow.lastRun && (
                    <Badge variant="outline" className="text-xs">
                      Last run: {workflow.lastRun.toLocaleTimeString()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                {workflow.inputs.map((input) => (
                  <div key={input.name} className="space-y-2">
                    <Label htmlFor={`${workflow.id}-${input.name}`} className="text-sm font-medium">
                      {input.label}
                      {input.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {renderInputField(workflow.id, input)}
                    
                    {input.description && (
                      <p className="text-xs text-muted-foreground">
                        {input.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {workflow.executionTime && (
                    <span>⏱️ Execution time: {workflow.executionTime}ms</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {workflow.status === 'idle' && (
                    <Button
                      onClick={() => executeWorkflow(workflow)}
                      disabled={isExecuting}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Execute Workflow
                    </Button>
                  )}
                  
                  {workflow.status === 'completed' && (
                    <Button
                      variant="outline"
                      onClick={() => resetWorkflow(workflow.id)}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Run Again
                    </Button>
                  )}
                  
                  {workflow.status === 'failed' && (
                    <Button
                      variant="outline"
                      onClick={() => resetWorkflow(workflow.id)}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">💡 How to Use Workflow Triggers</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Fill in the required inputs marked with a red asterisk (*)</li>
          <li>• Click "Execute Workflow" to start the AI workflow</li>
          <li>• Monitor the execution status and results</li>
          <li>• Use "Run Again" to re-execute completed workflows</li>
        </ul>
      </div>
    </div>
  );
}
