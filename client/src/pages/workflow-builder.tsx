import React, { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import ReactFlow, { 
  Node, 
  Edge, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background,
  Connection,
  ConnectionMode,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { NodeLibrary } from '@/components/workflow/node-library';
import { PropertiesPanel } from '@/components/workflow/properties-panel';
import { CustomNode } from '@/components/workflow/custom-node';
import { LangChainNode } from '@/components/workflow/langchain-node';
import { TemplateModal } from '@/components/ui/template-modal';
import { NODE_TYPES } from '@/lib/node-types';
import { LANGCHAIN_NODE_TYPES } from '@/lib/langchain-node-types';
import { type Workflow, type WorkflowNode, type WorkflowEdge } from '@shared/schema';

const nodeTypes = {
  customNode: CustomNode,
  // Register all LangChain node types
  ...Object.fromEntries(
    LANGCHAIN_NODE_TYPES.map(nodeType => [
      nodeType.id,
      LangChainNode
    ])
  )
};

export default function WorkflowBuilder() {
  const { id: workflowId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string>('Ready');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Load workflow if ID is provided
  const { data: workflow, isLoading } = useQuery({
    queryKey: ['/api/workflows', workflowId],
    enabled: !!workflowId,
  });

  // Handle workflow loading success
  React.useEffect(() => {
    if (workflow) {
      const workflowData = workflow as Workflow;
      setWorkflowName(workflowData.name);
      setNodes(workflowData.nodes as Node[] || []);
      setEdges(workflowData.edges as Edge[] || []);
    }
  }, [workflow]);

  // Save workflow mutation
  const saveWorkflowMutation = useMutation({
    mutationFn: async (workflowData: any) => {
      if (workflowId) {
        return apiRequest('PUT', `/api/workflows/${workflowId}`, workflowData);
      } else {
        return apiRequest('POST', '/api/workflows', workflowData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    }
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async (input: any) => {
      if (!workflowId) throw new Error('No workflow ID');
      return apiRequest('POST', `/api/workflows/${workflowId}/execute`, input);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow executed successfully",
      });
      setExecutionStatus('Completed');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute workflow",
        variant: "destructive",
      });
      setExecutionStatus('Failed');
    }
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');

      if (!nodeType) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeConfig = NODE_TYPES[nodeType as keyof typeof NODE_TYPES];
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: 'customNode',
        position,
        data: {
          nodeType,
          label: nodeConfig.label,
          description: nodeConfig.description,
          category: nodeConfig.category,
          ...nodeConfig.defaultData,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSave = useCallback(() => {
    const workflowData = {
      name: workflowName,
      description: `AI workflow with ${nodes.length} nodes`,
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      settings: {},
      isActive: true,
    };

    saveWorkflowMutation.mutate(workflowData);
  }, [workflowName, nodes, edges, saveWorkflowMutation]);

  const handleExecute = useCallback(() => {
    if (!workflowId) {
      toast({
        title: "Error",
        description: "Please save the workflow before executing",
        variant: "destructive",
      });
      return;
    }

    setExecutionStatus('Running');
    executeWorkflowMutation.mutate({ message: 'Hello from workflow builder!' });
  }, [workflowId, executeWorkflowMutation, toast]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: any) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const handleTemplateLoad = useCallback((template: any) => {
    setWorkflowName(template.name);
    setNodes(template.nodes.map((node: any) => ({
      ...node,
      type: 'customNode',
    })));
    setEdges(template.edges);
    setIsTemplateModalOpen(false);
    
    toast({
      title: "Success",
      description: "Template loaded successfully",
    });
  }, [setNodes, setEdges, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">DTA Mind</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-primary bg-primary/10" data-testid="nav-workflows">
              Workflows
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsTemplateModalOpen(true)} data-testid="nav-templates">
              Templates
            </Button>
            <Button variant="ghost" size="sm" data-testid="nav-agents">
              Agents
            </Button>
            <Button variant="ghost" size="sm" data-testid="nav-docs">
              Docs
            </Button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Input 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-48 text-sm"
              data-testid="workflow-name-input"
            />
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500" data-testid="save-status">Saved</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={saveWorkflowMutation.isPending}
              data-testid="button-save"
            >
              Save
            </Button>
            <Button 
              size="sm" 
              onClick={handleExecute}
              disabled={executeWorkflowMutation.isPending}
              data-testid="button-execute"
            >
              {executeWorkflowMutation.isPending ? 'Running...' : 'Execute'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Badge 
              variant={
                executionStatus === 'Running' ? 'default' :
                executionStatus === 'Completed' ? 'default' :
                executionStatus === 'Failed' ? 'destructive' : 
                'secondary'
              }
              data-testid="execution-status"
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${
                executionStatus === 'Running' ? 'bg-yellow-500 animate-pulse' :
                executionStatus === 'Completed' ? 'bg-green-500' :
                executionStatus === 'Failed' ? 'bg-red-500' :
                'bg-green-500'
              }`}></div>
              {executionStatus}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Library */}
        {leftSidebarOpen && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <NodeLibrary />
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper} data-testid="workflow-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="workflow-canvas"
          >
            <Controls />
            <Background color="#e5e7eb" gap={20} />
            
            <Panel position="top-right" className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  data-testid="toggle-left-sidebar"
                >
                  {leftSidebarOpen ? '←' : '→'}
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  data-testid="toggle-right-sidebar"
                >
                  {rightSidebarOpen ? '→' : '←'}
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Sidebar - Properties Panel */}
        {rightSidebarOpen && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <PropertiesPanel 
              selectedNode={selectedNode}
              onNodeUpdate={handleNodeUpdate}
              onNodeDelete={handleNodeDelete}
              workflowName={workflowName}
              onWorkflowNameChange={setWorkflowName}
            />
          </div>
        )}
      </div>

      {/* Template Modal */}
      <TemplateModal 
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onTemplateSelect={handleTemplateLoad}
      />
    </div>
  );
}
