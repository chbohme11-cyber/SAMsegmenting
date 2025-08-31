import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Target, 
  Scissors, 
  Eraser,
  Wand2,
  X,
  Settings,
  Eye,
  Layers,
  Download
} from 'lucide-react';

interface SegmentationPanelProps {
  onClose: () => void;
  selectedTool: string;
  onToolChange: (tool: string) => void;
}

export const SegmentationPanel: React.FC<SegmentationPanelProps> = ({
  onClose,
  selectedTool,
  onToolChange
}) => {
  const [threshold, setThreshold] = useState([0.15]);
  const [dilate, setDilate] = useState([3]);
  const [includeEdges, setIncludeEdges] = useState(true);
  const [autoRefine, setAutoRefine] = useState(true);
  const [multiObject, setMultiObject] = useState(false);

  const segmentationTools = [
    {
      id: 'sam2-segment',
      name: 'SAM2 Segment',
      icon: Target,
      description: 'AI-powered object segmentation',
      active: selectedTool === 'sam2-segment'
    },
    {
      id: 'magic-cut',
      name: 'Magic Cut',
      icon: Scissors,
      description: 'Intelligent background removal',
      active: selectedTool === 'magic-cut'
    },
    {
      id: 'smart-erase',
      name: 'Smart Erase',
      icon: Eraser,
      description: 'Remove objects intelligently',
      active: selectedTool === 'smart-erase'
    },
    {
      id: 'refine-mask',
      name: 'Refine Mask',
      icon: Wand2,
      description: 'Fine-tune segmentation',
      active: selectedTool === 'refine-mask'
    }
  ];

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-panel-bg border-l border-panel-border overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">SAM2 Segmentation</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Segmentation Tools */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {segmentationTools.map((tool) => (
              <motion.div
                key={tool.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={tool.active ? 'default' : 'outline'}
                  onClick={() => onToolChange(tool.id)}
                  className={`w-full h-16 flex flex-col items-center gap-1 text-xs transition-smooth ${
                    tool.active 
                      ? 'bg-gradient-primary shadow-glow-primary border-primary' 
                      : 'hover:border-accent hover:shadow-glow-accent'
                  }`}
                >
                  <tool.icon className="w-4 h-4" />
                  <span className="font-medium">{tool.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SAM2 Settings */}
        {selectedTool === 'sam2-segment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-muted-foreground">SAM2 Settings</h3>
            
            {/* Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sensitivity</span>
                <span>{threshold[0].toFixed(2)}</span>
              </div>
              <Slider
                value={threshold}
                onValueChange={setThreshold}
                min={0.05}
                max={0.5}
                step={0.01}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower values = more precise, Higher values = more inclusive
              </p>
            </div>

            {/* Dilation */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Edge Expansion</span>
                <span>{dilate[0]}px</span>
              </div>
              <Slider
                value={dilate}
                onValueChange={setDilate}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Expand or contract the segmentation edges
              </p>
            </div>

            {/* Edge Detection */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Include Edges</span>
                <p className="text-xs text-muted-foreground">Better object boundaries</p>
              </div>
              <Switch
                checked={includeEdges}
                onCheckedChange={setIncludeEdges}
              />
            </div>

            {/* Auto Refine */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Auto Refine</span>
                <p className="text-xs text-muted-foreground">Post-process results</p>
              </div>
              <Switch
                checked={autoRefine}
                onCheckedChange={setAutoRefine}
              />
            </div>

            {/* Multi-object Mode */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Multi-Object</span>
                <p className="text-xs text-muted-foreground">Segment multiple objects</p>
              </div>
              <Switch
                checked={multiObject}
                onCheckedChange={setMultiObject}
              />
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Quick Actions</h3>
          
          <Button
            variant="outline"
            className="w-full justify-start hover:border-accent hover:shadow-glow-accent transition-smooth"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Mask
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start hover:border-accent hover:shadow-glow-accent transition-smooth"
          >
            <Layers className="w-4 h-4 mr-2" />
            Add to Layer
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start hover:border-accent hover:shadow-glow-accent transition-smooth"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Mask
          </Button>
        </div>

        {/* Status */}
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">SAM2 Status</span>
            <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-400/20">
              Ready
            </Badge>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Model:</span>
              <span>facebook/sam-vit-base</span>
            </div>
            <div className="flex justify-between">
              <span>Device:</span>
              <span>WebGPU</span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span>~500MB</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="text-sm font-medium mb-2 text-primary">How to use SAM2</h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Select SAM2 Segment tool</li>
            <li>2. Click on any object in the image</li>
            <li>3. Wait for AI to process segmentation</li>
            <li>4. Refine settings if needed</li>
            <li>5. Add result to layers or export</li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
};