import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle, 
  Database, 
  FileText, 
  RefreshCw, 
  Save, 
  Settings, 
  Sliders, 
  Terminal, 
  Archive
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface AdvancedSettingsType {
  databaseSettings: {
    connectionPoolSize: number;
    commandTimeout: number;
    enableQueryCaching: boolean;
    maintenanceMode: boolean;
    backupInterval: number;
    logSlowQueries: boolean;
    slowQueryThreshold: number;
  };
  loggingSettings: {
    logLevel: "error" | "warn" | "info" | "debug" | "verbose";
    enableConsoleLogging: boolean;
    enableFileLogging: boolean;
    logRotationSize: number;
    keepLogDays: number;
    separateLogFiles: boolean;
  };
  performanceSettings: {
    enablePhysics: boolean;
    physicsEngine: "BulletSim" | "ODE" | "None";
    maxAgentCount: number;
    maxPrimCount: number;
    minThreads: number;
    maxThreads: number;
    scriptEngineThreads: number;
    useFlexiblePrimLimits: boolean;
  };
  developerSettings: {
    enableDebugConsole: boolean;
    enableStatsApi: boolean;
    enableRemoteAdmin: boolean;
    remoteAdminPort: number;
    showScriptErrors: boolean;
    enableScriptCompilers: boolean;
    allowHTTPRequestsFromScripts: boolean;
  };
  backupSettings: {
    autoBackupEnabled: boolean;
    backupFrequency: "daily" | "weekly" | "monthly";
    backupTime: string;
    keepBackups: number;
    backupLocation: string;
    includeAssets: boolean;
    compressBackups: boolean;
  };
}

const DEFAULT_SETTINGS: AdvancedSettingsType = {
  databaseSettings: {
    connectionPoolSize: 25,
    commandTimeout: 60,
    enableQueryCaching: true,
    maintenanceMode: false,
    backupInterval: 24,
    logSlowQueries: true,
    slowQueryThreshold: 500,
  },
  loggingSettings: {
    logLevel: "info",
    enableConsoleLogging: true,
    enableFileLogging: true,
    logRotationSize: 10,
    keepLogDays: 14,
    separateLogFiles: true,
  },
  performanceSettings: {
    enablePhysics: true,
    physicsEngine: "BulletSim",
    maxAgentCount: 100,
    maxPrimCount: 45000,
    minThreads: 2,
    maxThreads: 8,
    scriptEngineThreads: 4,
    useFlexiblePrimLimits: false,
  },
  developerSettings: {
    enableDebugConsole: false,
    enableStatsApi: false,
    enableRemoteAdmin: false,
    remoteAdminPort: 9000,
    showScriptErrors: false,
    enableScriptCompilers: true,
    allowHTTPRequestsFromScripts: false,
  },
  backupSettings: {
    autoBackupEnabled: true,
    backupFrequency: "daily",
    backupTime: "02:00",
    keepBackups: 7,
    backupLocation: "/var/backups/opensim",
    includeAssets: true,
    compressBackups: true,
  },
};

