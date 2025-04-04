import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGridManager } from "@/hooks/useGridManager";
import { ZoomIcon } from "@/lib/icons";
import { calcPosition, calcSize, GRID_SIZE } from "@/lib/gridTypes";

export default function GridMap() {
  const { regions } = useGridManager();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 1000, y: 1000 });
  const gridContainerRef = useRef<HTMLDivElement>(null);
  
  const handleZoomIn = () => {
    if (zoomLevel < 2) {
      setZoomLevel(zoomLevel + 0.25);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(zoomLevel - 0.25);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gridContainerRef.current) return;
    
    const rect = gridContainerRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 1000) * 10;
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 1000) * 10;
    
    setMousePosition({ x, y });
  };
  
  // Generate grid cells for background
  const renderGridCells = () => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      cells.push(<div key={`cell-${i}`} className="grid-cell" />);
    }
    return cells;
  };
  
  // Get color for a region based on its name (for visual variety)
  const getRegionColor = (name: string) => {
    const colors = [
      "rgba(59, 130, 246, 0.7)", // Blue
      "rgba(16, 185, 129, 0.7)", // Green
      "rgba(245, 158, 11, 0.7)", // Amber
      "rgba(139, 92, 246, 0.7)"  // Purple
    ];
    
    const borderColors = [
      "#2563EB", // Blue border
      "#059669", // Green border
      "#D97706", // Amber border
      "#7C3AED"  // Purple border
    ];
    
    // Simple hash function to pick a consistent color for a region name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    
    return {
      background: colors[index],
      border: borderColors[index]
    };
  };
  
  return (
    <Card className="mt-6 bg-white rounded-lg shadow overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">
            Grid Map
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>-</Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIcon className="mr-1 h-4 w-4" />
              {Math.round(zoomLevel * 100)}%
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="grid-map-container overflow-x-auto">
          <div 
            ref={gridContainerRef}
            className="grid-map relative mx-auto" 
            style={{
              width: `${700 * zoomLevel}px`, 
              height: `${500 * zoomLevel}px`, 
              backgroundColor: "#F3F4F6", 
              border: "1px solid #E5E7EB",
              transformOrigin: "0 0"
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Grid lines */}
            <div className="grid-lines absolute inset-0">
              <div 
                id="gridContainer" 
                className="relative" 
                style={{ width: "100%", height: "100%" }}
              >
                {/* Grid background cells */}
                <div 
                  className="grid-background absolute" 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, 
                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`, 
                    width: "100%", 
                    height: "100%" 
                  }}
                >
                  {renderGridCells()}
                </div>
                
                {/* Render regions */}
                {regions && regions.map((region) => {
                  const width = region.sizeX;
                  const height = region.sizeY;
                  const left = region.positionX;
                  const top = region.positionY;
                  
                  const containerWidth = gridContainerRef.current?.clientWidth || 700;
                  const containerHeight = gridContainerRef.current?.clientHeight || 500;
                  
                  const colors = getRegionColor(region.name);
                  
                  return (
                    <div 
                      key={region.id}
                      className="absolute top-0 left-0 region" 
                      style={{
                        width: `${calcSize(width, containerWidth)}px`,
                        height: `${calcSize(height, containerHeight)}px`,
                        backgroundColor: colors.background,
                        border: `2px solid ${colors.border}`,
                        left: `${calcPosition(left, containerWidth)}px`,
                        top: `${calcPosition(top, containerHeight)}px`,
                      }}
                    >
                      <div className="p-1 text-xs text-white font-medium">
                        {region.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Map coordinates */}
            <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs">
              Coordinates: <span id="mouseCoordinates">{mousePosition.x}, {mousePosition.y}</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Click and drag regions to reposition. Click on a region to edit its properties.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
