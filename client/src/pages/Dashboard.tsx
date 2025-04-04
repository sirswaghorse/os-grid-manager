import { Button } from "@/components/ui/button";
import { RocketIcon } from "@/lib/icons";
import GridStatusCard from "@/components/grid-management/GridStatusCard";
import QuickActionsCard from "@/components/grid-management/QuickActionsCard";
import RegionsTable from "@/components/grid-management/RegionsTable";
import GridMap from "@/components/grid-management/GridMap";
import AddRegionModal from "@/components/grid-management/AddRegionModal";
import SetupWizardModal from "@/components/grid-management/SetupWizardModal";
import { useGridManager } from "@/hooks/useGridManager";

export default function Dashboard() {
  const { setIsSetupWizardOpen } = useGridManager();
  
  return (
    <>
      {/* Setup wizard button at the top */}
      <div className="mb-6">
        <Button
          onClick={() => setIsSetupWizardOpen(true)}
        >
          <RocketIcon className="mr-2 h-4 w-4" />
          One-Click Grid Setup
        </Button>
      </div>
      
      {/* Grid Status Card */}
      <GridStatusCard />
      
      {/* Quick Actions and Region Management */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuickActionsCard />
        <RegionsTable />
      </div>
      
      {/* Grid Map Visualization */}
      <GridMap />
      
      {/* Modals */}
      <AddRegionModal />
      <SetupWizardModal />
    </>
  );
}
