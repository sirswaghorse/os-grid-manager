import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, Home, MapPin, Search, Server, Coins } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import RegionSearch from "@/components/regions/RegionSearch";
import CurrencyPurchase from "@/components/currency/CurrencyPurchase";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}!
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" />
            <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user?.username}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions">My Regions</TabsTrigger>
          <TabsTrigger value="search">Find Regions</TabsTrigger>
          <TabsTrigger value="currency">
            <Coins className="h-4 w-4 mr-1" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="inventory" className="hidden lg:block">Inventory</TabsTrigger>
          <TabsTrigger value="account" className="hidden lg:block">My Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Grid Status</CardTitle>
                <CardDescription>Current grid statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground flex items-center">
                    <Server className="h-4 w-4 mr-2" />
                    <span>Grid Status:</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Total Regions:</span>
                  </div>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    <span>Your Regions:</span>
                  </div>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Last Login:</span>
                  </div>
                  <span className="font-medium">Today, 9:42 AM</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Links</CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <a href="#" className="py-2 px-3 bg-primary/10 hover:bg-primary/20 rounded-md text-center text-sm transition-colors">
                    Buy Region
                  </a>
                  <a href="#" className="py-2 px-3 bg-primary/10 hover:bg-primary/20 rounded-md text-center text-sm transition-colors">
                    View Regions
                  </a>
                  <a href="#" className="py-2 px-3 bg-primary/10 hover:bg-primary/20 rounded-md text-center text-sm transition-colors">
                    Marketplace
                  </a>
                  <a href="#" className="py-2 px-3 bg-primary/10 hover:bg-primary/20 rounded-md text-center text-sm transition-colors">
                    Grid Map
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Announcements</CardTitle>
                <CardDescription>Latest grid news</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm">Spring Festival</h4>
                  <p className="text-sm text-muted-foreground">Join us this weekend for the Spring Festival at Event Plaza!</p>
                  <p className="text-xs text-muted-foreground mt-1">Posted 1 day ago</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm">Grid Update</h4>
                  <p className="text-sm text-muted-foreground">Grid maintenance scheduled for Friday night. Expect 2 hours of downtime.</p>
                  <p className="text-xs text-muted-foreground mt-1">Posted 3 days ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Explore Popular Regions</CardTitle>
              <CardDescription>Discover interesting places on the grid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <h3 className="font-semibold">Welcome Island</h3>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>1000, 1000</span>
                  </div>
                  <p className="text-sm mt-2">The first landing point for new visitors to the grid</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <h3 className="font-semibold">Market Plaza</h3>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>1000, 1256</span>
                  </div>
                  <p className="text-sm mt-2">Central marketplace for shopping and trading</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <h3 className="font-semibold">Events Center</h3>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>1512, 1000</span>
                  </div>
                  <p className="text-sm mt-2">Venue for grid-wide events and gatherings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Regions</CardTitle>
              <CardDescription>Manage your virtual lands</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium">You don't own any regions yet</h3>
                <p className="text-muted-foreground mt-2">Purchase your first region to start building your virtual presence on the grid.</p>
                <div className="mt-6">
                  <a href="#" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Purchase Region
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="search">
          <RegionSearch />
        </TabsContent>
        
        <TabsContent value="currency">
          <CurrencyPurchase />
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Inventory</CardTitle>
              <CardDescription>Manage your virtual items</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium">Your inventory appears empty</h3>
                <p className="text-muted-foreground mt-2">Visit the marketplace to purchase items or upload your own creations.</p>
                <div className="mt-6">
                  <a href="#" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Go to Marketplace
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" htmlFor="username">Username</label>
                    <input 
                      id="username"
                      type="text" 
                      disabled 
                      value={user?.username || ""}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium" htmlFor="email">Email</label>
                    <input 
                      id="email"
                      type="email" 
                      disabled 
                      value={user?.email || ""}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
                    <input 
                      id="firstName"
                      type="text" 
                      disabled 
                      value={user?.firstName || ""}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
                    <input 
                      id="lastName"
                      type="text" 
                      disabled 
                      value={user?.lastName || ""}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    To update your account information, please contact the grid administrator.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}