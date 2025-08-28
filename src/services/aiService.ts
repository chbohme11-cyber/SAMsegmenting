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
    // Inpainting implementation
    throw new Error('Inpainting not yet implemented');
  }

  async enhanceImage(imageUrl: string, settings: any): Promise<string> {
    // Enhancement implementation
    throw new Error('Enhancement not yet implemented');
  }
}

// SAM2 Segmentation Service
export class SegmentationService {
  async segmentWithSAM2(imageData: ImageData, clickPoint: { x: number; y: number }): Promise<ImageData> {
    // SAM2 segmentation implementation would go here
    // For now, return a mock mask
    const mask = new ImageData(imageData.width, imageData.height);
    
    // Create a simple circular mask around click point for demo
    const centerX = clickPoint.x;
    const centerY = clickPoint.y;
    const radius = 50;
    
    for (let y = 0; y < mask.height; y++) {
      for (let x = 0; x < mask.width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const alpha = distance < radius ? 255 : 0;
        const idx = (y * mask.width + x) * 4;
        
        mask.data[idx] = 255;     // R
        mask.data[idx + 1] = 0;   // G  
        mask.data[idx + 2] = 0;   // B
        mask.data[idx + 3] = alpha; // A
      }
    }
    
    return mask;
  }
}

export const createAIService = (apiKeys: APIKeys) => new AIService(apiKeys);
export const segmentationService = new SegmentationService();