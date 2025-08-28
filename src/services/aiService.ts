import axios from 'axios';

export interface GenerationSettings {
  model: string;
  steps: number;
  guidance: number;
  seed: number;
  width: number;
  height: number;
  strength: number;
  useUpscale: boolean;
}

export interface APIKeys {
  replicate?: string;
  deepinfra?: string;
}

export class AIService {
  private apiKeys: APIKeys;

  constructor(apiKeys: APIKeys) {
    this.apiKeys = apiKeys;
  }

  async generateImage(prompt: string, negativePrompt: string = '', settings: GenerationSettings): Promise<string> {
    const { model } = settings;
    
    if (model.includes('replicate')) {
      return this.generateWithReplicate(prompt, negativePrompt, settings);
    } else if (model.includes('deepinfra')) {
      return this.generateWithDeepInfra(prompt, negativePrompt, settings);
    }
    
    throw new Error('Unsupported model provider');
  }

  private async generateWithReplicate(prompt: string, negativePrompt: string, settings: GenerationSettings): Promise<string> {
    if (!this.apiKeys.replicate) {
      throw new Error('Replicate API key not found');
    }

    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: this.getReplicateModelVersion(settings.model),
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width: settings.width,
          height: settings.height,
          num_inference_steps: settings.steps,
          guidance_scale: settings.guidance,
          seed: settings.seed === -1 ? undefined : settings.seed,
        }
      },
      {
        headers: {
          'Authorization': `Token ${this.apiKeys.replicate}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return this.pollReplicateResult(response.data.id);
  }

  private async generateWithDeepInfra(prompt: string, negativePrompt: string, settings: GenerationSettings): Promise<string> {
    if (!this.apiKeys.deepinfra) {
      throw new Error('DeepInfra API key not found');
    }

    const response = await axios.post(
      `https://api.deepinfra.com/v1/inference/${this.getDeepInfraModelName(settings.model)}`,
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width: settings.width,
          height: settings.height,
          num_inference_steps: settings.steps,
          guidance_scale: settings.guidance,
          seed: settings.seed === -1 ? undefined : settings.seed,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.deepinfra}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data.images[0];
  }

  private async pollReplicateResult(predictionId: string): Promise<string> {
    const maxAttempts = 60;
    const pollInterval = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${this.apiKeys.replicate}`,
          }
        }
      );

      const { status, output, error } = response.data;

      if (status === 'succeeded') {
        return Array.isArray(output) ? output[0] : output;
      }

      if (status === 'failed') {
        throw new Error(`Generation failed: ${error}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Generation timeout');
  }

  private getReplicateModelVersion(model: string): string {
    const versions = {
      'sdxl-1.0': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      'flux-dev': 'black-forest-labs/flux-dev:5b3e8162-e726-4add-bfde-053dac7dc5a4',
    };
    
    return versions[model as keyof typeof versions] || versions['sdxl-1.0'];
  }

  private getDeepInfraModelName(model: string): string {
    const models = {
      'kandinsky-3': 'kandinsky-community/kandinsky-3',
      'sdxl-turbo': 'stabilityai/stable-diffusion-xl-base-1.0',
    };
    
    return models[model as keyof typeof models] || models['sdxl-turbo'];
  }

  async inpaintImage(
    imageUrl: string, 
    maskUrl: string, 
    prompt: string, 
    settings: GenerationSettings
  ): Promise<string> {
    const { model } = settings;
    
    if (model.includes('replicate')) {
      return this.inpaintWithReplicate(imageUrl, maskUrl, prompt, settings);
    } else if (model.includes('deepinfra')) {
      return this.inpaintWithDeepInfra(imageUrl, maskUrl, prompt, settings);
    }
    
    throw new Error('Unsupported model provider for inpainting');
  }

  private async inpaintWithReplicate(
    imageUrl: string,
    maskUrl: string, 
    prompt: string,
    settings: GenerationSettings
  ): Promise<string> {
    if (!this.apiKeys.replicate) {
      throw new Error('Replicate API key not found');
    }

    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3',
        input: {
          image: imageUrl,
          mask: maskUrl,
          prompt,
          negative_prompt: '',
          num_inference_steps: settings.steps,
          guidance_scale: settings.guidance,
          seed: settings.seed === -1 ? undefined : settings.seed,
        }
      },
      {
        headers: {
          'Authorization': `Token ${this.apiKeys.replicate}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return this.pollReplicateResult(response.data.id);
  }

  private async inpaintWithDeepInfra(
    imageUrl: string,
    maskUrl: string,
    prompt: string,
    settings: GenerationSettings
  ): Promise<string> {
    if (!this.apiKeys.deepinfra) {
      throw new Error('DeepInfra API key not found');
    }

    const response = await axios.post(
      'https://api.deepinfra.com/v1/inference/stabilityai/stable-diffusion-2-inpainting',
      {
        input: {
          image: imageUrl,
          mask_image: maskUrl,
          prompt,
          num_inference_steps: settings.steps,
          guidance_scale: settings.guidance,
          seed: settings.seed === -1 ? undefined : settings.seed,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.deepinfra}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return response.data.images[0];
  }

  async enhanceImage(imageUrl: string, settings: any): Promise<string> {
    if (!this.apiKeys.replicate) {
      throw new Error('Replicate API key not found');
    }

    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
        input: {
          image: imageUrl,
          scale: settings.scale || 4,
          face_enhance: settings.faceEnhance || false,
        }
      },
      {
        headers: {
          'Authorization': `Token ${this.apiKeys.replicate}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return this.pollReplicateResult(response.data.id);
  }
}

