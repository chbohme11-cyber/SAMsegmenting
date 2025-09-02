import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Stage, Layer, Image as KonvaImage, Rect, Circle } from 'react-konva';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Move, Plus, Minus } from 'lucide-react';
import Konva from 'konva';
import { useEditorStore } from '@/lib/editorStore';
import { toast } from 'sonner';

interface CanvasProps {
  currentImage: string | null;
  selectedTool: string;
  isProcessing: boolean;
}

export interface CanvasRef {
  getCanvas: () => Konva.Stage | null;
  exportImage: () => string | null;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(({
  currentImage,
  selectedTool,
  isProcessing
}, ref) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [layerImages, setLayerImages] = useState<{[key: string]: HTMLImageElement}>({});
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [samPoints, setSamPoints] = useState<{x: number, y: number, type: 'positive' | 'negative'}[]>([]);
  const {
    setProcessing,
    setMask,
    addLayer,
    layers,
    activeLayerId,
    updateLayer,
    removeLayer
  } = useEditorStore();

  useImperativeHandle(ref, () => ({
    getCanvas: () => stageRef.current,
    exportImage: () => {
      if (!stageRef.current) return null;
      return stageRef.current.toDataURL();
    }
  }));

  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.canvas-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setStageSize({
          width: rect.width - 40, // padding
          height: rect.height - 40
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize SAM2 when component mounts
    const initializeSAM2 = async () => {
      try {
        const { segmentationService } = await import('@/services/aiService');
        await segmentationService.initializeSAM2();
        console.log('SAM2 initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize SAM2:', error);
      }
    };
    initializeSAM2();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentImage) {
      const img = new window.Image();
      img.onload = () => {
        setImage(img);
        // Auto-fit image to canvas
        const scaleX = stageSize.width / img.width;
        const scaleY = stageSize.height / img.height;
        const autoScale = Math.min(scaleX, scaleY, 1);
        setScale(autoScale);
        setPosition({
          x: (stageSize.width - img.width * autoScale) / 2,
          y: (stageSize.height - img.height * autoScale) / 2
        });
      };
      img.src = currentImage;
    }
  }, [currentImage, stageSize]);

