import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CustomNodeData {
  nodeType: string;
  label: string;
  description: string;
  category: string;
  [key: string]: any;
}

export function CustomNode({ data, selected, id }: NodeProps<CustomNodeData>) {
  const getNodeColor = (category: string) => {
    switch (category) {
      case 'inputs':
        return { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-500' };
      case 'ai':
        return { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500' };
      case 'processing':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500' };
      case 'outputs':
        return { bg: 'bg-red-50', border: 'border-red-200', accent: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', accent: 'bg-gray-500' };
    }
  };

  const colors = getNodeColor(data.category);
  const hasInput = data.category !== 'inputs';
  const hasOutput = data.category !== 'outputs' || data.nodeType === 'webhook-response';

  return (
    <div 
      className={`
        relative min-w-[200px] max-w-[250px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${colors.bg} ${colors.border}
        ${selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-xl'}
      `}
      data-testid={`node-${id}`}
    >
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className={`w-3 h-3 ${colors.accent} border-2 border-white`}
          data-testid={`handle-input-${id}`}
        />
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${colors.accent} rounded-full`} />
            <span className="text-sm font-semibold text-gray-900">{data.label}</span>
          </div>
          {data.category === 'ai' && (
            <Badge variant="secondary" className="text-xs">
              {data.model || 'AI'}
            </Badge>
          )}
        </div>

        <p className="text-xs text-gray-600 mb-2">{data.description}</p>

        {/* Node-specific content */}
        {data.nodeType === 'openai' && (
          <div className="text-xs text-gray-500">
            <div>Model: {data.model || 'gpt-4o'}</div>
            <div>Temperature: {data.temperature || 0.7}</div>
          </div>
        )}

        {data.nodeType === 'condition' && data.condition && (
          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            {data.condition}
          </div>
        )}

        {data.nodeType === 'email' && (
          <div className="text-xs text-gray-500">
            <div>To: {data.to || 'Not configured'}</div>
            <div>Subject: {data.subject || 'Not configured'}</div>
          </div>
        )}

        {data.nodeType === 'code' && (
          <div className="text-xs text-gray-500">
            Language: {data.language || 'javascript'}
          </div>
        )}
      </div>

      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className={`w-3 h-3 ${colors.accent} border-2 border-white`}
          data-testid={`handle-output-${id}`}
        />
      )}

      {/* Multiple outputs for condition nodes */}
      {data.nodeType === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '30%' }}
            className="w-3 h-3 bg-green-500 border-2 border-white"
            data-testid={`handle-output-true-${id}`}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '70%' }}
            className="w-3 h-3 bg-red-500 border-2 border-white"
            data-testid={`handle-output-false-${id}`}
          />
        </>
      )}
    </div>
  );
}
