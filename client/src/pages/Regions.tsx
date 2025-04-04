import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/lib/icons";
import RegionsTable from "@/components/grid-management/RegionsTable";
import GridMap from "@/components/grid-management/GridMap";
import AddRegionModal from "@/components/grid-management/AddRegionModal";
import { useGridManager } from "@/hooks/useGridManager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

export default function Regions() {
  const { setIsAddRegionOpen } = useGridManager();
  const [activeTab, setActiveTab] = useState("list");
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Region Management</h1>
        <Button onClick={() => setIsAddRegionOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Region
        </Button>
      </div>
      
      <Tabs defaultValue="list" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <RegionsTable />
        </TabsContent>
        
        <TabsContent value="map">
          <GridMap />
        </TabsContent>
      </Tabs>
      
      <AddRegionModal />
    </>
  );
}
