import { create } from 'zustand';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  thumbnail?: string;
  imageData?: ImageData;
}

export interface EditorStore {
  // Image state
  currentImage: string | null;
  originalImage: string | null;
  
  // Layers
  layers: Layer[];
  activeLayerId: string | null;
  
  // Tools
  selectedTool: string;
  brushSize: number;
  
  // Selection and masks
  currentMask: ImageData | null;
  selection: { x: number; y: number; width: number; height: number } | null;
  
  // Processing
  isProcessing: boolean;
  processingMessage: string;
  
  // API Configuration
  apiKeys: {
    replicate?: string;
    deepinfra?: string;
  };
  
  // Actions
  setCurrentImage: (image: string | null) => void;
  setSelectedTool: (tool: string) => void;
  setBrushSize: (size: number) => void;
  setMask: (mask: ImageData | null) => void;
  setSelection: (selection: { x: number; y: number; width: number; height: number } | null) => void;
  setProcessing: (isProcessing: boolean, message?: string) => void;
  setAPIKeys: (keys: { replicate?: string; deepinfra?: string }) => void;
  
  // Layer actions
  addLayer: (layer: Partial<Layer>) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  setActiveLayer: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;
  moveLayer: (layerId: string, direction: 'up' | 'down') => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  currentImage: null,
  originalImage: null,
  layers: [],
  activeLayerId: null,
  selectedTool: 'select',
  brushSize: 10,
  currentMask: null,
  selection: null,
  isProcessing: false,
  processingMessage: '',
  apiKeys: {},

  // Actions
  setCurrentImage: (image) => {
    set({ currentImage: image, originalImage: image });
    if (image) {
      // Create initial layer
      const initialLayer: Layer = {
        id: 'background',
        name: 'Background',
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal'
      };
      set({ layers: [initialLayer], activeLayerId: 'background' });
    }
  },
  
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setBrushSize: (size) => set({ brushSize: size }),
  setMask: (mask) => set({ currentMask: mask }),
  setSelection: (selection) => set({ selection }),
  setProcessing: (isProcessing, message = '') => 
    set({ isProcessing, processingMessage: message }),
  setAPIKeys: (keys) => set({ apiKeys: { ...get().apiKeys, ...keys } }),

  // Layer actions
  addLayer: (layerData) => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name: `Layer ${get().layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      ...layerData
    };
    set({ 
      layers: [...get().layers, newLayer],
      activeLayerId: newLayer.id 
    });
  },

  removeLayer: (layerId) => {
    const { layers, activeLayerId } = get();
    const newLayers = layers.filter(l => l.id !== layerId);
    const newActiveId = activeLayerId === layerId 
      ? (newLayers[0]?.id || null) 
      : activeLayerId;
    set({ layers: newLayers, activeLayerId: newActiveId });
  },

  updateLayer: (layerId, updates) => {
    set({
      layers: get().layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    });
  },

  setActiveLayer: (layerId) => set({ activeLayerId: layerId }),

  duplicateLayer: (layerId) => {
    const layer = get().layers.find(l => l.id === layerId);
    if (layer) {
      const duplicated = {
        ...layer,
        id: crypto.randomUUID(),
        name: `${layer.name} Copy`
      };
      set({ layers: [...get().layers, duplicated] });
    }
  },

  moveLayer: (layerId, direction) => {
    const { layers } = get();
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= layers.length) return;

    const newLayers = [...layers];
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    set({ layers: newLayers });
  }
}));