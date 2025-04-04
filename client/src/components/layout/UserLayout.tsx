import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarById } from "@/lib/avatarTypes";
import { Home, Menu, Grid, User, HelpCircle, Settings, LogOut } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, children, active, onClick }: NavItemProps) {
  return (
    <li className="mt-2">
      <Link href={href}>
        <a
          className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all ${
            active ? "bg-gray-100 dark:bg-gray-900 text-primary font-medium" : ""
          }`}
          onClick={onClick}
        >
          {icon}
          <span>{children}</span>
        </a>
      </Link>
    </li>
  );
}

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? sidebarOpen
              ? "translate-x-0 fixed z-50"
              : "-translate-x-full fixed z-50"
            : "translate-x-0"
        } bg-white dark:bg-gray-950 w-64 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out h-screen overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="font-semibold text-xl text-primary">OpenSim Grid</div>
            <div className="text-sm text-gray-500">User Dashboard</div>
          </div>

          <nav className="p-4 flex-grow">
            <ul className="space-y-1">
              <NavItem
                href="/"
                icon={<Home className="h-5 w-5" />}
                active={location === "/"}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                My Dashboard
              </NavItem>
              <NavItem
                href="/my-regions"
                icon={<Grid className="h-5 w-5" />}
                active={location === "/my-regions"}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                My Regions
              </NavItem>
              <NavItem
                href="/account"
                icon={<User className="h-5 w-5" />}
                active={location === "/account"}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                Account
              </NavItem>
              <NavItem
                href="/help"
                icon={<HelpCircle className="h-5 w-5" />}
                active={location === "/help"}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                Help
              </NavItem>
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ""}`
                      : user?.username}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <a className="flex items-center gap-2 cursor-pointer w-full">
                        <User className="h-4 w-4" />
                        Profile
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-semibold">OpenSim Grid</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <a className="flex items-center gap-2 cursor-pointer w-full">
                      <User className="h-4 w-4" />
                      Profile
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-hidden p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}