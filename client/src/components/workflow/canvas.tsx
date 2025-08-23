import React, { useCallback, useRef, useState } from 'react';
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
  Panel,
  MiniMap,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CustomNode } from './custom-node';
import { NODE_TYPES } from '@/lib/node-types';

const nodeTypes = {
  customNode: CustomNode,
};

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onNodeUpdate: (nodeId: string, updates: any) => void;
  onNodeDelete: (nodeId: string) => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  executionStatus: string;
}

function CanvasContent({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onPaneClick,
  onNodeUpdate,
  onNodeDelete,
  leftSidebarOpen,
  rightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  executionStatus
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const [isDragOver, setIsDragOver] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: executionStatus === 'Running',
        style: {
          stroke: executionStatus === 'Running' ? '#3b82f6' : '#6b7280',
          strokeWidth: 2,
        },
      };
      onEdgesChange([{ type: 'add', item: newEdge }]);
    },
    [onEdgesChange, executionStatus]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

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

      onNodesChange([{ type: 'add', item: newNode }]);
    },
    [reactFlowInstance, onNodesChange]
  );

  const onDeleteKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        selectedNodes.forEach(node => onNodeDelete(node.id));
        selectedEdges.forEach(edge => {
          onEdgesChange([{ type: 'remove', id: edge.id }]);
        });
      }
    },
    [nodes, edges, onNodeDelete, onEdgesChange]
  );

  React.useEffect(() => {
    document.addEventListener('keydown', onDeleteKeyPress);
    return () => {
      document.removeEventListener('keydown', onDeleteKeyPress);
    };
  }, [onDeleteKeyPress]);

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper} data-testid="workflow-canvas">
      {/* Drop Zone Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
          <div className="bg-white px-6 py-3 rounded-lg shadow-lg border border-primary/20">
            <div className="text-primary font-medium">Drop node here to add to workflow</div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="workflow-canvas bg-gray-50"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[20, 20]}
        deleteKeyCode={null} // Disable default delete behavior
      >
        <Controls 
          className="react-flow__controls"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        
        <Background 
          color="#e5e7eb" 
          gap={20} 
          size={1}
        />
        
        <MiniMap
          nodeColor={(node) => {
            switch (node.data.category) {
              case 'inputs':
                return '#3b82f6';
              case 'ai':
                return '#f59e0b';
              case 'processing':
                return '#10b981';
              case 'outputs':
                return '#ef4444';
              default:
                return '#6b7280';
            }
          }}
          nodeStrokeWidth={3}
          nodeBorderRadius={8}
          className="bg-white border border-gray-200 rounded-lg"
        />
        
        {/* Canvas Toolbar */}
        <Panel position="top-right" className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleLeftSidebar}
              className="p-2 h-8 w-8"
              data-testid="toggle-left-sidebar"
              title={leftSidebarOpen ? "Hide Components" : "Show Components"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={leftSidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </Button>
            
            <Separator orientation="vertical" className="h-4" />
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleRightSidebar}
              className="p-2 h-8 w-8"
              data-testid="toggle-right-sidebar"
              title={rightSidebarOpen ? "Hide Properties" : "Show Properties"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={rightSidebarOpen ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
              </svg>
            </Button>
            
            <Separator orientation="vertical" className="h-4" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reactFlowInstance.fitView()}
              className="p-2 h-8 w-8"
              title="Fit View"
              data-testid="fit-view-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </Button>
          </div>
        </Panel>

        {/* Execution Status Panel */}
        <Panel position="top-left" className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              executionStatus === 'Running' ? 'bg-yellow-500 animate-pulse' :
              executionStatus === 'Completed' ? 'bg-green-500' :
              executionStatus === 'Failed' ? 'bg-red-500' :
              'bg-green-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-700" data-testid="canvas-execution-status">
              {executionStatus}
            </span>
          </div>
        </Panel>

        {/* Node Count Panel */}
        <Panel position="bottom-left" className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span data-testid="node-count">{nodes.length} nodes</span>
            <span data-testid="edge-count">{edges.length} connections</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
}
