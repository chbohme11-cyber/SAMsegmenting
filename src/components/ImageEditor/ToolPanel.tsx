import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  MousePointer, 
  Scissors, 
  Paintbrush, 
  Eraser, 
  Wand2, 
  Layers, 
  Settings,
  Bot,
  Image,
  Target,
  Brush
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'selection' | 'edit' | 'ai';
}

interface ToolPanelProps {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onShowAI: () => void;
}

const tools: Tool[] = [
  {
    id: 'select',
    name: 'Select',
    icon: MousePointer,
    description: 'Select and move objects',
    category: 'selection'
  },
  {
    id: 'sam2-segment',
    name: 'SAM2 Segment',
    icon: Target,
    description: 'AI-powered object segmentation',
    category: 'selection'
  },
  {
    id: 'magic-cut',
    name: 'Magic Cut',
    icon: Scissors,
    description: 'Intelligent background removal',
    category: 'edit'
  },
  {
    id: 'inpaint',
    name: 'Inpaint',
    icon: Paintbrush,
    description: 'Fill selected areas with AI',
    category: 'ai'
  },
  {
    id: 'erase',
    name: 'Eraser',
    icon: Eraser,
    description: 'Remove unwanted objects',
    category: 'edit'
  },
  {
    id: 'enhance',
    name: 'Enhance',
    icon: Wand2,
    description: 'AI image enhancement',
    category: 'ai'
  }
];

export const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedTool,
  onToolSelect,
  onShowAI
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('selection');

  const categories = [
    { id: 'selection', name: 'Selection', icon: Target },
    { id: 'edit', name: 'Edit', icon: Brush },
    { id: 'ai', name: 'AI Tools', icon: Bot }
  ];

  const filteredTools = tools.filter(tool => tool.category === activeCategory);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground">Tools</h2>
        
        {/* Category Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-background rounded-lg">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 transition-smooth ${
                activeCategory === category.id 
                  ? 'bg-gradient-primary shadow-glow-primary' 
                  : 'hover:bg-secondary'
              }`}
            >
              <category.icon className="w-4 h-4 mr-1" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredTools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedTool === tool.id ? 'default' : 'outline'}
                onClick={() => onToolSelect(tool.id)}
                className={`w-full h-20 flex flex-col items-center gap-2 transition-smooth ${
                  selectedTool === tool.id 
                    ? 'bg-gradient-primary shadow-glow-primary border-primary' 
                    : 'hover:border-accent hover:shadow-glow-accent'
                }`}
              >
                <tool.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tool.name}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline" 
            onClick={onShowAI}
            className="w-full justify-start hover:border-accent hover:shadow-glow-accent transition-smooth"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Generator
            <Badge variant="secondary" className="ml-auto">Pro</Badge>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start hover:border-accent hover:shadow-glow-accent transition-smooth"
          >
            <Layers className="w-4 h-4 mr-2" />
            Layers
            <Badge variant="outline" className="ml-auto">3</Badge>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start hover:border-accent hover:shadow-glow-accent transition-smooth"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {selectedTool === 'sam2-segment' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-card rounded-lg border"
        >
          <h4 className="font-semibold mb-2">SAM2 Segmentation</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Click on any object to automatically segment it with Meta's SAM2 model.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Precision:</span>
              <Badge variant="secondary">High</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Speed:</span>
              <Badge variant="secondary">Fast</Badge>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};