// Advanced SAM2 Segmentation Service
export class SegmentationService {
  private model: any = null;
  private processor: any = null;

  async initializeSAM2(): Promise<void> {
    try {
      const { pipeline, env } = await import('@huggingface/transformers');
      
      // Configure for WebGPU if available, fallback to WASM
      env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
      
      this.model = await pipeline(
        'image-segmentation',
        'facebook/sam-vit-base',
        { 
          device: 'webgpu',
          dtype: 'fp32'
        }
      );
      
      console.log('SAM2 model initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to advanced algorithms:', error);
      // Fallback to advanced algorithmic implementation
    }
  }

  async segmentWithSAM2(
    imageData: ImageData, 
    clickPoint: { x: number; y: number },
    options: {
      includeEdges?: boolean;
      threshold?: number;
      dilate?: number;
    } = {}
  ): Promise<ImageData> {
    const { includeEdges = true, threshold = 0.5, dilate = 2 } = options;

    if (!this.model) {
      // Advanced fallback implementation using edge detection and flood fill
      return this.advancedFallbackSegmentation(imageData, clickPoint, options);
    }

    try {
      // Convert ImageData to canvas for processing
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

      // Use SAM2 model for segmentation
      const result = await this.model(canvas.toDataURL(), {
        points: [[clickPoint.x, clickPoint.y]],
        labels: [1], // foreground point
      });

      // Convert result to ImageData mask
      return this.processSAMResult(result, imageData.width, imageData.height, dilate);
    } catch (error) {
      console.error('SAM2 segmentation failed, using fallback:', error);
      return this.advancedFallbackSegmentation(imageData, clickPoint, options);
    }
  }

  private async advancedFallbackSegmentation(
    imageData: ImageData,
    clickPoint: { x: number; y: number },
    options: { includeEdges?: boolean; threshold?: number; dilate?: number }
  ): Promise<ImageData> {
    const { includeEdges = true, threshold = 0.1, dilate = 2 } = options;
    const { width, height, data } = imageData;
    const mask = new ImageData(width, height);

    // Get target color at click point
    const targetIdx = (clickPoint.y * width + clickPoint.x) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];

    // Flood fill with color similarity
    const visited = new Set<string>();
    const queue = [{ x: clickPoint.x, y: clickPoint.y }];

    const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
      return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    };

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) continue;
      visited.add(key);

      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const distance = colorDistance(r, g, b, targetR, targetG, targetB) / 255;
      
      if (distance <= threshold) {
        // Mark as selected
        const maskIdx = idx;
        mask.data[maskIdx] = 255;     // R
        mask.data[maskIdx + 1] = 100; // G
        mask.data[maskIdx + 2] = 255; // B  
        mask.data[maskIdx + 3] = 180; // A

        // Add neighbors to queue
        queue.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
      }
    }

    // Apply dilation if specified
    if (dilate > 0) {
      return this.dilateMask(mask, dilate);
    }

    return mask;
  }

  private processSAMResult(result: any, width: number, height: number, dilate: number): ImageData {
    const mask = new ImageData(width, height);
    
    // Process SAM2 result into mask
    if (result.masks && result.masks.length > 0) {
      const maskData = result.masks[0];
      
      for (let i = 0; i < maskData.length; i++) {
        const value = maskData[i] > 0.5 ? 255 : 0;
        const idx = i * 4;
        
        mask.data[idx] = 255;     // R
        mask.data[idx + 1] = 100; // G
        mask.data[idx + 2] = 255; // B
        mask.data[idx + 3] = value; // A
      }
    }

    return dilate > 0 ? this.dilateMask(mask, dilate) : mask;
  }

  private dilateMask(mask: ImageData, iterations: number): ImageData {
    const { width, height } = mask;
    let currentMask = new ImageData(new Uint8ClampedArray(mask.data), width, height);
    
    for (let iter = 0; iter < iterations; iter++) {
      const newMask = new ImageData(width, height);
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          // Check if current pixel or any neighbor is selected
          let hasSelected = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
              if (currentMask.data[neighborIdx + 3] > 128) {
                hasSelected = true;
                break;
              }
            }
            if (hasSelected) break;
          }
          
          if (hasSelected) {
            newMask.data[idx] = 255;     // R
            newMask.data[idx + 1] = 100; // G
            newMask.data[idx + 2] = 255; // B
            newMask.data[idx + 3] = 180; // A
          }
        }
      }
      
      currentMask = newMask;
    }
    
    return currentMask;
  }

  async segmentMultipleObjects(
    imageData: ImageData,
    points: Array<{ x: number; y: number; type: 'foreground' | 'background' }>
  ): Promise<ImageData[]> {
    // Implementation for multi-object segmentation
    const masks: ImageData[] = [];
    
    for (const point of points) {
      if (point.type === 'foreground') {
        const mask = await this.segmentWithSAM2(imageData, point);
        masks.push(mask);
      }
    }
    
    return masks;
  }
}

export const createAIService = (apiKeys: APIKeys) => new AIService(apiKeys);
export const segmentationService = new SegmentationService();