  // Load layer images when layers change
  useEffect(() => {
    const loadLayerImages = async () => {
      const newLayerImages: {[key: string]: HTMLImageElement} = {};

      for (const layer of layers) {
        if (layer.imageData) {
          // Convert ImageData to canvas then to image
          const canvas = document.createElement('canvas');
          canvas.width = layer.imageData.width;
          canvas.height = layer.imageData.height;
          const ctx = canvas.getContext('2d')!;
          ctx.putImageData(layer.imageData, 0, 0);

          const img = new window.Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = canvas.toDataURL();
          });
          newLayerImages[layer.id] = img;
        } else if (layer.thumbnail && layer.id !== 'background') {
          const img = new window.Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = layer.thumbnail;
          });
          newLayerImages[layer.id] = img;
        }
      }

      setLayerImages(newLayerImages);
    };

    loadLayerImages();
  }, [layers]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleStageClick = async (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || !image || !stageRef.current) return;

    // Adjust click position for scale and offset
    const adjustedPos = {
      x: Math.round((pos.x - position.x) / scale),
      y: Math.round((pos.y - position.y) / scale)
    };

    // Ensure position is within bounds
    adjustedPos.x = Math.max(0, Math.min(adjustedPos.x, image.width - 1));
    adjustedPos.y = Math.max(0, Math.min(adjustedPos.y, image.height - 1));

    if (selectedTool === 'sam2-segment') {
      // Add point for SAM2 segmentation
      const isShiftPressed = e.evt.shiftKey;
      const pointType = isShiftPressed ? 'negative' : 'positive';

      setSamPoints(prev => [...prev, {
        x: adjustedPos.x,
        y: adjustedPos.y,
        type: pointType
      }]);

      toast.info(`Added ${pointType} point. ${isShiftPressed ? 'Shift+' : ''}Click to add points, then run segmentation.`);

    } else if (selectedTool === 'sam2-run') {
      if (samPoints.length === 0) {
        toast.error('Please add some points first by using the SAM2 Segment tool.');
        return;
      }

      console.log('Running SAM2 segmentation with points:', samPoints);

      // Set processing state
      setProcessing(true, 'Segmenting with SAM2...');
      toast.info('Running SAM2 segmentation...');

      try {
        // Get image data from canvas
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Import segmentation service
        const { segmentationService } = await import('@/services/aiService');

        // Perform segmentation with multiple points
        const positivePoints = samPoints.filter(p => p.type === 'positive');
        const negativePoints = samPoints.filter(p => p.type === 'negative');

        const maskData = await segmentationService.segmentWithSAM2(
          imageData,
          positivePoints[0], // Use first positive point as primary
          {
            threshold: 0.15,
            dilate: 3,
            includeEdges: true,
            positivePoints,
            negativePoints
          }
        );

        // Store mask for future use
        setMask(maskData);

        // Create segmented layer (selected area)
        const segmentCanvas = document.createElement('canvas');
        segmentCanvas.width = image.width;
        segmentCanvas.height = image.height;
        const segmentCtx = segmentCanvas.getContext('2d')!;

        // Draw original image
        segmentCtx.drawImage(image, 0, 0);

        // Apply mask to create transparency
        const segmentImageData = segmentCtx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < maskData.data.length; i += 4) {
          if (maskData.data[i] === 0) { // Black pixels in mask = transparent
            segmentImageData.data[i * 4 + 3] = 0; // Set alpha to 0
          }
        }
        segmentCtx.putImageData(segmentImageData, 0, 0);

        // Create background layer (everything except selected)
        const backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.width = image.width;
        backgroundCanvas.height = image.height;
        const backgroundCtx = backgroundCanvas.getContext('2d')!;

        // Draw original image
        backgroundCtx.drawImage(image, 0, 0);

        // Apply inverted mask
        const backgroundImageData = backgroundCtx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < maskData.data.length; i += 4) {
          if (maskData.data[i] > 0) { // White pixels in mask = transparent in background
            backgroundImageData.data[i * 4 + 3] = 0; // Set alpha to 0
          }
        }
        backgroundCtx.putImageData(backgroundImageData, 0, 0);

        // Convert to ImageData for storage
        const segmentData = segmentCtx.getImageData(0, 0, image.width, image.height);
        const backgroundData = backgroundCtx.getImageData(0, 0, image.width, image.height);

        // Remove background layer and add new separated layers
        const bgLayer = layers.find(l => l.id === 'background');
        if (bgLayer) {
          removeLayer('background');
        }

        // Add background layer (everything except selection)
        addLayer({
          name: 'Background (Unselected)',
          thumbnail: backgroundCanvas.toDataURL(),
          imageData: backgroundData
        });

        // Add segmented layer (selection)
        addLayer({
          name: 'Selected Object',
          thumbnail: segmentCanvas.toDataURL(),
          imageData: segmentData
        });

        // Clear points after successful segmentation
        setSamPoints([]);

        toast.success('Object segmented and separated into layers!');
        console.log('SAM2 segmentation completed');

      } catch (error) {
        console.error('SAM2 segmentation failed:', error);
        toast.error('Segmentation failed. Please try again.');
      } finally {
        setProcessing(false);
      }
    }
  };

  const clearSamPoints = () => {
    setSamPoints([]);
    toast.info('Cleared all SAM2 points');
  };

  return (
    <div className="canvas-container h-full relative bg-canvas-bg overflow-hidden">
      {/* Canvas Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-10 flex gap-2"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomOut}
          className="bg-panel-bg/80 backdrop-blur-sm border-panel-border hover:shadow-glow-accent"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomIn}
          className="bg-panel-bg/80 backdrop-blur-sm border-panel-border hover:shadow-glow-accent"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="bg-panel-bg/80 backdrop-blur-sm border-panel-border hover:shadow-glow-accent"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        {samPoints.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={clearSamPoints}
            className="bg-panel-bg/80 backdrop-blur-sm border-panel-border hover:shadow-glow-accent"
          >
            Clear Points ({samPoints.length})
          </Button>
        )}
      </motion.div>

      {/* Zoom Level Indicator */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-4 left-4 z-10 bg-panel-bg/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-panel-border"
      >
        <span className="text-sm text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
      </motion.div>

      {/* Canvas Stage */}
      <div className="absolute inset-4 rounded-lg overflow-hidden border border-panel-border">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={selectedTool === 'select'}
          onClick={handleStageClick}
          onDragEnd={(e) => {
            setPosition({
              x: e.target.x(),
              y: e.target.y()
            });
          }}
        >
          <Layer>
            {/* Background */}
            <Rect
              width={stageSize.width / scale}
              height={stageSize.height / scale}
              x={-position.x / scale}
              y={-position.y / scale}
              fill="rgba(255,255,255,0.05)"
            />

            {/* Render Layers in Order */}
            {layers.map((layer) => {
              if (!layer.visible) return null;

              if (layer.id === 'background' && image) {
                return (
                  <KonvaImage
                    key={layer.id}
                    image={image}
                    width={image.width}
                    height={image.height}
                    opacity={layer.opacity / 100}
                    globalCompositeOperation={layer.blendMode as GlobalCompositeOperation}
                  />
                );
              }

              const layerImage = layerImages[layer.id];
              if (layerImage) {
                return (
                  <KonvaImage
                    key={layer.id}
                    image={layerImage}
                    width={layerImage.width}
                    height={layerImage.height}
                    opacity={layer.opacity / 100}
                    globalCompositeOperation={layer.blendMode as GlobalCompositeOperation}
                  />
                );
              }

              return null;
            })}

            {/* SAM2 Points Overlay */}
            {samPoints.map((point, index) => (
              <Circle
                key={index}
                x={point.x}
                y={point.y}
                radius={8}
                fill={point.type === 'positive' ? '#10B981' : '#EF4444'}
                stroke={point.type === 'positive' ? '#059669' : '#DC2626'}
                strokeWidth={2}
                opacity={0.8}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Empty State */}
      {!currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-primary/20 flex items-center justify-center">
              <Move className="w-12 h-12 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
              No Image Loaded
            </h3>
            <p className="text-muted-foreground">
              Upload an image to start editing with AI tools
            </p>
          </div>
        </motion.div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20"
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-primary">Processing with AI...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        </motion.div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';