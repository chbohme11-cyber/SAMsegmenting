import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Sparkles, 
  Image, 
  Paintbrush, 
  Zap, 
  Settings,
  Eye,
  Download
} from 'lucide-react';

interface AIPanelProps {
  onClose: () => void;
  onGenerate: (prompt: string, settings: any) => void;
  isProcessing: boolean;
}

interface GenerationSettings {
  model: string;
  steps: number;
  guidance: number;
  seed: number;
  width: number;
  height: number;
  strength: number;
  useUpscale: boolean;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  onClose,
  onGenerate,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [settings, setSettings] = useState<GenerationSettings>({
    model: 'sdxl-1.0',
    steps: 30,
    guidance: 7.5,
    seed: -1,
    width: 1024,
    height: 1024,
    strength: 0.8,
    useUpscale: false
  });

  const models = [
    { id: 'sdxl-1.0', name: 'SDXL 1.0', provider: 'Replicate' },
    { id: 'flux-dev', name: 'Flux Dev', provider: 'Replicate' },
    { id: 'kandinsky-3', name: 'Kandinsky 3', provider: 'DeepInfra' },
    { id: 'sdxl-turbo', name: 'SDXL Turbo', provider: 'DeepInfra' }
  ];

  const presetPrompts = [
    "a masterpiece, highly detailed, photorealistic",
    "artistic, oil painting style, vibrant colors",
    "cyberpunk, neon lights, futuristic cityscape",
    "nature photography, golden hour, stunning landscape"
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt, settings);
  };

  const updateSetting = <K extends keyof GenerationSettings>(
    key: K, 
    value: GenerationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full flex flex-col bg-panel-bg">
      {/* Header */}
      <div className="p-4 border-b border-panel-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold">AI Studio</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-secondary"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="inpaint" className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4" />
              Inpaint
            </TabsTrigger>
            <TabsTrigger value="enhance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Enhance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-3">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              
              {/* Preset Prompts */}
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((preset, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-accent transition-smooth"
                    onClick={() => setPrompt(preset)}
                  >
                    {preset.slice(0, 30)}...
                  </Badge>
                ))}
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-3">
              <Label htmlFor="negative">Negative Prompt</Label>
              <Textarea
                id="negative"
                placeholder="What to avoid in the generation..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <Separator />

            {/* Model Selection */}
            <div className="space-y-3">
              <Label>Model</Label>
              <Select 
                value={settings.model} 
                onValueChange={(value) => updateSetting('model', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <Label>Advanced Settings</Label>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Steps</Label>
                  <span className="text-sm text-muted-foreground">{settings.steps}</span>
                </div>
                <Slider
                  value={[settings.steps]}
                  onValueChange={([value]) => updateSetting('steps', value)}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Guidance Scale */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Guidance Scale</Label>
                  <span className="text-sm text-muted-foreground">{settings.guidance}</span>
                </div>
                <Slider
                  value={[settings.guidance]}
                  onValueChange={([value]) => updateSetting('guidance', value)}
                  min={1}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Width</Label>
                  <Select 
                    value={settings.width.toString()} 
                    onValueChange={(value) => updateSetting('width', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512</SelectItem>
                      <SelectItem value="768">768</SelectItem>
                      <SelectItem value="1024">1024</SelectItem>
                      <SelectItem value="1536">1536</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Height</Label>
                  <Select 
                    value={settings.height.toString()} 
                    onValueChange={(value) => updateSetting('height', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512">512</SelectItem>
                      <SelectItem value="768">768</SelectItem>
                      <SelectItem value="1024">1024</SelectItem>
                      <SelectItem value="1536">1536</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Seed */}
              <div className="space-y-2">
                <Label className="text-sm">Seed (-1 for random)</Label>
                <Input
                  type="number"
                  value={settings.seed}
                  onChange={(e) => updateSetting('seed', parseInt(e.target.value) || -1)}
                  placeholder="-1"
                />
              </div>

              {/* Upscale Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto Upscale</Label>
                <Switch
                  checked={settings.useUpscale}
                  onCheckedChange={(checked) => updateSetting('useUpscale', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inpaint" className="space-y-4">
            <div className="text-center py-8">
              <Paintbrush className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Inpainting</h3>
              <p className="text-sm text-muted-foreground">
                Select an area to inpaint using the selection tools, then describe what you want to replace it with.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="enhance" className="space-y-4">
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                Automatically enhance your images with AI upscaling, denoising, and quality improvements.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-panel-border space-y-3">
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isProcessing}
          className="w-full bg-gradient-primary hover:shadow-glow-primary transition-smooth"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="secondary" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};