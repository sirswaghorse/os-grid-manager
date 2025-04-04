import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import LoginPageSettings from "@/components/settings/LoginPageSettings";

export default function Settings() {
  return (
    <AppLayout>
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your OpenSimulator grid and user interface settings.
          </p>
          
          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="grid">Grid Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Appearance & Branding
                </h2>
                <p className="text-muted-foreground">
                  Customize how your grid appears to users. These settings affect
                  the login page and other user-facing interfaces.
                </p>
              </div>
              
              <LoginPageSettings />
            </TabsContent>
            
            <TabsContent value="grid" className="space-y-4">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Grid Configuration
                </h2>
                <p className="text-muted-foreground">
                  Configure technical settings for your OpenSimulator grid including
                  database connections, networking, and performance parameters.
                </p>
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/50">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    These settings are coming soon. They will allow customization of 
                    core grid parameters.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Security Settings
                </h2>
                <p className="text-muted-foreground">
                  Configure security policies, access controls, and authentication
                  settings for your grid.
                </p>
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/50">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Security settings configuration will be available in a future update.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Advanced Settings
                </h2>
                <p className="text-muted-foreground">
                  Configure advanced options for your grid. These settings are
                  intended for experienced users.
                </p>
                <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/50">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Advanced configuration options will be available in a future update.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}