import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowUpDown, Search as SearchIcon, Calendar, Users, Loader2, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Region } from "@shared/schema";

export default function RegionSearch() {
  // State for search filters
  const [searchTerm, setSearchTerm] = useState("");
  const [regionType, setRegionType] = useState<string>("");
  const [maturity, setMaturity] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch all regions from the API
  const { data: regions, isLoading, isError } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
  });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filters are already applied through the filtered regions below
    toast({
      title: "Search filters applied",
      description: `Showing results for "${searchTerm || 'all regions'}"`,
      duration: 2000,
    });
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Filter and sort regions based on the current filters
  const filteredRegions = regions?.filter(region => {
    // Text search in name and description
    const matchesSearch = !searchTerm || 
      (region.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (region.description && region.description.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Filter by region type
    const matchesType = !regionType || region.regionType === regionType;
    
    // Filter by maturity rating
    const matchesMaturity = !maturity || region.maturity === maturity;
    
    return matchesSearch && matchesType && matchesMaturity;
  }).sort((a, b) => {
    // Sort by the selected field
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "visitCount":
        comparison = (a.visitCount || 0) - (b.visitCount || 0);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    // Apply sort order
    return sortOrder === "asc" ? comparison : -comparison;
  }) || [];

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    let variant = "outline";
    let className = "";
    
    switch (status) {
      case "online":
        className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        break;
      case "offline":
        className = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        break;
      case "restarting":
        className = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        break;
      default:
        className = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
    
    return (
      <Badge variant={variant as any} className={className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Region Search</CardTitle>
          <CardDescription>Discover regions on the grid</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Select value={regionType} onValueChange={setRegionType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Region Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={maturity} onValueChange={setMaturity}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Maturity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ratings</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button type="submit" className="w-full">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end items-center space-x-4">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="visitCount">Popularity</SelectItem>
                  <SelectItem value="createdAt">Date Added</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSortOrder} 
                className="h-9 px-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="ml-2">{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary/60" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-lg font-medium text-destructive">Error loading regions</p>
              <p className="text-muted-foreground mt-1">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredRegions.length === 0 ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-lg font-medium">No regions found</p>
              <p className="text-muted-foreground mt-1">Try adjusting your search filters</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRegions.map(region => (
            <Card key={region.id} className="overflow-hidden flex flex-col">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <CardTitle>{region.name}</CardTitle>
                  {renderStatusBadge(region.status)}
                </div>
                <div className="text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{region.positionX}, {region.positionY}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <p className="text-sm">{region.description}</p>
                
                <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{region.sizeX} × {region.sizeY}</span>
                  </div>
                  
                  {region.ownerName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span>{region.ownerName}</span>
                    </div>
                  )}
                  
                  {region.regionType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{region.regionType}</span>
                    </div>
                  )}
                  
                  {region.maturity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maturity:</span>
                      <span className="capitalize">{region.maturity}</span>
                    </div>
                  )}
                  
                  {region.visitCount !== undefined && region.visitCount !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>Visits:</span>
                      </span>
                      <span>{region.visitCount}</span>
                    </div>
                  )}
                  
                  {region.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Added:</span>
                      </span>
                      <span>{new Date(region.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <div className="px-6 pb-4 pt-2 mt-auto">
                <Button className="w-full" variant="secondary">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Region
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}