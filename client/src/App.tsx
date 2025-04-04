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
      
      {/* Admin-only routes */}
      <AdminRoute path="/users" component={AdminUsers} />
      <AdminRoute path="/settings" component={AdminSettings} />
      
      {/* User-only routes */}
      <UserRoute path="/my-regions" component={UserRegionsWithLayout} />
      <UserRoute path="/account" component={UserAccountWithLayout} />
      
      {/* Public routes without the layout */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
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
