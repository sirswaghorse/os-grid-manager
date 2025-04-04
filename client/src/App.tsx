import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Regions from "@/pages/Regions";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Protected routes with the layout */}
      <ProtectedRoute 
        path="/" 
        component={() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/regions" 
        component={() => (
          <AppLayout>
            <Regions />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/users" 
        component={() => (
          <AppLayout>
            <Users />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/settings" 
        component={() => (
          <AppLayout>
            <Settings />
          </AppLayout>
        )} 
      />
      <ProtectedRoute 
        path="/help" 
        component={() => (
          <AppLayout>
            <Help />
          </AppLayout>
        )} 
      />
      
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
