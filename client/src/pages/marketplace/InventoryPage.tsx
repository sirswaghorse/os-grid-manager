import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { MarketplaceItem, UserInventory } from "@shared/schema";
import { InventoryItem, MarketplacePurchaseWithDetails } from "@/lib/imported/marketplace-types";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  BoxIcon, 
  PlusIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon,
  TagIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  ArrowUpIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
  const [location, setLocation] = useLocation();
  const navigate = (path: string) => {
    setLocation(path);
  };
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  // Fetch inventory items
  const { data: inventoryItems, isLoading: loadingInventory } = useQuery<UserInventory[]>({
    queryKey: ['/api/inventory'],
    queryFn: async () => {
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      return response.json();
    }
  });
  
  // Fetch marketplace items by seller
  const { data: listedItems, isLoading: loadingListed } = useQuery<MarketplaceItem[]>({
    queryKey: ['/api/marketplace/seller', user.id, 'items'],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/seller/${user.id}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch listed items');
      }
      return response.json();
    }
  });
  
  // Fetch purchases made by the user
  const { data: purchases, isLoading: loadingPurchases } = useQuery<MarketplacePurchaseWithDetails[]>({
    queryKey: ['/api/marketplace/purchases/buyer'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/purchases/buyer');
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      return response.json();
    }
  });
  
  // Fetch sales made by the user
  const { data: sales, isLoading: loadingSales } = useQuery<MarketplacePurchaseWithDetails[]>({
    queryKey: ['/api/marketplace/purchases/seller'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/purchases/seller');
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      return response.json();
    }
  });
  
  // Delete inventory item mutation
  const deleteInventoryMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest('DELETE', `/api/inventory/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from your inventory",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create marketplace listing from inventory mutation
  const createListingMutation = useMutation({
    mutationFn: async (inventoryItemId: number) => {
      await apiRequest('POST', '/api/marketplace/items', {
        inventoryItemId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/seller', user.id, 'items'] });
      toast({
        title: "Item listed",
        description: "Your item has been listed on the marketplace",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Listing failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Complete sale mutation
  const completeSaleMutation = useMutation({
    mutationFn: async (purchaseId: number) => {
      await apiRequest('PATCH', `/api/marketplace/purchases/${purchaseId}`, {
        status: "completed"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/purchases/seller'] });
      toast({
        title: "Sale completed",
        description: "You've marked this sale as completed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter inventory items
  const filteredInventory = inventoryItems?.filter(item => {
    const matchesSearch = 
      searchTerm === "" || 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesCategory = 
      categoryFilter === "all" || 
      item.itemType === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle delete inventory item
  const handleDeleteInventory = (itemId: number) => {
    deleteInventoryMutation.mutate(itemId);
  };
  
  // Handle list item on marketplace
  const handleListItem = (itemId: number) => {
    createListingMutation.mutate(itemId);
  };
  
  // Handle complete sale
  const handleCompleteSale = (purchaseId: number) => {
    completeSaleMutation.mutate(purchaseId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BoxIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">My Inventory</h1>
        </div>
        
        <Link href="/marketplace/add-inventory">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add to Inventory
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">My Inventory</TabsTrigger>
          <TabsTrigger value="marketplace">My Listings</TabsTrigger>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Manage your virtual items and assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Buildings">Buildings</SelectItem>
                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                    <SelectItem value="Animations">Animations</SelectItem>
                    <SelectItem value="Scripts">Scripts</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {loadingInventory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-[150px] w-full" />
                      <CardHeader className="p-4 pb-0">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredInventory && filteredInventory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredInventory.map(item => (
                    <Card key={item.id} className="overflow-hidden flex flex-col">
                      <div className="aspect-video bg-muted relative">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.itemName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2">
                          {item.itemType}
                        </Badge>
                      </div>
                      
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-lg">{item.itemName}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {item.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-4 pt-2 flex-grow">
                        <p className="text-sm text-muted-foreground">
                          Added on {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                      </CardContent>
                      
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete inventory item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the item
                                from your inventory.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteInventory(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button 
                          className="flex-1"
                          onClick={() => handleListItem(item.id)}
                          disabled={createListingMutation.isPending}
                        >
                          <ArrowUpIcon className="mr-2 h-4 w-4" />
                          List on Marketplace
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No inventory items found</p>
                  <p className="text-sm mb-6">
                    {searchTerm || categoryFilter !== "all" ? 
                      "Try adjusting your filters" : 
                      "Add items to your inventory to get started"}
                  </p>
                  <Link href="/marketplace/add-inventory">
                    <Button>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Item to Inventory
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Marketplace Listings Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Marketplace Listings</CardTitle>
              <CardDescription>
                View and manage your items listed for sale
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingListed ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  ))}
                </div>
              ) : listedItems && listedItems.length > 0 ? (
                <div className="space-y-4">
                  {listedItems.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={item.status === "approved" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {item.status}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <TagIcon className="h-3 w-3 mr-1" />
                            <span>{item.price} §</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/marketplace/item/${item.id}`)}
                      >
                        View Listing
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No items listed for sale</p>
                  <p className="text-sm mb-6">
                    List items from your inventory on the marketplace
                  </p>
                  <Link href="/marketplace">
                    <Button>
                      <ShoppingBagIcon className="mr-2 h-4 w-4" />
                      Go to Marketplace
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Purchases</CardTitle>
              <CardDescription>
                Items you've bought from other sellers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPurchases ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : purchases && purchases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map(purchase => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.itemName}</TableCell>
                        <TableCell>{purchase.price} §</TableCell>
                        <TableCell>
                          <Badge 
                            variant={purchase.status === "completed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {purchase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(purchase.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/marketplace/item/${purchase.itemId}`)}
                          >
                            View Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No purchases yet</p>
                  <p className="text-sm mb-6">
                    Items you buy will appear here
                  </p>
                  <Link href="/marketplace">
                    <Button>
                      <ShoppingCartIcon className="mr-2 h-4 w-4" />
                      Browse Marketplace
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Sales</CardTitle>
              <CardDescription>
                Items others have purchased from you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : sales && sales.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Location</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map(sale => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.itemName}</TableCell>
                        <TableCell>{sale.price} §</TableCell>
                        <TableCell>{sale.buyerName}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              sale.status === "completed" 
                                ? "default" 
                                : sale.status === "pending" 
                                  ? "secondary"
                                  : "outline"
                            }
                            className="capitalize"
                          >
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{sale.deliveryLocation}</TableCell>
                        <TableCell className="text-right">
                          {sale.status === "pending" ? (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteSale(sale.id)}
                              disabled={completeSaleMutation.isPending}
                            >
                              <CheckIcon className="mr-2 h-3 w-3" />
                              Mark as Delivered
                            </Button>
                          ) : (
                            <Badge variant="outline" className="capitalize">
                              {sale.status}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No sales yet</p>
                  <p className="text-sm mb-6">
                    When someone buys your items, they'll appear here
                  </p>
                  <Link href="/marketplace">
                    <Button>
                      <ShoppingBagIcon className="mr-2 h-4 w-4" />
                      View My Listings
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}