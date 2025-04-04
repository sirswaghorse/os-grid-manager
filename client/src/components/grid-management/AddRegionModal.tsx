import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRegionSchema } from "@shared/schema";
import { z } from "zod";
import { useGridManager } from "@/hooks/useGridManager";
import { regionSizes, regionTemplates } from "@/lib/gridTypes";
import { PlusIcon } from "@/lib/icons";

const formSchema = insertRegionSchema.extend({
  // Add additional validation if needed
});

type FormValues = z.infer<typeof formSchema>;

export default function AddRegionModal() {
  const { isAddRegionOpen, setIsAddRegionOpen, grid, createRegion, getNextRegionPort, isCreatingRegion } = useGridManager();
  
  const nextPort = getNextRegionPort();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gridId: grid?.id || 1,
      positionX: 1000,
      positionY: 1000,
      sizeX: 256,
      sizeY: 256,
      port: nextPort,
      template: "empty",
      status: "offline",
    }
  });
  
  const onSubmit = (data: FormValues) => {
    // Make sure sizeY matches sizeX for square regions
    const regionData = {
      ...data,
      sizeY: data.sizeX,
    };
    
    createRegion(regionData);
  };
  
  // Handle region size change to keep X and Y the same
  const handleSizeChange = (value: string) => {
    const size = parseInt(value);
    form.setValue("sizeX", size);
    form.setValue("sizeY", size);
  };
  
  return (
    <Dialog open={isAddRegionOpen} onOpenChange={setIsAddRegionOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PlusIcon className="mr-2 h-5 w-5 text-blue-500" />
            Add New Region
          </DialogTitle>
          <DialogDescription>
            Configure your new region details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="regionName">Region Name</Label>
              <Input 
                id="regionName" 
                placeholder="My New Region"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationX">X Position</Label>
                <Input 
                  id="locationX" 
                  type="number" 
                  placeholder="1000"
                  {...form.register("positionX", { valueAsNumber: true })}
                />
                {form.formState.errors.positionX && (
                  <p className="text-sm text-red-500">{form.formState.errors.positionX.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationY">Y Position</Label>
                <Input 
                  id="locationY" 
                  type="number" 
                  placeholder="1000"
                  {...form.register("positionY", { valueAsNumber: true })}
                />
                {form.formState.errors.positionY && (
                  <p className="text-sm text-red-500">{form.formState.errors.positionY.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regionSize">Region Size</Label>
              <Select 
                onValueChange={handleSizeChange}
                defaultValue={form.getValues("sizeX").toString()}
              >
                <SelectTrigger id="regionSize">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {regionSizes.map(size => (
                    <SelectItem key={size.value} value={size.value.toString()}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.sizeX && (
                <p className="text-sm text-red-500">{form.formState.errors.sizeX.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regionPort">Region Port</Label>
              <Input 
                id="regionPort" 
                type="number" 
                placeholder="9000"
                {...form.register("port", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">
                Port numbers should be between 9000-9100 and unique for each region
              </p>
              {form.formState.errors.port && (
                <p className="text-sm text-red-500">{form.formState.errors.port.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regionTemplate">Region Template</Label>
              <Select 
                onValueChange={(value) => form.setValue("template", value)}
                defaultValue={form.getValues("template")}
              >
                <SelectTrigger id="regionTemplate">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {regionTemplates.map(template => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.template && (
                <p className="text-sm text-red-500">{form.formState.errors.template.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddRegionOpen(false)}
              disabled={isCreatingRegion}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isCreatingRegion}
            >
              {isCreatingRegion ? "Creating..." : "Create Region"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
