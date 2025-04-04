import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { DashboardIcon, GridIcon, UserIcon, SettingsIcon, HelpIcon } from "@/lib/icons";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
};

const NavItem = ({ href, icon, children, isActive }: NavItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
          isActive
            ? "bg-primary text-white"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <span className="mr-3 text-lg">{icon}</span>
        {children}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  
  // Fetch grid status
  const { data: grid } = useQuery({
    queryKey: ['/api/grids/1'],
  });

  const isOnline = grid?.status === "online";
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <GridIcon className="h-8 w-auto text-primary" />
            <h1 className="ml-2 text-xl font-semibold text-gray-800">Grid Manager</h1>
          </div>
          
          <div className="mt-6 flex-grow flex flex-col">
            <nav className="flex-1 px-2 bg-white space-y-1">
              <NavItem 
                href="/" 
                icon={<DashboardIcon />}
                isActive={location === '/'}
              >
                Dashboard
              </NavItem>
              
              <NavItem 
                href="/regions" 
                icon={<GridIcon />}
                isActive={location === '/regions'}
              >
                Regions
              </NavItem>
              
              <NavItem 
                href="/users" 
                icon={<UserIcon />}
                isActive={location === '/users'}
              >
                Users
              </NavItem>
              
              <NavItem 
                href="/settings" 
                icon={<SettingsIcon />}
                isActive={location === '/settings'}
              >
                Settings
              </NavItem>
              
              <NavItem 
                href="/help" 
                icon={<HelpIcon />}
                isActive={location === '/help'}
              >
                Help
              </NavItem>
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Grid Status
                  </p>
                  <div className="flex items-center">
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full mr-2",
                      isOnline ? "bg-green-500" : "bg-red-500"
                    )}></div>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
