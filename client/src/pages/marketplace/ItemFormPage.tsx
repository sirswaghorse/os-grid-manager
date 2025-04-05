import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/imported/navigation";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceCategory, MarketplaceItem, insertMarketplaceItemSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon, XIcon, UploadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Extend the marketplace item schema for form validation
const formSchema = insertMarketplaceItemSchema.extend({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  category: z.string().min(1, { message: "Please select a category" }),
  // Add tags as a comma-separated string that we'll process
  tagsInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ItemFormPage() {
  const [, navigate] = useNavigate();
  const [, location] = useLocation();
  const [match, params] = useRoute("/marketplace/edit/:id");
  const isEditing = !!match;
  const itemId = params?.id ? parseInt(params.id, 10) : undefined;
  
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  // Get categories for the dropdown
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
  
  // If editing, fetch the item data
  const { data: itemData, isLoading: loadingItem } = useQuery<MarketplaceItem>({
    queryKey: ['/api/marketplace/items', itemId],
    queryFn: async () => {
      if (!itemId) throw new Error('Item ID is required');
      const response = await fetch(`/api/marketplace/items/${itemId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch item details');
      }
      return response.json();
    },
    enabled: !!itemId,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      tagsInput: "",
    },
  });
  
  // Update form when item data is loaded
  useEffect(() => {
    if (itemData) {
      form.reset({
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category: itemData.category,
        tagsInput: itemData.tags ? itemData.tags.join(", ") : "",
      });
      
      if (itemData.images) {
        setUploadedImages(itemData.images);
      }
    }
  }, [itemData, form]);
  
  // Mutations for creating and updating items
  const createItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Process tags from comma-separated string
      const tags = data.tagsInput 
        ? data.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      const itemData = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        tags,
        images: uploadedImages,
        sellerId: user!.id,
        status: "pending" // New items are pending by default
      };
      
      const res = await apiRequest('POST', '/api/marketplace/items', itemData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items'] });
      toast({
        title: "Item created",
        description: "Your item has been submitted for approval",
      });
      navigate("/marketplace");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!itemId) throw new Error('Item ID is required');
      
      // Process tags from comma-separated string
      const tags = data.tagsInput 
        ? data.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      const itemData = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        tags,
        images: uploadedImages,
        // Don't update seller ID or status when editing
      };
      
      const res = await apiRequest('PATCH', `/api/marketplace/items/${itemId}`, itemData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items', itemId] });
      toast({
        title: "Item updated",
        description: "Your changes have been saved",
      });
      navigate("/marketplace");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // For simplicity, we're using fake image URLs (in a real app, we'd upload to a server)
    // This is just for demonstration purposes
    const newImages = Array.from(files).map((file, index) => {
      // In a real application, you would upload the file to a server and get a URL back
      // For now, we'll create a fake URL that references the file name
      return `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`;
    });
    
    setUploadedImages([...uploadedImages, ...newImages]);
  };
  
  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };
  
  const onSubmit = (data: FormValues) => {
    if (uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your item",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing) {
      updateItemMutation.mutate(data);
    } else {
      createItemMutation.mutate(data);
    }
  };
  
  const isLoading = loadingCategories || (isEditing && loadingItem);
  const isPending = createItemMutation.isPending || updateItemMutation.isPending;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Marketplace Item" : "List New Item"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Update your listing details below" 
            : "Share your virtual creations with the community"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Item Information</h3>
                <p className="text-sm text-muted-foreground">
                  Provide details about your virtual item
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Amazing Creation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your item in detail..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include details about what the item is, how it can be used, and any special features.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (§)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tagsInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="clothing, medieval, avatar" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Separate tags with commas. Tags help users find your item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Images */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Images</h3>
                <p className="text-sm text-muted-foreground">
                  Add photos of your item. The first image will be used as the thumbnail.
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {uploadedImages.map((image, index) => (
                    <Card key={index} className="overflow-hidden relative group">
                      <img 
                        src={image} 
                        alt={`Item image ${index + 1}`} 
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-center">
                          Thumbnail
                        </div>
                      )}
                    </Card>
                  ))}
                  
                  {uploadedImages.length < 5 && (
                    <Card className="border-dashed border-2 flex items-center justify-center h-32">
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                        <UploadIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Add Image</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </Card>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Upload up to 5 images. For best results, use images with 3:2 aspect ratio.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-md p-4">
                <h4 className="font-medium mb-2">Listing Guidelines</h4>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Items must comply with community standards</li>
                  <li>Provide accurate descriptions of your items</li>
                  <li>Include clear images showing the item from different angles</li>
                  <li>Set reasonable prices based on item complexity and quality</li>
                  <li>New listings will be reviewed before appearing on the marketplace</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/marketplace")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Item" : "Submit Listing"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}