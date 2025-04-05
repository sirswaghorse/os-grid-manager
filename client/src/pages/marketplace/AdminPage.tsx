import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MarketplaceCategory, MarketplaceSetting } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  PlusIcon,
  EditIcon,
  TrashIcon,
  TagIcon,
  SettingsIcon,
  Loader2,
} from "lucide-react";
import { MarketplaceIcon } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceAdminPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }
  
  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery<MarketplaceCategory[]>({
    queryKey: ['/api/marketplace/categories'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });
  
  // Fetch marketplace settings
  const { data: settings, isLoading: loadingSettings } = useQuery<MarketplaceSetting[]>({
    queryKey: ['/api/marketplace/settings'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace settings');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Set initial values from fetched settings
      const commissionSetting = data.find(s => s.key === 'commissionRate');
      if (commissionSetting) {
        setCommissionRate(commissionSetting.value);
      }
      
      const enabledSetting = data.find(s => s.key === 'marketplaceEnabled');
      if (enabledSetting) {
        setMarketplaceEnabled(enabledSetting.value === 'true');
      }
    }
  });
  
  // Mutations for category management
  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest('POST', '/api/marketplace/categories', { name });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/categories'] });
      toast({
        title: "Category added",
        description: "The new category has been created",
      });
      setNewCategoryName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add category",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number, name: string }) => {
      const res = await apiRequest('PATCH', `/api/marketplace/categories/${id}`, { name });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/categories'] });
      toast({
        title: "Category updated",
        description: "The category has been renamed",
      });
      setEditCategoryId(null);
      setEditCategoryName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/marketplace/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/categories'] });
      toast({
        title: "Category deleted",
        description: "The category has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete category",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutations for settings management
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      const res = await apiRequest('PUT', `/api/marketplace/settings/${key}`, { value });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/settings'] });
      toast({
        title: "Setting updated",
        description: "The marketplace setting has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update setting",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addCategoryMutation.mutate(newCategoryName);
  };
  
  const handleUpdateCategory = () => {
    if (!editCategoryName.trim() || !editCategoryId) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    updateCategoryMutation.mutate({ id: editCategoryId, name: editCategoryName });
  };
  
  const handleDeleteCategory = (id: number) => {
    if (window.confirm("Are you sure you want to delete this category? This will affect all items in this category.")) {
      deleteCategoryMutation.mutate(id);
    }
  };
  
  const startEditCategory = (category: MarketplaceCategory) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.name);
  };
  
  const handleCommissionUpdate = () => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Invalid commission rate",
        description: "Please enter a number between 0 and 100",
        variant: "destructive",
      });
      return;
    }
    
    updateSettingMutation.mutate({ key: 'commissionRate', value: rate.toString() });
  };
  
  const handleMarketplaceToggle = (enabled: boolean) => {
    setMarketplaceEnabled(enabled);
    updateSettingMutation.mutate({ key: 'marketplaceEnabled', value: enabled.toString() });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MarketplaceIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Marketplace Administration</h1>
        </div>
      </div>
      
      <Tabs defaultValue="categories">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">
            <TagIcon className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Categories</CardTitle>
              <CardDescription>
                Manage categories for organizing marketplace items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="new-category">New Category Name</Label>
                  <Input
                    id="new-category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                  />
                </div>
                <Button 
                  onClick={handleAddCategory} 
                  disabled={addCategoryMutation.isPending}
                >
                  {addCategoryMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              {loadingCategories ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-36 flex-1" />
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  ))}
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map(category => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      {editCategoryId === category.id ? (
                        <div className="flex items-end gap-4 flex-1">
                          <div className="flex-1">
                            <Label htmlFor={`edit-category-${category.id}`}>Category Name</Label>
                            <Input
                              id={`edit-category-${category.id}`}
                              value={editCategoryName}
                              onChange={(e) => setEditCategoryName(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setEditCategoryId(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleUpdateCategory}
                              disabled={updateCategoryMutation.isPending}
                            >
                              {updateCategoryMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-lg">{category.name}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => startEditCategory(category)}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-600"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No categories found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add categories to help organize marketplace items
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Settings</CardTitle>
              <CardDescription>
                Configure global marketplace settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSettings ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketplace-enabled" className="text-base">
                        Marketplace Enabled
                      </Label>
                      <Switch 
                        id="marketplace-enabled"
                        checked={marketplaceEnabled}
                        onCheckedChange={handleMarketplaceToggle}
                        disabled={updateSettingMutation.isPending}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When disabled, users will not be able to access the marketplace or make purchases
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <Label htmlFor="commission-rate" className="text-base">
                      Marketplace Commission Rate (%)
                    </Label>
                    <div className="flex items-end gap-4">
                      <Input
                        id="commission-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleCommissionUpdate}
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update Rate
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Percentage of each sale that goes to the grid operator as a commission fee
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-muted/50 rounded-md p-4">
                    <h3 className="font-medium mb-2">Marketplace Administration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      As a grid administrator, you can:
                    </p>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                      <li>Approve or reject marketplace listings</li>
                      <li>Set commission rates on all sales</li>
                      <li>Organize items by creating and managing categories</li>
                      <li>Enable or disable the entire marketplace feature</li>
                      <li>Monitor sales and user activity in the marketplace</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Manage marketplace items awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation("/marketplace?status=pending")}
                className="w-full"
              >
                View Pending Items
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}