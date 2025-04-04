import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Region, RegionPurchase, RegionSize } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// This is a simplified RegionCard component
function RegionCard({ region }: { region: Region }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'restarting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
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
        <div className="text-sm">
          <p><strong>Position:</strong> {region.positionX}, {region.positionY}</p>
          <p><strong>Port:</strong> {region.port}</p>
          <p><strong>Template:</strong> {region.template}</p>
        </div>
        
        <div className="flex mt-4 justify-end gap-2">
          <Button variant="outline" size="sm" disabled={!region.isRunning}>
            Visit Now
          </Button>
          <Button variant="outline" size="sm" disabled={region.status === 'restarting'}>
            Restart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PurchaseRegionDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);

  const { data: regionSizes, isLoading } = useQuery<RegionSize[]>({
    queryKey: ['/api/region-sizes'],
    queryFn: async () => {
      const response = await fetch('/api/region-sizes');
      if (!response.ok) throw new Error('Failed to fetch region sizes');
      return await response.json();
    }
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
        amount: selectedSize.price.toString(),
        status: 'pending',
        paymentMethod: 'paypal',
        regionName: `New Region (${selectedSize.name})`,
        purchaseDate: new Date().toISOString()
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
      <DialogContent>
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
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
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

export default function UserDashboard() {
  const { user } = useAuth();
  
  // Fetch user regions
  const { data: regions, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['/api/regions', 'user'],
    queryFn: async () => {
      const response = await fetch(`/api/regions?ownerId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch regions');
      return await response.json();
    },
    enabled: !!user
  });
  
  // Fetch region purchases
  const { data: purchases, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['/api/region-purchases'],
    queryFn: async () => {
      const response = await fetch(`/api/region-purchases?userId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      return await response.json();
    },
    enabled: !!user
  });

  const pendingPurchases = purchases?.filter(
    (purchase: RegionPurchase) => purchase.status === 'pending'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Virtual Regions</h1>
        <PurchaseRegionDialog />
      </div>
      
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
            <CardTitle>No Regions Yet</CardTitle>
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
      
      {pendingPurchases?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Pending Purchases</h2>
          <div className="space-y-4">
            {pendingPurchases.map((purchase: RegionPurchase) => (
              <Card key={purchase.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Purchase #{purchase.id}</CardTitle>
                  <CardDescription>
                    Date: {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p><strong>Status:</strong> <span className="capitalize">{purchase.status}</span></p>
                      <p><strong>Amount:</strong> ${purchase.amount}</p>
                      <p><strong>Payment Method:</strong> <span className="capitalize">{purchase.paymentMethod}</span></p>
                    </div>
                    <Button size="sm">Complete Payment</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}