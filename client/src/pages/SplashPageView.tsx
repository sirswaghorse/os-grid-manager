import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SplashPage } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SplashPageView() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch splash page data
  const { data: splashPage, isLoading } = useQuery<SplashPage>({
    queryKey: ['/api/splash-page'],
    queryFn: async () => {
      const res = await fetch('/api/splash-page');
      if (!res.ok) throw new Error('Failed to fetch splash page');
      return res.json();
    },
  });

  // Image slideshow logic
  useEffect(() => {
    if (!splashPage || splashPage.slideshowImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % splashPage.slideshowImages.length
      );
    }, splashPage.slideshowSpeed);
    
    return () => clearInterval(interval);
  }, [splashPage]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
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
                <div className="text-center p-8">
                  <h2 className="text-2xl font-bold mb-2">Welcome to our Grid</h2>
                  <p className="text-muted-foreground">{splashPage?.message}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Info panel */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Welcome to our Grid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-foreground">{splashPage?.message}</p>
              </CardContent>
            </Card>
            
            {splashPage?.calendarUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
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
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Connect Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-base">Join our grid using any OpenSimulator compatible viewer:</p>
                  <Button className="w-full">Launch Viewer</Button>
                  <p className="text-sm text-muted-foreground">
                    Need help? Visit our website for detailed connection instructions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}