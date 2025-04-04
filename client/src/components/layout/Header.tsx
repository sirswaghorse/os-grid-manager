import { useState } from "react";
import { MenuIcon, BellIcon } from "@/lib/icons";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  title: string;
  onMobileMenuClick: () => void;
};

export default function Header({ title, onMobileMenuClick }: HeaderProps) {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button 
        type="button" 
        className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
        onClick={onMobileMenuClick}
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <button type="button" className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
          </button>
          
          <div className="ml-3 relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none">
                  <Avatar>
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
