import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "wouter";
import { 
  Sheet,
  SheetContent, 
} from "@/components/ui/sheet";

type AppLayoutProps = {
  children: React.ReactNode;
};

const getPageTitle = (path: string) => {
  switch (path) {
    case "/":
      return "Dashboard";
    case "/regions":
      return "Regions";
    case "/users":
      return "Users";
    case "/settings":
      return "Settings";
    case "/help":
      return "Help";
    default:
      return "Dashboard";
  }
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const title = getPageTitle(location);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header 
          title={title}
          onMobileMenuClick={() => setMobileMenuOpen(true)} 
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
