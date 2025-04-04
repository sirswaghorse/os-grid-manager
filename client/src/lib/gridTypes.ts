// Region size options
export const regionSizes = [
  { label: "256x256 (Normal)", value: 256 },
  { label: "512x512 (Homestead)", value: 512 },
  { label: "1024x1024 (Full)", value: 1024 },
  { label: "2048x2048 (Mega)", value: 2048 },
];

// Region template options
export const regionTemplates = [
  { label: "Empty (Flat Terrain)", value: "empty" },
  { label: "Sandbox", value: "sandbox" },
  { label: "Welcome Area", value: "welcome" },
  { label: "Water World", value: "water" },
  { label: "Mountains", value: "mountains" },
];

// Status badge colors
export type StatusType = "online" | "offline" | "restarting" | "error";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800";
    case "offline":
      return "bg-gray-100 text-gray-800";
    case "restarting":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Grid map constants
export const GRID_SIZE = 10; // 10x10 grid
export const CELL_SIZE = 256; // Each cell represents 256x256 units

// Calculate pixel position from OpenSim coordinates
export const calcPosition = (pos: number, total: number) => {
  return (pos / (GRID_SIZE * CELL_SIZE)) * total;
};

// Calculate size based on the region size
export const calcSize = (size: number, total: number) => {
  return (size / (GRID_SIZE * CELL_SIZE)) * total;
};

// Generate next available port for a new region
export const getNextAvailablePort = (existingPorts: number[]) => {
  const startPort = 9000;
  const maxPort = 9100;
  
  for (let port = startPort; port <= maxPort; port++) {
    if (!existingPorts.includes(port)) {
      return port;
    }
  }
  
  return startPort; // Default fallback
};
