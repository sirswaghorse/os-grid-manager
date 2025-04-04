import { RegionSize } from "@shared/schema";

// Get all region sizes available for purchase
export async function getAllRegionSizes(): Promise<RegionSize[]> {
  const response = await fetch('/api/region-sizes');
  if (!response.ok) throw new Error('Failed to fetch region sizes');
  return await response.json();
}

// Add more API functions as needed