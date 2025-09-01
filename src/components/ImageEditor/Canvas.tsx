import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
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
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { setProcessing, setMask, addLayer } = useEditorStore();

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

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleStageClick = async (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool === 'sam2-segment') {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos && image && stageRef.current) {
        console.log('SAM2 segmentation at:', pos);
        
        // Set processing state
        setProcessing(true, 'Segmenting with SAM2...');
        toast.info('Starting SAM2 segmentation...');
        
        try {
          // Get image data from canvas
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Adjust click position for scale and offset
          const adjustedPos = {
            x: Math.round((pos.x - position.x) / scale),
            y: Math.round((pos.y - position.y) / scale)
          };
          
          // Ensure position is within bounds
          adjustedPos.x = Math.max(0, Math.min(adjustedPos.x, image.width - 1));
          adjustedPos.y = Math.max(0, Math.min(adjustedPos.y, image.height - 1));
          
          // Import segmentation service
          const { segmentationService } = await import('@/services/aiService');
          
          // Perform segmentation
          const maskData = await segmentationService.segmentWithSAM2(imageData, adjustedPos, {
            threshold: 0.15,
            dilate: 3,
            includeEdges: true
          });
          
          // Store mask for future use
          setMask(maskData);
          
          // Create mask overlay and add as layer
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = maskData.width;
          maskCanvas.height = maskData.height;
          const maskCtx = maskCanvas.getContext('2d')!;
          maskCtx.putImageData(maskData, 0, 0);
          
          // Add as new layer
          addLayer({
            name: 'SAM2 Mask',
            thumbnail: maskCanvas.toDataURL(),
            imageData: maskData
          });
          
          toast.success('Object segmented successfully!');
          console.log('SAM2 segmentation completed');
          
        } catch (error) {
          console.error('SAM2 segmentation failed:', error);
          toast.error('Segmentation failed. Please try again.');
        } finally {
          setProcessing(false);
        }
      }
    }
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
            
            {/* Main Image */}
            {image && (
              <KonvaImage
                image={image}
                width={image.width}
                height={image.height}
              />
            )}
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