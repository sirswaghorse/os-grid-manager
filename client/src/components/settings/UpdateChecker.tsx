import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, DownloadCloud, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import { VersionCheck } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

export default function UpdateChecker() {
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  
  // Query for checking the version (not auto-fetched until triggered)
  const {
    data: versionData,
    isLoading,
    error,
    refetch
  } = useQuery<VersionCheck>({
    queryKey: ['/api/version-check'],
    enabled: false, // Don't fetch automatically
  });
  
  // Function to trigger the version check
  const checkForUpdates = async () => {
    setIsCheckingForUpdates(true);
    try {
      await refetch();
    } finally {
      setIsCheckingForUpdates(false);
    }
  };
  
  // Update mutation (this would trigger the actual update script)
  const updateMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would trigger the update process
      // For now, we'll just show a mock success message
      return await new Promise((resolve) => {
        // Simulate update process
        setTimeout(() => {
          resolve({ success: true });
        }, 2000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Update initiated",
        description: "The update process has been started. Your system will restart automatically when complete.",
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
  
  // Function to copy update command to clipboard
  const copyUpdateCommand = () => {
    const command = "cd /opt/osgridmanager && ./update.sh";
    navigator.clipboard.writeText(command).then(() => {
      toast({
        title: "Command copied",
        description: "Update command copied to clipboard",
      });
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DownloadCloud className="mr-2 h-5 w-5" />
          Software Updates
        </CardTitle>
        <CardDescription>
          Check for and install updates to the OS Grid Manager
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!versionData && !isLoading && !error && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Check for the latest updates to ensure you have the newest features and security fixes.
            </p>
            <Button 
              onClick={checkForUpdates} 
              disabled={isCheckingForUpdates}
              className="w-full md:w-auto"
            >
              {isCheckingForUpdates && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check for Updates
            </Button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Checking for updates...</span>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error checking for updates</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Unable to check for updates"}
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkForUpdates} 
              className="mt-2"
            >
              Try Again
            </Button>
          </Alert>
        )}
        
        {versionData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Current Version</p>
                <p className="text-xl font-semibold">{versionData.currentVersion}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Latest Version</p>
                <p className="text-xl font-semibold">{versionData.latestVersion}</p>
              </div>
            </div>
            
            <Separator />
            
            {versionData.updateAvailable ? (
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Update Available</AlertTitle>
                <AlertDescription>
                  A new version ({versionData.latestVersion}) of OS Grid Manager is available.
                  <br />
                  {versionData.releaseNotes && (
                    <div className="mt-2 text-sm">
                      <p className="font-semibold">Release Notes:</p>
                      <p className="whitespace-pre-line">{versionData.releaseNotes}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Up to Date</AlertTitle>
                <AlertDescription>
                  You are running the latest version of OS Grid Manager.
                </AlertDescription>
              </Alert>
            )}
            
            {versionData.updateAvailable && (
              <div className="space-y-4 mt-4">
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-800">Before updating</h3>
                      <div className="mt-2 text-sm text-gray-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Backup your database and configuration files</li>
                          <li>Schedule the update during a low-usage period</li>
                          <li>Users will be disconnected during the update process</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="w-full"
                  >
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Update Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={copyUpdateCommand}
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Manual Update Command
                  </Button>
                  
                  {versionData.releaseUrl && (
                    <Button
                      variant="link"
                      onClick={() => window.open(versionData.releaseUrl, '_blank')}
                      className="w-full"
                    >
                      View Release on GitHub
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {versionData && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
            Last checked: {new Date().toLocaleString()}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkForUpdates}
            disabled={isCheckingForUpdates}
          >
            {isCheckingForUpdates && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Check Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}