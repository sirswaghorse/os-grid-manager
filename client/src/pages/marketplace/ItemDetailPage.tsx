import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useNavigate } from "@/lib/imported/navigation";
import { MarketplaceItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCartIcon, 
  EditIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  TagIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function ItemDetailPage() {
  const [match, params] = useRoute("/marketplace/item/:id");
  const [, navigate] = useNavigate();
  const { user } = useAuth();
  const itemId = parseInt(params?.id || "0", 10);
  
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  
  const { data: item, isLoading, error } = useQuery<MarketplaceItem>({
    queryKey: ['/api/marketplace/items', itemId],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/items/${itemId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch item details');
      }
      return response.json();
    },
    enabled: !!itemId,
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/marketplace/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items'] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from the marketplace",
      });
      navigate("/marketplace");
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/marketplace/purchases', {
        itemId,
        deliveryLocation: location
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/purchases/buyer'] });
      toast({
        title: "Purchase successful",
        description: "The item will be delivered to your specified location",
        variant: "default",
      });
      setPurchaseDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteItem = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate();
    }
  };
  
  const handlePurchase = () => {
    if (!location.trim()) {
      toast({
        title: "Error",
        description: "Please specify a delivery location",
        variant: "destructive",
      });
      return;
    }
    
    purchaseMutation.mutate();
  };
  
  const isOwner = user && item && user.id === item.sellerId;
  const isAdmin = user?.isAdmin;
  const canModify = isOwner || isAdmin;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-80 w-full rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-md" />
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            <Skeleton className="h-px w-full" />
            
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The item you are looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/marketplace")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/marketplace")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{item.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-background">
            {item.images && item.images.length > 0 ? (
              <img 
                src={item.images[activeImage]} 
                alt={item.name} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          
          {item.images && item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.images.map((img, index) => (
                <button
                  key={index}
                  className={`h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                    activeImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${item.name} - view ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Item Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold">{item.price} §</h2>
                <Badge variant={item.status === "approved" ? "default" : "secondary"} className="capitalize">
                  {item.status}
                </Badge>
              </div>
              
              {canModify && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => navigate(`/marketplace/edit/${item.id}`)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-600"
                    onClick={handleDeleteItem}
                    disabled={deleteItemMutation.isPending}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Category: {item.category}
            </p>
          </div>
          
          <Separator />
          
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-4 py-4">
              <p className="whitespace-pre-wrap">{item.description}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="delivery" className="space-y-4 py-4">
              <p>After purchase, this item will be delivered to your specified in-world location. Please ensure you provide a valid region name and coordinates where you have build permissions.</p>
              
              <div className="bg-muted/50 rounded-md p-4">
                <h4 className="font-medium mb-2">Delivery Instructions</h4>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>You must be online in the specified region to receive delivery</li>
                  <li>The seller will be notified when you make a purchase</li>
                  <li>Delivery typically occurs within 24-48 hours</li>
                  <li>If you have any issues, contact the seller directly</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
          
          {!isOwner && item.status === "approved" && (
            <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <ShoppingCartIcon className="mr-2 h-4 w-4" />
                  Purchase Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Purchase Item</DialogTitle>
                  <DialogDescription>
                    You are about to purchase "{item.name}" for {item.price} §.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Label htmlFor="location">Delivery Location</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Specify where you'd like to receive this item in-world
                  </p>
                  <Input 
                    id="location" 
                    placeholder="Region name (x, y, z)" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)} 
                  />
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    disabled={purchaseMutation.isPending} 
                    onClick={handlePurchase}
                  >
                    Confirm Purchase
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}