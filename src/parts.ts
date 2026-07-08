import { PCPart, PresetBuild } from './types';

export const PC_PARTS: PCPart[] = [
  // --- CPUs ---
  {
    id: 'cpu-ryzen-5600x',
    name: 'AMD Ryzen 5 5600X',
    category: 'cpu',
    brand: 'AMD',
    price: 129.99,
    power: 65,
    specs: { socket: 'AM4', speed: '3.7 GHz (4.6 GHz Boost)', size: '6 Cores / 12 Threads' }
  },
  {
    id: 'cpu-ryzen-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    category: 'cpu',
    brand: 'AMD',
    price: 379.99,
    power: 120,
    specs: { socket: 'AM5', speed: '4.2 GHz (5.0 GHz Boost)', size: '8 Cores / 16 Threads' }
  },
  {
    id: 'cpu-intel-13600k',
    name: 'Intel Core i5-13600K',
    category: 'cpu',
    brand: 'Intel',
    price: 269.99,
    power: 125,
    specs: { socket: 'LGA1700', speed: '3.5 GHz (5.1 GHz Boost)', size: '14 Cores / 20 Threads' }
  },
  {
    id: 'cpu-intel-14900k',
    name: 'Intel Core i9-14900K',
    category: 'cpu',
    brand: 'Intel',
    price: 529.99,
    power: 125,
    specs: { socket: 'LGA1700', speed: '3.2 GHz (6.0 GHz Boost)', size: '24 Cores / 32 Threads' }
  },

  // --- Motherboards ---
  {
    id: 'mobo-msi-b550',
    name: 'MSI MAG B550 TOMAHAWK MAX WIFI',
    category: 'motherboard',
    brand: 'MSI',
    price: 149.99,
    power: 45,
    specs: { socket: 'AM4', ramType: 'DDR4', formFactor: 'ATX' }
  },
  {
    id: 'mobo-asus-b650',
    name: 'ASUS ROG STRIX B650-A GAMING WIFI',
    category: 'motherboard',
    brand: 'ASUS',
    price: 219.99,
    power: 50,
    specs: { socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX' }
  },
  {
    id: 'mobo-gigabyte-z790',
    name: 'Gigabyte Z790 AORUS ELITE AX',
    category: 'motherboard',
    brand: 'Gigabyte',
    price: 229.99,
    power: 55,
    specs: { socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX' }
  },
  {
    id: 'mobo-asus-z790-itx',
    name: 'ASUS ROG STRIX Z790-I GAMING WIFI',
    category: 'motherboard',
    brand: 'ASUS',
    price: 289.99,
    power: 40,
    specs: { socket: 'LGA1700', ramType: 'DDR5', formFactor: 'Mini-ITX' }
  },

  // --- GPUs ---
  {
    id: 'gpu-rtx-4060',
    name: 'NVIDIA GeForce RTX 4060',
    category: 'gpu',
    brand: 'NVIDIA',
    price: 299.99,
    power: 115,
    specs: { gpuLength: 240, speed: '8GB GDDR6' }
  },
  {
    id: 'gpu-rtx-4070-super',
    name: 'NVIDIA GeForce RTX 4070 Super',
    category: 'gpu',
    brand: 'NVIDIA',
    price: 589.99,
    power: 220,
    specs: { gpuLength: 267, speed: '12GB GDDR6X' }
  },
  {
    id: 'gpu-rx-7800xt',
    name: 'AMD Radeon RX 7800 XT',
    category: 'gpu',
    brand: 'AMD',
    price: 489.99,
    power: 263,
    specs: { gpuLength: 267, speed: '16GB GDDR6' }
  },
  {
    id: 'gpu-rtx-4090',
    name: 'NVIDIA GeForce RTX 4090 Gaming OC',
    category: 'gpu',
    brand: 'NVIDIA',
    price: 1599.99,
    power: 450,
    specs: { gpuLength: 336, speed: '24GB GDDR6X' }
  },

  // --- RAM ---
  {
    id: 'ram-ripjaws-ddr4',
    name: 'G.Skill Ripjaws V 16GB (2 x 8GB)',
    category: 'ram',
    brand: 'G.Skill',
    price: 42.99,
    power: 8,
    specs: { ramType: 'DDR4', speed: '3200 MHz', size: '16GB (2x8GB)' }
  },
  {
    id: 'ram-vengeance-ddr5',
    name: 'Corsair Vengeance 32GB (2 x 16GB)',
    category: 'ram',
    brand: 'Corsair',
    price: 109.99,
    power: 12,
    specs: { ramType: 'DDR5', speed: '6000 MHz', size: '32GB (2x16GB)' }
  },
  {
    id: 'ram-dominator-ddr5',
    name: 'Corsair Dominator Titanium 64GB (2 x 32GB)',
    category: 'ram',
    brand: 'Corsair',
    price: 239.99,
    power: 15,
    specs: { ramType: 'DDR5', speed: '6000 MHz', size: '64GB (2x32GB)' }
  },

  // --- Storage ---
  {
    id: 'storage-p3-1tb',
    name: 'Crucial P3 Plus 1TB PCIe M.2 SSD',
    category: 'storage',
    brand: 'Crucial',
    price: 69.99,
    power: 5,
    specs: { speed: '5000 MB/s Read', size: '1TB' }
  },
  {
    id: 'storage-990pro-2tb',
    name: 'Samsung 990 Pro 2TB PCIe Gen4 M.2 NVMe',
    category: 'storage',
    brand: 'Samsung',
    price: 169.99,
    power: 6,
    specs: { speed: '7450 MB/s Read', size: '2TB' }
  },
  {
    id: 'storage-barracuda-2tb',
    name: 'Seagate BarraCuda 2TB 3.5" HDD',
    category: 'storage',
    brand: 'Seagate',
    price: 59.99,
    power: 10,
    specs: { speed: '7200 RPM', size: '2TB' }
  },

  // --- Cases ---
  {
    id: 'case-h5-flow',
    name: 'NZXT H5 Flow',
    category: 'case',
    brand: 'NZXT',
    price: 94.99,
    power: 0,
    specs: { formFactor: 'ATX', maxGpuLength: 365, size: 'Mid Tower' }
  },
  {
    id: 'case-corsair-4000d',
    name: 'Corsair 4000D Airflow',
    category: 'case',
    brand: 'Corsair',
    price: 104.99,
    power: 0,
    specs: { formFactor: 'ATX', maxGpuLength: 360, size: 'Mid Tower' }
  },
  {
    id: 'case-lianli-o11',
    name: 'Lian Li O11 Dynamic EVO',
    category: 'case',
    brand: 'Lian Li',
    price: 159.99,
    power: 0,
    specs: { formFactor: 'ATX', maxGpuLength: 426, size: 'Mid Tower Dual Chamber' }
  },
  {
    id: 'case-nr200p',
    name: 'Cooler Master MasterBox NR200P',
    category: 'case',
    brand: 'Cooler Master',
    price: 109.99,
    power: 0,
    specs: { formFactor: 'Mini-ITX', maxGpuLength: 330, size: 'Small Form Factor (SFF)' }
  },

  // --- Power Supplies ---
  {
    id: 'psu-corsair-cx650m',
    name: 'Corsair CX650M 650W',
    category: 'psu',
    brand: 'Corsair',
    price: 79.99,
    power: 0,
    specs: { wattage: 650, rating: '80+ Bronze', modular: 'Semi-Modular', formFactor: 'ATX' }
  },
  {
    id: 'psu-corsair-rm750e',
    name: 'Corsair RM750e 750W',
    category: 'psu',
    brand: 'Corsair',
    price: 99.99,
    power: 0,
    specs: { wattage: 750, rating: '80+ Gold', modular: 'Full-Modular', formFactor: 'ATX' }
  },
  {
    id: 'psu-evga-850g',
    name: 'EVGA SuperNOVA 850G GT',
    category: 'psu',
    brand: 'EVGA',
    price: 129.99,
    power: 0,
    specs: { wattage: 850, rating: '80+ Gold', modular: 'Full-Modular', formFactor: 'ATX' }
  },
  {
    id: 'psu-corsair-sf750',
    name: 'Corsair SF750 750W Platinum',
    category: 'psu',
    brand: 'Corsair',
    price: 179.99,
    power: 0,
    specs: { wattage: 750, rating: '80+ Platinum', modular: 'Full-Modular', formFactor: 'SFX' }
  },

  // --- Coolers ---
  {
    id: 'cooler-peerless-assassin',
    name: 'Thermalright Peerless Assassin 120 SE',
    category: 'cooler',
    brand: 'Thermalright',
    price: 34.99,
    power: 5,
    specs: { socket: 'AM4 / AM5 / LGA1700', size: 'Dual Tower Air Cooler' }
  },
  {
    id: 'cooler-noctua-nhd15',
    name: 'Noctua NH-D15 chromax.black',
    category: 'cooler',
    brand: 'Noctua',
    price: 119.95,
    power: 8,
    specs: { socket: 'AM4 / AM5 / LGA1700', size: 'Premium Air Cooler' }
  },
  {
    id: 'cooler-kraken-360',
    name: 'NZXT Kraken 360 Liquid Cooler',
    category: 'cooler',
    brand: 'NZXT',
    price: 179.99,
    power: 15,
    specs: { socket: 'AM4 / AM5 / LGA1700', size: '360mm AIO Liquid Cooler' }
  }
];

export const PRESET_BUILDS: PresetBuild[] = [
  {
    id: 'preset-budget-gaming',
    name: 'Budget AMD Gaming Build',
    description: 'An excellent 1080p/1440p entry-level gaming setup using AM4 and DDR4, keeping costs efficient.',
    targetBudget: 1000,
    parts: {
      cpu: 'cpu-ryzen-5600x',
      motherboard: 'mobo-msi-b550',
      gpu: 'gpu-rtx-4060',
      ram: 'ram-ripjaws-ddr4',
      storage: 'storage-p3-1tb',
      case: 'case-h5-flow',
      psu: 'psu-corsair-cx650m',
      cooler: 'cooler-peerless-assassin'
    }
  },
  {
    id: 'preset-midrange-powerhouse',
    name: 'Midrange Performance King',
    description: 'A stellar AM5 + DDR5 build configured for fast 1440p gaming and rendering workloads with solid headroom.',
    targetBudget: 1800,
    parts: {
      cpu: 'cpu-ryzen-7800x3d',
      motherboard: 'mobo-asus-b650',
      gpu: 'gpu-rtx-4070-super',
      ram: 'ram-vengeance-ddr5',
      storage: 'storage-990pro-2tb',
      case: 'case-corsair-4000d',
      psu: 'psu-corsair-rm750e',
      cooler: 'cooler-peerless-assassin'
    }
  },
  {
    id: 'preset-sff-enthusiast',
    name: 'Small Form Factor (SFF) Build',
    description: 'A premium, compact, and powerful Intel-based build packed into a Mini-ITX case without compromising thermal efficiency.',
    targetBudget: 2200,
    parts: {
      cpu: 'cpu-intel-13600k',
      motherboard: 'mobo-asus-z790-itx',
      gpu: 'gpu-rx-7800xt',
      ram: 'ram-vengeance-ddr5',
      storage: 'storage-990pro-2tb',
      case: 'case-nr200p',
      psu: 'psu-corsair-sf750',
      cooler: 'cooler-noctua-nhd15'
    }
  }
];
