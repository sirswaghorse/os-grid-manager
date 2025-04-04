import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/gridTypes";
import { useGridManager } from "@/hooks/useGridManager";
import { useState } from "react";
import { 
  EditIcon, 
  RestartIcon, 
  TrashIcon,
  SearchIcon
} from "@/lib/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RegionsTable() {
  const { regions, areRegionsLoading, deleteRegion, restartRegion } = useGridManager();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Filter regions based on search term
  const filteredRegions = regions?.filter(region => 
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteClick = (regionId: number) => {
    setSelectedRegionId(regionId);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedRegionId !== null) {
      deleteRegion(selectedRegionId);
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <>
      <Card className="bg-white rounded-lg shadow overflow-hidden">
        <CardHeader className="px-4 py-5 sm:px-6 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg leading-6 font-medium text-gray-900">
              Region Management
            </CardTitle>
            <div className="relative">
              <div className="flex items-center">
                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  type="text"
                  placeholder="Search regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areRegionsLoading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRegions && filteredRegions.length > 0 ? (
                  // Render regions
                  filteredRegions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium">{region.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(region.status)}>{region.status}</Badge>
                      </TableCell>
                      <TableCell>{region.sizeX}x{region.sizeY}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="text-primary hover:text-blue-700">
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-primary hover:text-blue-700"
                            onClick={() => restartRegion(region.id)}
                          >
                            <RestartIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteClick(region.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // No regions found
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      {searchTerm ? (
                        <p>No regions matching "{searchTerm}"</p>
                      ) : (
                        <p>No regions found. Create your first region using the "Add New Region" button.</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog for region deletion */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the region
              and remove its data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Yes, delete region
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