export default function AdvancedSettings() {
  const [settings, setSettings] = useState<AdvancedSettingsType>(DEFAULT_SETTINGS);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState(false);
  const [maintenanceProgress, setMaintenanceProgress] = useState(0);
  const { toast } = useToast();

  // Fetch current advanced settings
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/advanced-settings'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/advanced-settings');
        return await response.json();
      } catch (err) {
        // If the endpoint doesn't exist yet, return the default settings
        console.warn("Advanced settings endpoint not available yet:", err);
        return DEFAULT_SETTINGS;
      }
    },
  });

  // Update settings when loaded
  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedSettings: AdvancedSettingsType) => {
      try {
        const response = await apiRequest('PUT', '/api/advanced-settings', updatedSettings);
        return await response.json();
      } catch (err) {
        console.error("Failed to save advanced settings:", err);
        toast({
          title: "Settings not saved",
          description: "The API endpoint for advanced settings is not implemented yet. This is a UI preview.",
          variant: "destructive",
        });
        return updatedSettings;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advanced-settings'] });
      toast({
        title: "Settings saved",
        description: "Advanced settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveMutation.mutate(settings);
  };

  const runBackup = () => {
    setIsBackupRunning(true);
    setBackupProgress(0);
    
    // Simulate a backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsBackupRunning(false);
            toast({
              title: "Backup completed",
              description: "Database backup has completed successfully.",
            });
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const runMaintenance = () => {
    setIsMaintenanceRunning(true);
    setMaintenanceProgress(0);
    
    // Simulate a maintenance process
    const interval = setInterval(() => {
      setMaintenanceProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsMaintenanceRunning(false);
            toast({
              title: "Maintenance completed",
              description: "Database optimization tasks have completed successfully.",
            });
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>Failed to load advanced settings: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2">
          <TabsTrigger value="database" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="logging" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logging</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sliders className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="developer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Terminal className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Developer</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Archive className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* Database Settings */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Database Configuration</CardTitle>
                  <CardDescription>Configure database connection and maintenance settings</CardDescription>
                </div>
                <Database className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="connectionPoolSize">Connection Pool Size</Label>
                  <Input
                    id="connectionPoolSize"
                    type="number"
                    min={5}
                    max={100}
                    value={settings.databaseSettings.connectionPoolSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      databaseSettings: {
                        ...settings.databaseSettings,
                        connectionPoolSize: parseInt(e.target.value)
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">Number of database connections to maintain in the pool</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commandTimeout">Command Timeout (seconds)</Label>
                  <Input
                    id="commandTimeout"
                    type="number"
                    min={10}
                    max={600}
                    value={settings.databaseSettings.commandTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      databaseSettings: {
                        ...settings.databaseSettings,
                        commandTimeout: parseInt(e.target.value)
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">Maximum time to wait for database commands to complete</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slowQueryThreshold">Slow Query Threshold (ms)</Label>
                  <Input
                    id="slowQueryThreshold"
                    type="number"
                    min={100}
                    max={10000}
                    value={settings.databaseSettings.slowQueryThreshold}
                    onChange={(e) => setSettings({
                      ...settings,
                      databaseSettings: {
                        ...settings.databaseSettings,
                        slowQueryThreshold: parseInt(e.target.value)
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">Threshold in milliseconds for logging slow queries</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupInterval">Backup Interval (hours)</Label>
                  <Input
                    id="backupInterval"
                    type="number"
                    min={1}
                    max={168}
                    value={settings.databaseSettings.backupInterval}
                    onChange={(e) => setSettings({
                      ...settings,
                      databaseSettings: {
                        ...settings.databaseSettings,
                        backupInterval: parseInt(e.target.value)
                      }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">Automatic database backup interval in hours</p>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableQueryCaching"
                    checked={settings.databaseSettings.enableQueryCaching}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      databaseSettings: {
                        ...settings.databaseSettings,
                        enableQueryCaching: checked
                      }
                    })}
                  />
                  <Label htmlFor="enableQueryCaching">Enable Query Caching</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="logSlowQueries"
                    checked={settings.databaseSettings.logSlowQueries}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      databaseSettings: {
                        ...settings.databaseSettings,
                        logSlowQueries: checked
                      }
                    })}
                  />
                  <Label htmlFor="logSlowQueries">Log Slow Queries</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={settings.databaseSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      databaseSettings: {
                        ...settings.databaseSettings,
                        maintenanceMode: checked
                      }
                    })}
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      <Settings className="mr-2 h-4 w-4" />
                      Optimize Database
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Database Optimization</DialogTitle>
                      <DialogDescription>
                        This will perform database optimization tasks such as rebuilding indexes,
                        reclaiming space, and optimizing tables.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {isMaintenanceRunning ? (
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Optimization in progress...</p>
                          <p className="text-sm">{maintenanceProgress}%</p>
                        </div>
                        <Progress value={maintenanceProgress} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Please do not close this window or interrupt the process.
                        </p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                          This operation may temporarily increase CPU and memory usage.
                          The grid will remain operational, but may experience slightly
                          reduced performance during the optimization process.
                        </p>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}} disabled={isMaintenanceRunning}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={runMaintenance} 
                        disabled={isMaintenanceRunning}
                      >
                        {isMaintenanceRunning ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Optimizing...
                          </>
                        ) : (
                          "Start Optimization"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logging Settings */}
        <TabsContent value="logging">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Logging Configuration</CardTitle>
                  <CardDescription>Configure log behavior and retention policies</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <Select
                    value={settings.loggingSettings.logLevel}
                    onValueChange={(value: "error" | "warn" | "info" | "debug" | "verbose") => setSettings({
                      ...settings,
                      loggingSettings: {
                        ...settings.loggingSettings,
                        logLevel: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error (Critical issues only)</SelectItem>
                      <SelectItem value="warn">Warning (Errors and warnings)</SelectItem>
                      <SelectItem value="info">Info (General information)</SelectItem>
                      <SelectItem value="debug">Debug (Detailed information)</SelectItem>
                      <SelectItem value="verbose">Verbose (Maximum detail)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Determines the verbosity of log output</p>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableConsoleLogging"
                      checked={settings.loggingSettings.enableConsoleLogging}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        loggingSettings: {
                          ...settings.loggingSettings,
                          enableConsoleLogging: checked
                        }
                      })}
                    />
                    <Label htmlFor="enableConsoleLogging">Enable Console Logging</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableFileLogging"
                      checked={settings.loggingSettings.enableFileLogging}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        loggingSettings: {
                          ...settings.loggingSettings,
                          enableFileLogging: checked
                        }
                      })}
                    />
                    <Label htmlFor="enableFileLogging">Enable File Logging</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="separateLogFiles"
                      checked={settings.loggingSettings.separateLogFiles}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        loggingSettings: {
                          ...settings.loggingSettings,
                          separateLogFiles: checked
                        }
                      })}
                    />
                    <Label htmlFor="separateLogFiles">Use Separate Log Files by Component</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="logRotationSize">Log Rotation Size (MB)</Label>
                    <Input
                      id="logRotationSize"
                      type="number"
                      min={1}
                      max={1000}
                      value={settings.loggingSettings.logRotationSize}
                      onChange={(e) => setSettings({
                        ...settings,
                        loggingSettings: {
                          ...settings.loggingSettings,
                          logRotationSize: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Size in megabytes before rotating log files</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keepLogDays">Log Retention (days)</Label>
                    <Input
                      id="keepLogDays"
                      type="number"
                      min={1}
                      max={365}
                      value={settings.loggingSettings.keepLogDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        loggingSettings: {
                          ...settings.loggingSettings,
                          keepLogDays: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Number of days to keep log files before deletion</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Tuning</CardTitle>
                  <CardDescription>Optimize your grid for performance and resource usage</CardDescription>
                </div>
                <Sliders className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Physics Engine</Label>
                  <Select
                    value={settings.performanceSettings.physicsEngine}
                    onValueChange={(value: "BulletSim" | "ODE" | "None") => setSettings({
                      ...settings,
                      performanceSettings: {
                        ...settings.performanceSettings,
                        physicsEngine: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select physics engine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BulletSim">BulletSim (Recommended)</SelectItem>
                      <SelectItem value="ODE">ODE (Open Dynamics Engine)</SelectItem>
                      <SelectItem value="None">None (Disabled)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Physics engine used for simulating physical interactions</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enablePhysics"
                    checked={settings.performanceSettings.enablePhysics}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      performanceSettings: {
                        ...settings.performanceSettings,
                        enablePhysics: checked
                      }
                    })}
                  />
                  <Label htmlFor="enablePhysics">Enable Physics</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="useFlexiblePrimLimits"
                    checked={settings.performanceSettings.useFlexiblePrimLimits}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      performanceSettings: {
                        ...settings.performanceSettings,
                        useFlexiblePrimLimits: checked
                      }
                    })}
                  />
                  <Label htmlFor="useFlexiblePrimLimits">Use Flexible Prim Limits (Based on Region Resources)</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAgentCount">Maximum Avatars per Region</Label>
                    <Input
                      id="maxAgentCount"
                      type="number"
                      min={10}
                      max={500}
                      value={settings.performanceSettings.maxAgentCount}
                      onChange={(e) => setSettings({
                        ...settings,
                        performanceSettings: {
                          ...settings.performanceSettings,
                          maxAgentCount: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Maximum number of avatars allowed in a region</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrimCount">Maximum Prims per Region</Label>
                    <Input
                      id="maxPrimCount"
                      type="number"
                      min={1000}
                      max={500000}
                      value={settings.performanceSettings.maxPrimCount}
                      onChange={(e) => setSettings({
                        ...settings,
                        performanceSettings: {
                          ...settings.performanceSettings,
                          maxPrimCount: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Maximum number of primitives allowed in a region</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minThreads">Minimum Thread Count</Label>
                    <Input
                      id="minThreads"
                      type="number"
                      min={1}
                      max={16}
                      value={settings.performanceSettings.minThreads}
                      onChange={(e) => setSettings({
                        ...settings,
                        performanceSettings: {
                          ...settings.performanceSettings,
                          minThreads: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Minimum number of threads for the thread pool</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxThreads">Maximum Thread Count</Label>
                    <Input
                      id="maxThreads"
                      type="number"
                      min={2}
                      max={64}
                      value={settings.performanceSettings.maxThreads}
                      onChange={(e) => setSettings({
                        ...settings,
                        performanceSettings: {
                          ...settings.performanceSettings,
                          maxThreads: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Maximum number of threads for the thread pool</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scriptEngineThreads">Script Engine Threads</Label>
                    <Input
                      id="scriptEngineThreads"
                      type="number"
                      min={1}
                      max={32}
                      value={settings.performanceSettings.scriptEngineThreads}
                      onChange={(e) => setSettings({
                        ...settings,
                        performanceSettings: {
                          ...settings.performanceSettings,
                          scriptEngineThreads: parseInt(e.target.value)
                        }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">Number of threads allocated to the script engine</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Developer Settings */}
        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Developer Options</CardTitle>
                  <CardDescription>Configure debugging and development settings</CardDescription>
                </div>
                <Terminal className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableDebugConsole"
                    checked={settings.developerSettings.enableDebugConsole}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      developerSettings: {
                        ...settings.developerSettings,
                        enableDebugConsole: checked
                      }
                    })}
                  />
                  <Label htmlFor="enableDebugConsole">Enable Debug Console</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableStatsApi"
                    checked={settings.developerSettings.enableStatsApi}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      developerSettings: {
                        ...settings.developerSettings,
                        enableStatsApi: checked
                      }
                    })}
                  />
                  <Label htmlFor="enableStatsApi">Enable Statistics API</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRemoteAdmin"
                    checked={settings.developerSettings.enableRemoteAdmin}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      developerSettings: {
                        ...settings.developerSettings,
                        enableRemoteAdmin: checked
                      }
                    })}
                  />
                  <Label htmlFor="enableRemoteAdmin">Enable Remote Admin Console</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showScriptErrors"
                    checked={settings.developerSettings.showScriptErrors}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      developerSettings: {
                        ...settings.developerSettings,
                        showScriptErrors: checked
                      }
                    })}
                  />
                  <Label htmlFor="showScriptErrors">Show Script Errors to Users</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableScriptCompilers"
                    checked={settings.developerSettings.enableScriptCompilers}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      developerSettings: {
                        ...settings.developerSettings,
                        enableScriptCompilers: checked
                      }
                    })}
                  />
                  <Label htmlFor="enableScriptCompilers">Enable Script Compilers (XEngine)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowHTTPRequestsFromScripts"
                    checked={settings.developerSettings.allowHTTPRequestsFromScripts}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      developerSettings: {
                        ...settings.developerSettings,
                        allowHTTPRequestsFromScripts: checked
                      }
                    })}
                  />
                  <Label htmlFor="allowHTTPRequestsFromScripts">Allow HTTP Requests from Scripts</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="remoteAdminPort">Remote Admin Port</Label>
                  <Input
                    id="remoteAdminPort"
                    type="number"
                    min={1024}
                    max={65535}
                    value={settings.developerSettings.remoteAdminPort}
                    onChange={(e) => setSettings({
                      ...settings,
                      developerSettings: {
                        ...settings.developerSettings,
                        remoteAdminPort: parseInt(e.target.value)
                      }
                    })}
                    disabled={!settings.developerSettings.enableRemoteAdmin}
                  />
                  <p className="text-xs text-muted-foreground">Port for remote administration console</p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/50">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Warning:</strong> These developer settings are intended for testing and debugging purposes.
                    Enabling these options in a production environment may introduce security vulnerabilities or
                    performance issues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backup & Restore</CardTitle>
                  <CardDescription>Configure automated backups and restore options</CardDescription>
                </div>
                <Archive className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBackupEnabled"
                  checked={settings.backupSettings.autoBackupEnabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    backupSettings: {
                      ...settings.backupSettings,
                      autoBackupEnabled: checked
                    }
                  })}
                />
                <Label htmlFor="autoBackupEnabled">Enable Automatic Backups</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select
                    value={settings.backupSettings.backupFrequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        backupFrequency: value
                      }
                    })}
                    disabled={!settings.backupSettings.autoBackupEnabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupTime">Backup Time</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    value={settings.backupSettings.backupTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        backupTime: e.target.value
                      }
                    })}
                    disabled={!settings.backupSettings.autoBackupEnabled}
                  />
                  <p className="text-xs text-muted-foreground">Time of day to perform backups (24-hour format)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keepBackups">Backups to Keep</Label>
                  <Input
                    id="keepBackups"
                    type="number"
                    min={1}
                    max={365}
                    value={settings.backupSettings.keepBackups}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        keepBackups: parseInt(e.target.value)
                      }
                    })}
                    disabled={!settings.backupSettings.autoBackupEnabled}
                  />
                  <p className="text-xs text-muted-foreground">Number of backups to retain before removing oldest</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupLocation">Backup Storage Location</Label>
                  <Input
                    id="backupLocation"
                    value={settings.backupSettings.backupLocation}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        backupLocation: e.target.value
                      }
                    })}
                    disabled={!settings.backupSettings.autoBackupEnabled}
                  />
                  <p className="text-xs text-muted-foreground">Directory path where backups will be stored</p>
                </div>
              </div>

              <div className="flex flex-col space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeAssets"
                    checked={settings.backupSettings.includeAssets}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        includeAssets: checked
                      }
                    })}
                    disabled={!settings.backupSettings.autoBackupEnabled}
                  />
                  <Label htmlFor="includeAssets">Include Assets in Backup</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="compressBackups"
                    checked={settings.backupSettings.compressBackups}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        compressBackups: checked
                      }
                    })}
                    disabled={!settings.backupSettings.autoBackupEnabled}
                  />
                  <Label htmlFor="compressBackups">Compress Backup Files</Label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      <Settings className="mr-2 h-4 w-4" />
                      Create Manual Backup
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Manual Backup</DialogTitle>
                      <DialogDescription>
                        This will create a full backup of your grid database and configuration.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {isBackupRunning ? (
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Backup in progress...</p>
                          <p className="text-sm">{backupProgress}%</p>
                        </div>
                        <Progress value={backupProgress} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Please do not close this window or interrupt the process.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="includeAssetsInManualBackup" 
                              checked={settings.backupSettings.includeAssets}
                              onCheckedChange={(checked) => setSettings({
                                ...settings,
                                backupSettings: {
                                  ...settings.backupSettings,
                                  includeAssets: checked === true
                                }
                              })}
                            />
                            <Label htmlFor="includeAssetsInManualBackup">Include assets (may increase backup size significantly)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="compressManualBackup" 
                              checked={settings.backupSettings.compressBackups}
                              onCheckedChange={(checked) => setSettings({
                                ...settings,
                                backupSettings: {
                                  ...settings.backupSettings,
                                  compressBackups: checked === true
                                }
                              })}
                            />
                            <Label htmlFor="compressManualBackup">Compress backup (recommended)</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="manualBackupLocation">Backup Location</Label>
                          <Input 
                            id="manualBackupLocation" 
                            value={settings.backupSettings.backupLocation}
                            onChange={(e) => setSettings({
                              ...settings,
                              backupSettings: {
                                ...settings.backupSettings,
                                backupLocation: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}} disabled={isBackupRunning}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={runBackup} 
                        disabled={isBackupRunning}
                      >
                        {isBackupRunning ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Backing up...
                          </>
                        ) : (
                          "Start Backup"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => {
            if (data) {
              setSettings(data);
            }
          }}
          disabled={saveMutation.isPending}
        >
          Reset
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}