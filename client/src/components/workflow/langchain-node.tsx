import React from 'react';
import { Handle, Position } from 'reactflow';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LangChainNodeProps {
  data: {
    name: string;
    type: string;
    category: string;
    color: string;
    config: Record<string, any>;
  };
  selected?: boolean;
}

export function LangChainNode({ data, selected }: LangChainNodeProps) {
  const { name, type, category, color, config } = data;
  
  // Get the icon component based on the node type
  const getIcon = (): LucideIcon => {
    // This will be dynamically imported based on the node type
    // For now, we'll use a default icon
    return require('lucide-react').FileText;
  };

  const Icon = getIcon();

  return (
    <Card 
      className={`min-w-[200px] transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'
      }`}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon 
              size={20} 
              style={{ color: color }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">
              {name}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="text-xs mt-1"
              style={{ backgroundColor: `${color}20`, color: color }}
            >
              {category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground mb-2">
          Type: {type}
        </div>
        
        {/* Configuration preview */}
        {Object.keys(config).length > 0 && (
          <div className="space-y-1">
            {Object.entries(config).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{key}:</span>
                <span className="truncate max-w-[100px]">
                  {typeof value === 'string' && value.length > 20 
                    ? `${value.substring(0, 20)}...` 
                    : String(value)
                  }
                </span>
              </div>
            ))}
            {Object.keys(config).length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{Object.keys(config).length - 3} more
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Input handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </Card>
  );
}

export default LangChainNode;
