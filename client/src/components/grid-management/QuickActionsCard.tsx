import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGridManager } from "@/hooks/useGridManager";
import { 
  PlusIcon, 
  RestartIcon, 
  UserIcon, 
  SettingsIcon,
  RocketIcon
} from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function QuickActionsCard() {
  const [, navigate] = useLocation();
  const { grid, startGrid, stopGrid, setIsAddRegionOpen, setIsSetupWizardOpen } = useGridManager();
  const { toast } = useToast();
  
  const handleRestartGrid = () => {
    if (!grid) return;
    
    if (grid.isRunning) {
      stopGrid(grid.id);
      setTimeout(() => {
        startGrid(grid.id);
      }, 2000);
      
      toast({
        title: "Grid restart initiated",
        description: "The grid is now restarting. This may take a few moments."
      });
    } else {
      startGrid(grid.id);
      toast({
        title: "Grid starting",
        description: "The grid is now starting up."
      });
    }
  };
  
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 bg-white border-b border-gray-200">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => setIsAddRegionOpen(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Region
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRestartGrid}
          >
            <RestartIcon className="mr-2 h-4 w-4" />
            {grid?.isRunning ? "Restart Grid" : "Start Grid"}
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/users")}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            Grid Settings
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSetupWizardOpen(true)}
          >
            <RocketIcon className="mr-2 h-4 w-4" />
            Grid Setup Wizard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
