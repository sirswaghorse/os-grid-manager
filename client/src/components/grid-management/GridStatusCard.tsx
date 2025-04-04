import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGridManager } from "@/hooks/useGridManager";

export default function GridStatusCard() {
  const { grid, regions, isGridLoading, areRegionsLoading } = useGridManager();
  
  const getOnlineRegions = () => {
    if (!regions) return 0;
    return regions.filter(region => region.status === "online").length;
  };
  
  const getActiveUsers = () => {
    // This would normally come from an API call to get active users
    // For this implementation, we'll return a mock value
    return 12;
  };
  
  const getMemoryUsage = () => {
    // This would normally come from an API call to get memory usage
    // For this implementation, we'll return a mock value
    return "65%";
  };
  
  const getUptime = () => {
    // This would normally be calculated based on the grid's lastStarted value
    // For this implementation, we'll return a mock value
    return "3d 7h";
  };
  
  return (
    <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary to-blue-500">
        <h3 className="text-lg leading-6 font-medium text-white">
          Grid Status
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <CardContent className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Active Regions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {isGridLoading || areRegionsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                getOnlineRegions()
              )}
            </dd>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <CardContent className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Active Users
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {isGridLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                getActiveUsers()
              )}
            </dd>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <CardContent className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Memory Usage
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {isGridLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                getMemoryUsage()
              )}
            </dd>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden shadow rounded-lg">
          <CardContent className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Uptime
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {isGridLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                getUptime()
              )}
            </dd>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
