import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, BoxIcon, ArrowLeftIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Define validation schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddInventoryItemPage() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      imageUrl: "",
    },
  });
  
  const addItemMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const itemData = {
        name: data.name,
        description: data.description,
        category: data.category,
        image: data.imageUrl || null,
        userId: user.id,
      };
      
      const res = await apiRequest('POST', '/api/inventory', itemData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Item added",
        description: "Your item has been added to your inventory",
      });
      navigate("/marketplace/inventory");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setImagePreview(url);
  };
  
  const onSubmit = (data: FormValues) => {
    addItemMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/marketplace/inventory")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <BoxIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Add Inventory Item</h1>
        </div>
      </div>
      
      <p className="text-muted-foreground">
        Add virtual items to your inventory before listing them on the marketplace
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
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
                        placeholder="Describe your item..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about what this item is and how it can be used
                    </FormDescription>
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
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Buildings">Buildings</SelectItem>
                        <SelectItem value="Vehicles">Vehicles</SelectItem>
                        <SelectItem value="Animations">Animations</SelectItem>
                        <SelectItem value="Scripts">Scripts</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Link to an image of your item. For demonstration purposes only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/marketplace/inventory")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addItemMutation.isPending}>
                  {addItemMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add to Inventory
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Image Preview</h3>
              <div className="border rounded-md aspect-video bg-muted flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                    onError={() => {
                      toast({
                        title: "Image Error",
                        description: "Could not load image from provided URL",
                        variant: "destructive",
                      });
                      setImagePreview(null);
                      form.setValue("imageUrl", "");
                    }}
                  />
                ) : (
                  <span className="text-muted-foreground">No image preview available</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                In a production environment, you would upload images directly.
                For this demo, you can provide URLs to existing images.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-2">About Inventory Items</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Inventory items represent virtual goods that you own in the metaverse.
                From here, you can:
              </p>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Manage your virtual possessions in one place</li>
                <li>List items for sale on the marketplace</li>
                <li>Keep track of creations you've made or purchased</li>
                <li>Organize items by category</li>
              </ul>
              <Separator className="my-4" />
              <p className="text-sm">
                After adding items to your inventory, you can publish them to the
                marketplace to earn grid currency.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}