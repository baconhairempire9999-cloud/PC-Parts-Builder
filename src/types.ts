export type PartCategory = 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooler';

export interface PCPart {
  id: string;
  name: string;
  category: PartCategory;
  brand: string;
  price: number;
  power: number; // in Watts
  specs: {
    socket?: string; // AM4, AM5, LGA1700
    ramType?: string; // DDR4, DDR5
    formFactor?: string; // ATX, Micro-ATX, Mini-ITX
    size?: string; // dimensions or capacity description (e.g., "32GB (2x16GB)", "2TB")
    maxGpuLength?: number; // for cases, in mm
    gpuLength?: number; // for GPUs, in mm
    wattage?: number; // for PSUs, in Watts
    modular?: string; // for PSUs (Full, Semi, No)
    speed?: string; // e.g., "6000 MHz", "7200 MB/s"
    rating?: string; // for PSUs (e.g., "80+ Gold")
  };
}

export interface CompatibilityCheck {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface PresetBuild {
  id: string;
  name: string;
  description: string;
  targetBudget: number;
  parts: Record<PartCategory, string>; // mapping category -> part ID
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
