import { useState } from "react";
import { useNavigate } from "@/lib/imported/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCartIcon,
  TagIcon,
  EditIcon,
  TrashIcon,
  CheckIcon
} from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onDelete?: (id: number) => void;
  adminView?: boolean;
}

export default function MarketplaceItemCard({ 
  item, 
  onDelete,
  adminView = false
}: MarketplaceItemCardProps) {
  const [, navigate] = useNavigate();
  const { user } = useAuth();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [location, setLocation] = useState("");
  
  const isOwner = user?.id === item.sellerId;
  const isAdmin = user?.isAdmin;
  const canModify = isOwner || isAdmin;
  
  const handleViewDetails = () => {
    navigate(`/marketplace/item/${item.id}`);
  };
  
  const handleEditItem = () => {
    navigate(`/marketplace/edit/${item.id}`);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
  };
  
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/marketplace/purchases', {
        itemId: item.id,
        deliveryLocation: location
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/purchases/buyer'] });
      toast({
        title: "Purchase successful",
        description: "The item will be delivered to your specified location.",
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
  
  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', `/api/marketplace/items/${item.id}`, {
        status: "approved"
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items'] });
      toast({
        title: "Item approved",
        description: "The item is now listed on the marketplace.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
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
  
  const handleApprove = () => {
    approveMutation.mutate();
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video overflow-hidden relative">
        {item.images && item.images.length > 0 ? (
          <img 
            src={item.images[0]} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={item.status === "approved" ? "default" : "secondary"}
            className="capitalize"
          >
            {item.status}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <TagIcon className="h-4 w-4" />
          <span>{item.price} §</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        <div className="mt-2">
          <Badge variant="outline" className="mr-1">{item.category}</Badge>
          {item.tags && item.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="mr-1">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
        <Button variant="outline" className="flex-1" onClick={handleViewDetails}>
          View Details
        </Button>
        
        {canModify ? (
          <div className="flex gap-2">
            {isAdmin && item.status === "pending" && (
              <Button 
                variant="outline" 
                size="icon" 
                className="text-green-600"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleEditItem}
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="text-red-600"
              onClick={handleDelete}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex-1">
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Purchase
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
                <p className="text-sm text-gray-500 mb-2">
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
      </CardFooter>
    </Card>
  );
}