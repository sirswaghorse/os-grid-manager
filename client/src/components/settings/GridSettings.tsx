import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Grid } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Grid as GridIcon, Save, ServerOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the schema for grid settings
const gridSettingsSchema = z.object({
  name: z.string().min(1, "Grid name is required"),
  nickname: z.string().min(1, "Grid nickname is required"),
  adminEmail: z.string().email("Invalid email address"),
  externalAddress: z.string().min(1, "External address is required"),
  port: z.coerce.number().int().min(1000).max(65535),
  externalPort: z.coerce.number().int().min(1000).max(65535),
});

type GridSettingsFormValues = z.infer<typeof gridSettingsSchema>;

// Custom settings not directly in the Grid model
type GridSettings = {
  gridAutoStart: boolean;
  maxConcurrentUsers: number;
  welcomeMessage: string;
  currencyEnabled: boolean;
  defaultCurrency: string;
  voiceEnabled: boolean;
};

export default function GridSettings() {
  // Get the first grid (we're assuming only one grid in this system)
  const { data: grid, isLoading: isLoadingGrid } = useQuery<Grid>({
    queryKey: ['/api/grids/1'],
  });

  const [isRestartRequired, setIsRestartRequired] = useState(false);
  
  // Fetch additional settings from the settings API
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/settings'],
    select: (data: any[]) => {
      // Convert the array of settings into an object
      const settingsObj: Record<string, any> = {};
      data.forEach(setting => {
        try {
          settingsObj[setting.key] = setting.value;
        } catch (error) {
          settingsObj[setting.key] = setting.value;
        }
      });
      return settingsObj;
    }
  });

  // Form setup for grid fields
  const form = useForm<GridSettingsFormValues>({
    resolver: zodResolver(gridSettingsSchema),
    defaultValues: {
      name: "",
      nickname: "",
      adminEmail: "",
      externalAddress: "",
      port: 8000,
      externalPort: 8002,
    },
  });

  // Update form values when grid data is loaded
  useEffect(() => {
    if (grid) {
      form.reset({
        name: grid.name,
        nickname: grid.nickname,
        adminEmail: grid.adminEmail,
        externalAddress: grid.externalAddress,
        port: grid.port,
        externalPort: grid.externalPort,
      });
    }
  }, [grid, form]);

  // Default values for additional settings
  const [additionalSettings, setAdditionalSettings] = useState<GridSettings>({
    gridAutoStart: true,
    maxConcurrentUsers: 100,
    welcomeMessage: "Welcome to our OpenSimulator grid!",
    currencyEnabled: false,
    defaultCurrency: "OS$",
    voiceEnabled: false,
  });

  // Update additional settings when they're loaded
  useEffect(() => {
    if (settings) {
      setAdditionalSettings({
        gridAutoStart: settings.gridAutoStart === "true",
        maxConcurrentUsers: parseInt(settings.maxConcurrentUsers || "100"),
        welcomeMessage: settings.welcomeMessage || "Welcome to our OpenSimulator grid!",
        currencyEnabled: settings.currencyEnabled === "true",
        defaultCurrency: settings.defaultCurrency || "OS$",
        voiceEnabled: settings.voiceEnabled === "true",
      });
    }
  }, [settings]);

  // Handle saving grid configuration changes
  const updateGridMutation = useMutation({
    mutationFn: async (data: GridSettingsFormValues) => {
      const res = await apiRequest('PATCH', `/api/grids/${grid?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grids/1'] });
      toast({
        title: "Grid settings updated",
        description: "Your grid configuration has been updated successfully.",
      });
      setIsRestartRequired(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update grid settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle saving additional settings
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Check if setting exists first
      const settingExists = await fetch(`/api/settings/${key}`).then(res => res.ok);
      
      if (settingExists) {
        const res = await apiRequest('PUT', `/api/settings/${key}`, { value });
        return await res.json();
      } else {
        const res = await apiRequest('POST', `/api/settings`, { key, value });
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Additional grid settings updated",
        description: "Your additional settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update additional settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: GridSettingsFormValues) => {
    updateGridMutation.mutate(data);
  };

  // Handle saving additional settings
  const saveAdditionalSettings = async () => {
    // Save each setting individually
    try {
      await updateSettingMutation.mutateAsync({ 
        key: "gridAutoStart", 
        value: additionalSettings.gridAutoStart.toString() 
      });
      
      await updateSettingMutation.mutateAsync({ 
        key: "maxConcurrentUsers", 
        value: additionalSettings.maxConcurrentUsers.toString() 
      });
      
      await updateSettingMutation.mutateAsync({ 
        key: "welcomeMessage", 
        value: additionalSettings.welcomeMessage 
      });
      
      await updateSettingMutation.mutateAsync({ 
        key: "currencyEnabled", 
        value: additionalSettings.currencyEnabled.toString() 
      });
      
      await updateSettingMutation.mutateAsync({ 
        key: "defaultCurrency", 
        value: additionalSettings.defaultCurrency 
      });
      
      await updateSettingMutation.mutateAsync({ 
        key: "voiceEnabled", 
        value: additionalSettings.voiceEnabled.toString() 
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (isLoadingGrid || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading grid configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isRestartRequired && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ServerOff className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-amber-800">
                Some settings require a grid restart to take effect. Please restart your grid after saving all changes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GridIcon className="mr-2 h-5 w-5" />
            Grid Core Configuration
          </CardTitle>
          <CardDescription>
            These settings control the basic configuration of your OpenSimulator grid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grid Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The primary display name of your grid
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grid Nickname</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Short grid identifier (often used in URLs and references)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administrator Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Contact email for grid-related issues
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="externalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External Grid Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Domain name or IP address used for external connections
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grid Server Port</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Main port for the grid service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="externalPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Port</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        External-facing port for the grid service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={updateGridMutation.isPending}
              >
                {updateGridMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Save Grid Configuration
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Grid Settings</CardTitle>
          <CardDescription>
            Configure additional options for your grid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Grid Auto Start</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary"
                  checked={additionalSettings.gridAutoStart}
                  onChange={(e) => setAdditionalSettings({
                    ...additionalSettings,
                    gridAutoStart: e.target.checked
                  })}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Automatically start grid on system boot
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Concurrent Users</label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={additionalSettings.maxConcurrentUsers}
                onChange={(e) => setAdditionalSettings({
                  ...additionalSettings,
                  maxConcurrentUsers: parseInt(e.target.value || "0")
                })}
              />
              <p className="text-xs text-gray-500">
                Maximum number of users who can be logged in simultaneously
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Welcome Message</label>
            <Input
              value={additionalSettings.welcomeMessage}
              onChange={(e) => setAdditionalSettings({
                ...additionalSettings,
                welcomeMessage: e.target.value
              })}
            />
            <p className="text-xs text-gray-500">
              Message shown to users when they log into the grid
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Currency Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enable Grid Currency</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                    checked={additionalSettings.currencyEnabled}
                    onChange={(e) => setAdditionalSettings({
                      ...additionalSettings,
                      currencyEnabled: e.target.checked
                    })}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Use in-world currency system
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Currency Symbol</label>
                <Input
                  value={additionalSettings.defaultCurrency}
                  onChange={(e) => setAdditionalSettings({
                    ...additionalSettings,
                    defaultCurrency: e.target.value
                  })}
                  disabled={!additionalSettings.currencyEnabled}
                />
                <p className="text-xs text-gray-500">
                  Symbol displayed for your grid's currency
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Chat</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary"
                checked={additionalSettings.voiceEnabled}
                onChange={(e) => setAdditionalSettings({
                  ...additionalSettings,
                  voiceEnabled: e.target.checked
                })}
              />
              <span className="ml-2 text-sm text-gray-700">
                Enable voice chat capabilities in-world
              </span>
            </div>
          </div>

          <Button 
            className="w-full mt-6"
            onClick={saveAdditionalSettings}
            disabled={updateSettingMutation.isPending}
          >
            {updateSettingMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Save Additional Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}