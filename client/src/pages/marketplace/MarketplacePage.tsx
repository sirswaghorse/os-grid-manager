import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MarketplaceCategory, MarketplaceItem } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MarketplaceItemCard from "@/components/marketplace/MarketplaceItemCard";
import { SearchIcon, PlusIcon, MarketplaceIcon } from "@/lib/icons";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>(user?.isAdmin ? "all" : "approved");
  
  const { data: items, isLoading: isLoadingItems } = useQuery<MarketplaceItem[]>({
    queryKey: ['/api/marketplace/items', statusFilter, selectedCategory],
    queryFn: async () => {
      let url = '/api/marketplace/items';
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append('status', statusFilter);
      }
      if (selectedCategory !== "all") {
        params.append('category', selectedCategory);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace items');
      }
      return response.json();
    }
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<MarketplaceCategory[]>({
    queryKey: ['/api/marketplace/categories'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/marketplace/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items'] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from the marketplace.",
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
  
  const handleDeleteItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(id);
    }
  };
  
  const filteredItems = items?.filter(item => {
    return (
      (searchTerm === "" || 
       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    );
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MarketplaceIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Marketplace</h1>
        </div>
        
        {user && (
          <Link href="/marketplace/create">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              List Item
            </Button>
          </Link>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find virtual items, content, and creations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {!isLoadingCategories && categories?.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {user?.isAdmin && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoadingItems ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-[180px] w-full" />
              <CardHeader className="p-4 pb-0">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredItems && filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <MarketplaceItemCard 
              key={item.id} 
              item={item} 
              onDelete={handleDeleteItem}
              adminView={user?.isAdmin}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-gray-500">No items found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm || selectedCategory !== "all" ? 
                "Try adjusting your filters or search terms" : 
                "Be the first to list an item on the marketplace!"}
            </p>
            {((!isLoadingItems && !items?.length) || (!filteredItems?.length && user)) && (
              <Link href="/marketplace/create">
                <Button className="mt-4">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  List your first item
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}