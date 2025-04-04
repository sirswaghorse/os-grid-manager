import { apiRequest } from "@/lib/queryClient";
import { Grid, Region } from "@shared/schema";

// OpenSimulator grid management functions
export const startGrid = async (gridId: number): Promise<Grid> => {
  const response = await apiRequest("POST", `/api/grids/${gridId}/start`, {});
  return response.json();
};

export const stopGrid = async (gridId: number): Promise<Grid> => {
  const response = await apiRequest("POST", `/api/grids/${gridId}/stop`, {});
  return response.json();
};

export const restartGrid = async (gridId: number): Promise<Grid> => {
  const response = await apiRequest("POST", `/api/grids/${gridId}/stop`, {});
  await response.json();
  
  // Wait a short period before starting
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const startResponse = await apiRequest("POST", `/api/grids/${gridId}/start`, {});
  return startResponse.json();
};

// Region management functions
export const restartRegion = async (regionId: number): Promise<void> => {
  await apiRequest("POST", `/api/regions/${regionId}/restart`, {});
};

// One-click grid setup function
export const setupNewGrid = async (gridData: any): Promise<Grid> => {
  // Step 1: Create the grid
  const response = await apiRequest("POST", "/api/grids", gridData);
  const grid = await response.json();
  
  // Step 2: Start the grid
  await startGrid(grid.id);
  
  // Step 3: Create a default welcome region
  const welcomeRegion = {
    gridId: grid.id,
    name: "Welcome Island",
    positionX: 1000,
    positionY: 1000,
    sizeX: 256,
    sizeY: 256,
    port: 9000,
    template: "welcome",
    status: "online"
  };
  
  await apiRequest("POST", "/api/regions", welcomeRegion);
  
  return grid;
};
