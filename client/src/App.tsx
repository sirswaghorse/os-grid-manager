import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import UserLayout from "@/components/layout/UserLayout";
import Dashboard from "@/pages/Dashboard";
import Regions from "@/pages/Regions";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import UserDashboard from "@/pages/UserDashboard";
import UserRegions from "@/pages/UserRegions";
import UserAccount from "@/pages/UserAccount";
import SplashPage from "@/pages/SplashPage";
import SplashPageView from "@/pages/SplashPageView";
import MarketplacePage from "@/pages/marketplace/MarketplacePage";
import ItemDetailPage from "@/pages/marketplace/ItemDetailPage";
import ItemFormPage from "@/pages/marketplace/ItemFormPage";
import InventoryPage from "@/pages/marketplace/InventoryPage";
import AddInventoryItemPage from "@/pages/marketplace/AddInventoryItemPage";
import MarketplaceAdminPage from "@/pages/marketplace/AdminPage";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Loader2 } from "lucide-react";

// Component to protect routes and redirect based on user role
function RoleBasedRoute({
  path,
  adminComponent: AdminComponent,
  userComponent: UserComponent,
}: {
  path: string;
  adminComponent: React.FC;
  userComponent: React.FC;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  // Render the appropriate component based on user role
  return (
    <Route path={path}>
      {user.isAdmin ? <AdminComponent /> : <UserComponent />}
    </Route>
  );
}

// Admin-only route that regular users can't access
function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.FC;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

// User-only route that admins shouldn't access
function UserRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.FC;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user || user.isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

// Admin dashboard wrapped with layout
const AdminDashboard = () => (
  <AppLayout>
    <Dashboard />
  </AppLayout>
);

// Admin regions page wrapped with layout
const AdminRegions = () => (
  <AppLayout>
    <Regions />
  </AppLayout>
);

// Admin users page wrapped with layout
const AdminUsers = () => (
  <AppLayout>
    <Users />
  </AppLayout>
);

// Admin settings page wrapped with layout
const AdminSettings = () => (
  <AppLayout>
    <Settings />
  </AppLayout>
);

// Admin splash page management wrapped with layout
const AdminSplashPage = () => (
  <AppLayout>
    <SplashPage />
  </AppLayout>
);

// Admin help page wrapped with layout
const AdminHelp = () => (
  <AppLayout>
    <Help />
  </AppLayout>
);

// User dashboard wrapped with layout
const UserDashboardWithLayout = () => (
  <UserLayout>
    <UserDashboard />
  </UserLayout>
);

// User regions page wrapped with layout
const UserRegionsWithLayout = () => (
  <UserLayout>
    <UserRegions />
  </UserLayout>
);

// User account page wrapped with layout
const UserAccountWithLayout = () => (
  <UserLayout>
    <UserAccount />
  </UserLayout>
);

// User help page wrapped with layout
const UserHelpWithLayout = () => (
  <UserLayout>
    <Help />
  </UserLayout>
);

// Create wrapped marketplace components
const AdminMarketplace = () => (
  <AppLayout>
    <MarketplacePage />
  </AppLayout>
);

const UserMarketplace = () => (
  <UserLayout>
    <MarketplacePage />
  </UserLayout>
);

const AdminMarketplaceManagement = () => (
  <AppLayout>
    <MarketplaceAdminPage />
  </AppLayout>
);

const UserInventoryPage = () => (
  <UserLayout>
    <InventoryPage />
  </UserLayout>
);

const UserAddInventoryPage = () => (
  <UserLayout>
    <AddInventoryItemPage />
  </UserLayout>
);

// Needs both layouts depending on user role
const ItemDetailWrapped = () => {
  const { user } = useAuth();
  
  if (user?.isAdmin) {
    return (
      <AppLayout>
        <ItemDetailPage />
      </AppLayout>
    );
  }
  
  return (
    <UserLayout>
      <ItemDetailPage />
    </UserLayout>
  );
};

// Needs both layouts depending on user role
const ItemFormWrapped = () => {
  const { user } = useAuth();
  
  if (user?.isAdmin) {
    return (
      <AppLayout>
        <ItemFormPage />
      </AppLayout>
    );
  }
  
  return (
    <UserLayout>
      <ItemFormPage />
    </UserLayout>
  );
};

function Router() {
  return (
    <Switch>
      {/* Role-based routes that render different content for admins and users */}
      <RoleBasedRoute 
        path="/" 
        adminComponent={AdminDashboard}
        userComponent={UserDashboardWithLayout}
      />
      
      <RoleBasedRoute 
        path="/regions" 
        adminComponent={AdminRegions}
        userComponent={UserRegionsWithLayout}
      />
      
      <RoleBasedRoute 
        path="/help" 
        adminComponent={AdminHelp}
        userComponent={UserHelpWithLayout}
      />
      
      <RoleBasedRoute 
        path="/marketplace" 
        adminComponent={AdminMarketplace}
        userComponent={UserMarketplace}
      />
      
      {/* Admin-only routes */}
      <AdminRoute path="/users" component={AdminUsers} />
      <AdminRoute path="/settings" component={AdminSettings} />
      <AdminRoute path="/splash-page" component={AdminSplashPage} />
      <AdminRoute path="/marketplace/admin" component={AdminMarketplaceManagement} />
      
      {/* User-only routes */}
      <UserRoute path="/my-regions" component={UserRegionsWithLayout} />
      <UserRoute path="/account" component={UserAccountWithLayout} />
      <UserRoute path="/marketplace/inventory" component={UserInventoryPage} />
      <UserRoute path="/marketplace/add-inventory" component={UserAddInventoryPage} />
      
      {/* Protected routes (accessible to both users and admins) */}
      <ProtectedRoute path="/marketplace/item/:id" component={ItemDetailWrapped} />
      <ProtectedRoute path="/marketplace/create" component={ItemFormWrapped} />
      <ProtectedRoute path="/marketplace/edit/:id" component={ItemFormWrapped} />
      
      {/* Public routes without the layout */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/splash" component={SplashPageView} />
      
      {/* 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
