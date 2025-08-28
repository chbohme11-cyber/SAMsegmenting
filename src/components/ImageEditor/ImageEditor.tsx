import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, CanvasRef } from './Canvas';
import { ToolPanel } from './ToolPanel';
import { AIPanel } from './AIPanel';
import { HeaderBar } from './HeaderBar';
import { LayersPanel } from './LayersPanel';
import { APIKeyDialog } from './APIKeyDialog';
import { toast } from 'sonner';
import { useEditorStore } from '@/lib/editorStore';
import { createAIService, segmentationService } from '@/services/aiService';

interface ImageEditorProps {}

export const ImageEditor: React.FC<ImageEditorProps> = () => {
  const {
    currentImage,
    layers,
    activeLayerId,
    selectedTool,
    isProcessing,
    apiKeys,
    setCurrentImage,
    setSelectedTool,
    setProcessing,
    setAPIKeys,
    addLayer,
    removeLayer,
    updateLayer,
    setActiveLayer,
    duplicateLayer
  } = useEditorStore();

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showAPIDialog, setShowAPIDialog] = useState(false);
  const canvasRef = useRef<CanvasRef>(null);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCurrentImage(e.target.result as string);
        toast.success('Image loaded successfully');
      }
    };
    reader.readAsDataURL(file);
  }, [setCurrentImage]);

  const handleToolSelect = useCallback((toolId: string) => {
    setSelectedTool(toolId);
    
    // Check if API keys are needed for AI tools
    if ((['sam2-segment', 'inpaint', 'enhance'].includes(toolId)) && 
        (!apiKeys.replicate && !apiKeys.deepinfra)) {
      setShowAPIDialog(true);
      toast.info('API keys required for AI features');
    }
  }, [setSelectedTool, apiKeys]);

  const handleAIGenerate = useCallback(async (prompt: string, settings: any) => {
    if (!apiKeys.replicate && !apiKeys.deepinfra) {
      setShowAPIDialog(true);
      return;
    }

    setProcessing(true, 'Generating with AI...');
    try {
      const aiService = createAIService(apiKeys);
      const result = await aiService.generateImage(prompt, '', settings);
      
      // Add generated image as new layer
      addLayer({
        name: 'AI Generated',
        thumbnail: result
      });
      
      toast.success('AI generation completed!');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('AI generation failed');
    } finally {
      setProcessing(false);
    }
  }, [apiKeys, setProcessing, addLayer]);

  const handleLayerToggle = useCallback((layerId: string, property: 'visible' | 'locked') => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { [property]: !layer[property] });
    }
  }, [layers, updateLayer]);

  const handleLayerOpacity = useCallback((layerId: string, opacity: number) => {
    updateLayer(layerId, { opacity });
  }, [updateLayer]);

  const handleSaveProject = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      const dataURL = canvasRef.current?.exportImage();
      if (dataURL) {
        // Save project logic here
        toast.success('Project saved!');
      }
    }
  }, []);

  const handleExportImage = useCallback(() => {
    const dataURL = canvasRef.current?.exportImage();
    if (dataURL) {
      const link = document.createElement('a');
      link.download = 'ai-edited-image.png';
      link.href = dataURL;
      link.click();
      toast.success('Image exported!');
    }
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <HeaderBar 
        onImageUpload={handleImageUpload}
        onSave={handleSaveProject}
        onExport={handleExportImage}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tool Panel */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-panel-bg border-r border-panel-border overflow-y-auto"
        >
          <ToolPanel 
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            onShowAI={() => setShowAIPanel(true)}
          />
        </motion.div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-canvas-bg relative">
          <Canvas 
            ref={canvasRef}
            currentImage={currentImage}
            selectedTool={selectedTool}
            isProcessing={isProcessing}
          />
        </div>

        {/* Right Panels */}
        <div className="flex">
          {/* Layers Panel */}
          {showLayersPanel && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              className="w-80 bg-panel-bg border-l border-panel-border overflow-y-auto"
            >
              <LayersPanel
                layers={layers}
                activeLayerId={activeLayerId || ''}
                onLayerSelect={setActiveLayer}
                onLayerToggle={handleLayerToggle}
                onLayerOpacity={handleLayerOpacity}
                onLayerDelete={removeLayer}
                onLayerDuplicate={duplicateLayer}
                onLayerAdd={() => addLayer({ name: `Layer ${layers.length + 1}` })}
              />
            </motion.div>
          )}

          {/* AI Panel */}
          {showAIPanel && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              className="w-96 bg-panel-bg border-l border-panel-border overflow-y-auto"
            >
              <AIPanel 
                onClose={() => setShowAIPanel(false)}
                onGenerate={handleAIGenerate}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* API Key Configuration Dialog */}
      <APIKeyDialog
        open={showAPIDialog}
        onOpenChange={setShowAPIDialog}
        onSave={(keys) => {
          setAPIKeys(keys);
          toast.success('API keys saved successfully!');
        }}
      />
    </div>
  );
};