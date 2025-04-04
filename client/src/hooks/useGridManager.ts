import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Grid, Region, InsertGrid, InsertRegion } from "@shared/schema";
import { startGrid, stopGrid, restartRegion, setupNewGrid } from "@/lib/opensim";
import { getNextAvailablePort } from "@/lib/gridTypes";

export function useGridManager() {
  const { toast } = useToast();
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  
  // Grid queries
  const { 
    data: grid, 
    isLoading: isGridLoading,
    error: gridError 
  } = useQuery<Grid>({
    queryKey: ["/api/grids/1"],
  });
  
  // Regions queries
  const {
    data: regions = [],
    isLoading: areRegionsLoading,
    error: regionsError
  } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });
  
  // Grid mutations
  const startGridMutation = useMutation({
    mutationFn: (gridId: number) => startGrid(gridId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grids/1"] });
      toast({
        title: "Grid started successfully",
        description: "The OpenSimulator grid is now running."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to start grid",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });
  
  const stopGridMutation = useMutation({
    mutationFn: (gridId: number) => stopGrid(gridId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grids/1"] });
      toast({
        title: "Grid stopped successfully",
        description: "The OpenSimulator grid has been shut down."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to stop grid",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });
  
  const setupGridMutation = useMutation({
    mutationFn: (gridData: Partial<InsertGrid>) => setupNewGrid(gridData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
      setIsSetupWizardOpen(false);
      toast({
        title: "Grid setup successful",
        description: "Your new OpenSimulator grid is ready to use!"
      });
    },
    onError: (error) => {
      toast({
        title: "Grid setup failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });
  
  // Region mutations
  const createRegionMutation = useMutation({
    mutationFn: (regionData: InsertRegion) => {
      return apiRequest("POST", "/api/regions", regionData).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
      setIsAddRegionOpen(false);
      toast({
        title: "Region created",
        description: "The new region has been added to your grid."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create region",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });
  
  const updateRegionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Region> }) => {
      return apiRequest("PATCH", `/api/regions/${id}`, data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
      toast({
        title: "Region updated",
        description: "The region has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update region",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });
  
  const deleteRegionMutation = useMutation({
    mutationFn: (regionId: number) => {
      return apiRequest("DELETE", `/api/regions/${regionId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
      toast({
        title: "Region deleted",
        description: "The region has been removed from your grid."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete region",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });
  
  const restartRegionMutation = useMutation({
    mutationFn: (regionId: number) => restartRegion(regionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
      toast({
        title: "Region restart initiated",
        description: "The region is now restarting."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to restart region",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });
  
  // Helper functions
  const getNextRegionPort = () => {
    const existingPorts = regions.map(region => region.port);
    return getNextAvailablePort(existingPorts);
  };
  
  return {
    // Data
    grid,
    regions,
    isGridLoading,
    areRegionsLoading,
    gridError,
    regionsError,
    
    // Modal states
    isAddRegionOpen,
    setIsAddRegionOpen,
    isSetupWizardOpen,
    setIsSetupWizardOpen,
    
    // Grid actions
    startGrid: (gridId: number) => startGridMutation.mutate(gridId),
    stopGrid: (gridId: number) => stopGridMutation.mutate(gridId),
    setupGrid: (gridData: Partial<InsertGrid>) => setupGridMutation.mutate(gridData),
    isStartingGrid: startGridMutation.isPending,
    isStoppingGrid: stopGridMutation.isPending,
    isSettingUpGrid: setupGridMutation.isPending,
    
    // Region actions
    createRegion: (regionData: InsertRegion) => createRegionMutation.mutate(regionData),
    updateRegion: (id: number, data: Partial<Region>) => updateRegionMutation.mutate({ id, data }),
    deleteRegion: (regionId: number) => deleteRegionMutation.mutate(regionId),
    restartRegion: (regionId: number) => restartRegionMutation.mutate(regionId),
    isCreatingRegion: createRegionMutation.isPending,
    isUpdatingRegion: updateRegionMutation.isPending,
    isDeletingRegion: deleteRegionMutation.isPending,
    isRestartingRegion: restartRegionMutation.isPending,
    
    // Helpers
    getNextRegionPort
  };
}
