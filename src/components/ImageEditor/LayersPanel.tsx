import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  Plus,
  Layers as LayersIcon 
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  thumbnail?: string;
}

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerToggle: (layerId: string, property: 'visible' | 'locked') => void;
  onLayerOpacity: (layerId: string, opacity: number) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerAdd: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggle,
  onLayerOpacity,
  onLayerDelete,
  onLayerDuplicate,
  onLayerAdd
}) => {
  const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
    'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion'
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <LayersIcon className="w-4 h-4" />
          Layers
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onLayerAdd}
          className="hover:border-accent transition-smooth"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-3 rounded-lg border cursor-pointer transition-smooth
              ${layer.id === activeLayerId 
                ? 'border-primary bg-primary/10 shadow-glow-primary' 
                : 'border-panel-border bg-card hover:border-accent'
              }
            `}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center gap-3">
              {/* Layer Thumbnail */}
              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                {layer.thumbnail ? (
                  <img 
                    src={layer.thumbnail} 
                    alt={layer.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-primary rounded opacity-60" />
                )}
              </div>

              {/* Layer Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{layer.name}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(layer.opacity)}% opacity
                </div>
              </div>

              {/* Layer Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggle(layer.id, 'visible');
                  }}
                  className="h-6 w-6 p-0 hover:bg-secondary"
                >
                  {layer.visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3 opacity-50" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggle(layer.id, 'locked');
                  }}
                  className="h-6 w-6 p-0 hover:bg-secondary"
                >
                  {layer.locked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3 opacity-50" />
                  )}
                </Button>
              </div>
            </div>

            {/* Opacity Slider for Active Layer */}
            {layer.id === activeLayerId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 space-y-3 border-t border-border pt-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Opacity</span>
                    <span>{Math.round(layer.opacity)}%</span>
                  </div>
                  <Slider
                    value={[layer.opacity]}
                    onValueChange={([value]) => onLayerOpacity(layer.id, value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDuplicate(layer.id);
                    }}
                    className="flex-1 text-xs hover:border-accent"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    className="flex-1 text-xs hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {layers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <LayersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No layers yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onLayerAdd}
            className="mt-2"
          >
            Create First Layer
          </Button>
        </div>
      )}
    </div>
  );
};