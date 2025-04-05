import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Trash2, Plus, Calendar, MessageSquare, Image } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SplashPage as SplashPageType } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

const imageUrlSchema = z.object({
  imageUrl: z.string().url({ message: 'Please enter a valid URL' }),
});

type ImageUrlFormValues = z.infer<typeof imageUrlSchema>;

const splashPageSchema = z.object({
  message: z.string().min(1, { message: 'Message is required' }),
  calendarUrl: z.string().url({ message: 'Please enter a valid URL' }).or(z.string().length(0)),
  slideshowSpeed: z.number().min(1000, { message: 'Speed must be at least 1000ms' }),
});

type SplashPageFormValues = z.infer<typeof splashPageSchema>;

export default function SplashPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Fetch splash page data
  const { data: splashPage, isLoading } = useQuery<SplashPageType>({
    queryKey: ['/api/splash-page'],
    queryFn: async () => {
      const res = await fetch('/api/splash-page');
      if (!res.ok) throw new Error('Failed to fetch splash page');
      return res.json();
    },
  });

  // Image slideshow logic
  useEffect(() => {
    if (!splashPage || !isPreviewMode || splashPage.slideshowImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % splashPage.slideshowImages.length
      );
    }, splashPage.slideshowSpeed);
    
    return () => clearInterval(interval);
  }, [splashPage, isPreviewMode]);

  // Handle form for splash page settings
  const form = useForm<SplashPageFormValues>({
    resolver: zodResolver(splashPageSchema),
    defaultValues: {
      message: splashPage?.message || '',
      calendarUrl: splashPage?.calendarUrl || '',
      slideshowSpeed: splashPage?.slideshowSpeed || 5000,
    },
    values: {
      message: splashPage?.message || '',
      calendarUrl: splashPage?.calendarUrl || '',
      slideshowSpeed: splashPage?.slideshowSpeed || 5000,
    },
  });

  // Handle form for adding new images
  const imageForm = useForm<ImageUrlFormValues>({
    resolver: zodResolver(imageUrlSchema),
    defaultValues: {
      imageUrl: '',
    },
  });

  // Update splash page mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SplashPageFormValues) => {
      const res = await apiRequest('PUT', '/api/splash-page', data);
      if (!res.ok) throw new Error('Failed to update splash page');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/splash-page'] });
      toast({
        title: 'Splash page updated',
        description: 'Your changes have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add image mutation
  const addImageMutation = useMutation({
    mutationFn: async (data: ImageUrlFormValues) => {
      const res = await apiRequest('POST', '/api/splash-page/images', data);
      if (!res.ok) throw new Error('Failed to add image');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/splash-page'] });
      toast({
        title: 'Image added',
        description: 'The image has been added to the slideshow.',
      });
      imageForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove image mutation
  const removeImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const res = await apiRequest('DELETE', '/api/splash-page/images', { imageUrl });
      if (!res.ok) throw new Error('Failed to remove image');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/splash-page'] });
      toast({
        title: 'Image removed',
        description: 'The image has been removed from the slideshow.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: SplashPageFormValues) => {
    updateMutation.mutate(data);
  };

  // Add image handler
  const onAddImage = (data: ImageUrlFormValues) => {
    addImageMutation.mutate(data);
  };

  // Navigation for images
  const nextImage = () => {
    if (!splashPage?.slideshowImages.length) return;
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % splashPage.slideshowImages.length
    );
  };

  const prevImage = () => {
    if (!splashPage?.slideshowImages.length) return;
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + splashPage.slideshowImages.length) % splashPage.slideshowImages.length
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Preview mode
  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
          <Button 
            variant="outline" 
            className="self-start mb-4"
            onClick={() => setIsPreviewMode(false)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Edit
          </Button>
          
          <div className="flex-1 flex flex-col lg:flex-row gap-6">
            {/* Slideshow */}
            <div className="w-full lg:w-2/3 relative overflow-hidden rounded-xl shadow-lg">
              {splashPage?.slideshowImages.length ? (
                <>
                  <img 
                    src={splashPage.slideshowImages[currentImageIndex]} 
                    alt="Slideshow"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <Button variant="secondary" size="icon" className="opacity-70 hover:opacity-100" onClick={prevImage}>
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button variant="secondary" size="icon" className="opacity-70 hover:opacity-100" onClick={nextImage}>
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {splashPage.slideshowImages.map((_, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === currentImageIndex ? "bg-primary w-4" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[500px] bg-muted">
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No images in slideshow</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Info panel */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{splashPage?.message}</p>
                </CardContent>
              </Card>
              
              {splashPage?.calendarUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Grid Events Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <iframe 
                      src={splashPage.calendarUrl}
                      width="100%"
                      height="300"
                      frameBorder="0"
                      scrolling="no"
                      title="Grid Events Calendar"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Splash Page Settings</h1>
        <Button onClick={() => setIsPreviewMode(true)}>Preview Splash Page</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure the main content of your splash page</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a welcome message for visitors" 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be displayed prominently on your splash page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="calendarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Calendar Embed URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://calendar.google.com/calendar/embed?src=..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Add a Google Calendar to display upcoming events.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slideshowSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slideshow Speed (ms)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Time in milliseconds between slideshow transitions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Slideshow Images */}
        <Card>
          <CardHeader>
            <CardTitle>Slideshow Images</CardTitle>
            <CardDescription>Manage the images displayed in your splash page slideshow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Current Images */}
              <div>
                <h3 className="font-medium mb-3">Current Images</h3>
                {splashPage?.slideshowImages.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {splashPage.slideshowImages.map((imageUrl, index) => (
                      <div key={index} className="relative group rounded-md overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`Slideshow Image ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="opacity-90"
                            onClick={() => removeImageMutation.mutate(imageUrl)}
                            disabled={removeImageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No images added yet.</p>
                )}
              </div>
              
              {/* Add New Image */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Add New Image</h3>
                <Form {...imageForm}>
                  <form onSubmit={imageForm.handleSubmit(onAddImage)} className="space-y-4">
                    <FormField
                      control={imageForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/image.jpg" 
                                {...field} 
                              />
                            </FormControl>
                            <Button 
                              type="submit" 
                              disabled={addImageMutation.isPending}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          <FormDescription>
                            Enter the URL of an image to add to your slideshow.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}