import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NODE_TYPES } from '@/lib/node-types';
import { LANGCHAIN_NODE_TYPES, getAllCategories } from '@/lib/langchain-node-types';

export function NodeLibrary() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Combine original and LangChain node types
  const allNodeTypes = {
    ...NODE_TYPES,
    ...Object.fromEntries(
      LANGCHAIN_NODE_TYPES.map(nodeType => [
        nodeType.id,
        {
          label: nodeType.name,
          description: nodeType.description,
          category: nodeType.category,
          color: nodeType.color,
          type: nodeType.id
        }
      ])
    )
  };

  const filteredNodeTypes = Object.entries(allNodeTypes).filter(([key, config]) => 
    config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedNodeTypes = filteredNodeTypes.reduce((acc, [key, config]) => {
    const category = config.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push([key, config]);
    return acc;
  }, {} as Record<string, Array<[string, any]>>);

  const categoryColors = {
    inputs: 'bg-blue-50 border-blue-200 text-blue-800',
    ai: 'bg-amber-50 border-amber-200 text-amber-800',
    processing: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    outputs: 'bg-red-50 border-red-200 text-red-800',
    'Document Processing': 'bg-indigo-50 border-indigo-200 text-indigo-800',
    'Vector Stores': 'bg-purple-50 border-purple-200 text-purple-800',
    'AI Models': 'bg-green-50 border-green-200 text-green-800',
    'Memory': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    'Tools': 'bg-orange-50 border-orange-200 text-orange-800',
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Components</h3>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-components"
          />
          <svg 
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {Object.entries(groupedNodeTypes).map(([category, nodes]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category}
              </h4>
              <div className="space-y-2">
                {nodes.map(([nodeType, config]) => (
                  <div
                    key={nodeType}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md border ${
                      categoryColors[category as keyof typeof categoryColors]
                    }`}
                    draggable
                    onDragStart={(e) => onDragStart(e, nodeType)}
                    data-testid={`node-${nodeType}`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          config.color === 'blue' ? 'bg-blue-500' :
                          config.color === 'amber' ? 'bg-amber-500' :
                          config.color === 'emerald' ? 'bg-emerald-500' :
                          'bg-red-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
