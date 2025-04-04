import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Region } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Grid as GridIcon, PlusCircle, Upload, Download, Settings, RefreshCw, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAllRegionSizes } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Component for rendering a region card with its details
function RegionCard({ region }: { region: Region }) {
  const { toast } = useToast();
  const [isRestarting, setIsRestarting] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'restarting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      await apiRequest('POST', `/api/regions/${region.id}/restart`, {});
      
      toast({
        title: "Region Restarting",
        description: `${region.name} is now restarting...`
      });
      
      // Invalidate the regions query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
    } catch (error) {
      toast({
        title: "Restart Failed",
        description: "There was an error restarting your region",
        variant: "destructive"
      });
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{region.name}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${getStatusColor(region.status)}`}></div>
            <span className="text-xs capitalize">{region.status}</span>
          </div>
        </div>
        <CardDescription className="text-xs">
          Size: {region.sizeX}m x {region.sizeY}m
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Position:</span>
            <span>{region.positionX}, {region.positionY}</span>
          </div>
          <div className="flex justify-between">
            <span>Port:</span>
            <span>{region.port}</span>
          </div>
          <div className="flex justify-between">
            <span>Template:</span>
            <span className="capitalize">{region.template}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!region.isRunning}
            className="w-full"
          >
            <GridIcon className="mr-2 h-4 w-4" />
            Visit Now
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRestart}
            disabled={isRestarting || region.status === 'restarting'}
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`} />
            Restart
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Backup
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for the region map visualization
function RegionMap({ regions }: { regions: Region[] }) {
  // This is a simplified visual representation of region positions
  // In a real implementation, this would be a proper grid with SVG or Canvas
  
  const calcPosition = (pos: number) => {
    // Convert OpenSim coordinate to relative position in our grid
    return (pos - 1000) / 256;
  };
  
  const calcSize = (size: number) => {
    // Convert OpenSim region size to grid cells
    return size / 256;
  };
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-auto">
      <div className="w-full h-[500px] relative border border-gray-300 dark:border-gray-700">
        {/* Grid lines */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }}></div>
        
        {/* Regions */}
        {regions.map(region => (
          <div 
            key={region.id}
            className="absolute border-2 border-primary bg-primary/10 rounded-md flex items-center justify-center text-center text-xs font-medium p-2 overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors"
            style={{
              left: `${calcPosition(region.positionX) * 64}px`,
              top: `${calcPosition(region.positionY) * 64}px`,
              width: `${calcSize(region.sizeX) * 64}px`,
              height: `${calcSize(region.sizeY) * 64}px`,
            }}
            title={`${region.name} (${region.positionX}, ${region.positionY})`}
          >
            {region.name}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Grid coordinates are shown in OpenSimulator units (256m per grid square)
      </div>
    </div>
  );
}

// Dialog component for purchasing new regions
function PurchaseRegionDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

  const { data: regionSizes, isLoading } = useQuery({
    queryKey: ['/api/region-sizes'],
    queryFn: getAllRegionSizes
  });

  const handlePurchase = async () => {
    if (!selectedSizeId || !user) return;
    
    try {
      const selectedSize = regionSizes?.find(size => size.id === selectedSizeId);
      
      if (!selectedSize) {
        toast({
          title: "Error",
          description: "Please select a valid region size",
          variant: "destructive"
        });
        return;
      }
      
      // Create a region purchase
      await apiRequest('POST', '/api/region-purchases', {
        userId: user.id,
        regionSizeId: selectedSizeId,
        price: selectedSize.price,
        status: 'pending',
        paymentMethod: 'paypal'
      });
      
      toast({
        title: "Success",
        description: "Your purchase request has been submitted! You'll be redirected to payment soon.",
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/region-purchases'] });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your purchase request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Purchase New Region
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Purchase a New Region</DialogTitle>
          <DialogDescription>
            Select a region size to purchase. You will be redirected to complete payment.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {regionSizes?.map(size => (
              <Card 
                key={size.id}
                className={`cursor-pointer transition-all ${
                  selectedSizeId === size.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedSizeId(size.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{size.name}</CardTitle>
                  <CardDescription>{size.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p>Size: {size.sizeX}m x {size.sizeY}m</p>
                    </div>
                    <div className="text-xl font-bold">${size.price}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase} 
            disabled={!selectedSizeId || isLoading}
          >
            Proceed to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UserRegions() {
  const { user } = useAuth();
  
  // Fetch user regions
  const { data: regions, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['/api/regions', 'user'],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/regions?ownerId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch regions');
      return await response.json();
    },
    enabled: !!user
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Regions</h1>
        <PurchaseRegionDialog />
      </div>
      
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {isLoadingRegions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : regions?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regions.map((region: Region) => (
                <RegionCard key={region.id} region={region} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Regions Found</CardTitle>
                <CardDescription>
                  You don't have any regions yet. Purchase your first region to get started!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  With your own virtual region, you can:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Create and customize your virtual space</li>
                  <li>Invite friends to visit your region</li>
                  <li>Build structures and landscapes</li>
                  <li>Host events and activities</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="map">
          {isLoadingRegions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : regions?.length > 0 ? (
            <RegionMap regions={regions} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Regions on Map</CardTitle>
                <CardDescription>
                  You don't have any regions to display on the map. Purchase your first region to get started!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Purchase Your First Region</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}