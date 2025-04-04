import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useGridManager } from "@/hooks/useGridManager";

export default function Settings() {
  const { grid } = useGridManager();
  
  const handleSaveBasicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would update grid settings
  };
  
  const handleSaveAdvancedSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would update advanced settings
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grid Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure your OpenSimulator grid settings
        </p>
      </div>
      
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <form onSubmit={handleSaveBasicSettings}>
              <CardHeader>
                <CardTitle>Basic Grid Settings</CardTitle>
                <CardDescription>
                  Update your grid's basic configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gridName">Grid Name</Label>
                  <Input 
                    id="gridName" 
                    defaultValue={grid?.name || ""} 
                    placeholder="My OpenSim Grid" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gridNickname">Grid Nickname</Label>
                  <Input 
                    id="gridNickname" 
                    defaultValue={grid?.nickname || ""} 
                    placeholder="MYOSG" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input 
                    id="adminEmail" 
                    type="email"
                    defaultValue={grid?.adminEmail || ""} 
                    placeholder="admin@example.com" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="externalAddress">External Address</Label>
                  <Input 
                    id="externalAddress" 
                    defaultValue={grid?.externalAddress || ""} 
                    placeholder="grid.example.com" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea 
                    id="welcomeMessage" 
                    placeholder="Welcome to our OpenSimulator grid!" 
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <form onSubmit={handleSaveAdvancedSettings}>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  These settings are for advanced users. Change them carefully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gridPort">Grid Port</Label>
                    <Input 
                      id="gridPort" 
                      type="number"
                      defaultValue={grid?.port || 8000}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="externalPort">External Port</Label>
                    <Input 
                      id="externalPort" 
                      type="number"
                      defaultValue={grid?.externalPort || 8002}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="databaseConnection">Database Connection String</Label>
                  <Input 
                    id="databaseConnection" 
                    placeholder="SQLite URI or other connection string" 
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="allowGuestMode" />
                  <Label htmlFor="allowGuestMode">Allow Guest Access</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enableVoice" />
                  <Label htmlFor="enableVoice">Enable Voice Chat</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enableHypergrid" />
                  <Label htmlFor="enableHypergrid">Enable Hypergrid</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">Save Advanced Settings</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>
                Create backups of your grid or restore from a previous backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Create Backup</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">Create Full Backup</Button>
                  <Button variant="outline" className="flex-1">Backup Regions Only</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Restore From Backup</Label>
                <div className="flex space-x-2">
                  <Input type="file" />
                  <Button variant="outline">Upload</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Backup Schedule</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="autoBackup" />
                  <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
