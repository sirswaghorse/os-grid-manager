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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGridSchema } from "@shared/schema";
import { z } from "zod";
import { useGridManager } from "@/hooks/useGridManager";
import { RocketIcon, CheckIcon } from "@/lib/icons";

// Extend the grid schema with any additional validation
const formSchema = insertGridSchema.extend({});

type FormValues = z.infer<typeof formSchema>;

// Wizard steps
enum WizardStep {
  GridInfo = 0,
  Database = 1,
  Regions = 2,
  Complete = 3
}

export default function SetupWizardModal() {
  const { isSetupWizardOpen, setIsSetupWizardOpen, setupGrid, isSettingUpGrid } = useGridManager();
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.GridInfo);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nickname: "",
      adminEmail: "",
      externalAddress: window.location.hostname,
      status: "offline",
      port: 8000,
      externalPort: 8002,
      isRunning: false,
    }
  });
  
  const onSubmit = (data: FormValues) => {
    setupGrid(data);
  };
  
  const nextStep = () => {
    if (currentStep < WizardStep.Complete) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > WizardStep.GridInfo) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Render the correct step content
  const renderStepContent = () => {
    switch (currentStep) {
      case WizardStep.GridInfo:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gridName">Grid Name</Label>
              <Input 
                id="gridName" 
                className="mt-1" 
                placeholder="My OpenSim Grid"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gridNickname">Grid Nickname (Short Name)</Label>
              <Input 
                id="gridNickname" 
                className="mt-1" 
                placeholder="MYOSG"
                {...form.register("nickname")}
              />
              {form.formState.errors.nickname && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.nickname.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input 
                id="adminEmail" 
                className="mt-1" 
                placeholder="admin@example.com"
                type="email"
                {...form.register("adminEmail")}
              />
              {form.formState.errors.adminEmail && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.adminEmail.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gridAddress">Grid External Address</Label>
              <Input 
                id="gridAddress" 
                className="mt-1" 
                placeholder="grid.example.com"
                {...form.register("externalAddress")}
              />
              <p className="mt-1 text-xs text-gray-500">
                This is the address users will use to connect to your grid
              </p>
              {form.formState.errors.externalAddress && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.externalAddress.message}</p>
              )}
            </div>
          </div>
        );
        
      case WizardStep.Database:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dbType">Database Type</Label>
              <Input 
                id="dbType" 
                className="mt-1" 
                disabled
                value="SQLite (Default)"
              />
              <p className="mt-1 text-xs text-gray-500">
                SQLite is recommended for small grids. You can change this later in settings.
              </p>
            </div>
            <div>
              <Label htmlFor="gridPort">Grid Server Port</Label>
              <Input 
                id="gridPort" 
                className="mt-1" 
                type="number"
                {...form.register("port", { valueAsNumber: true })}
              />
              {form.formState.errors.port && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.port.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gridExternalPort">Grid External Port</Label>
              <Input 
                id="gridExternalPort" 
                className="mt-1" 
                type="number"
                {...form.register("externalPort", { valueAsNumber: true })}
              />
              {form.formState.errors.externalPort && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.externalPort.message}</p>
              )}
            </div>
          </div>
        );
        
      case WizardStep.Regions:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Default Region Setup</h4>
              <p className="text-sm text-blue-600">
                A default "Welcome Island" region will be created at coordinates 1000,1000 
                with size 256x256 when you complete this wizard.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                You can add more regions later from the Regions page.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-gray-100 w-32 h-32 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
                <div className="bg-blue-500 w-20 h-20 rounded flex items-center justify-center text-white font-medium">
                  Welcome Island
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">Welcome Island (1000, 1000)</p>
            </div>
          </div>
        );
        
      case WizardStep.Complete:
        return (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Create Your Grid
              </h3>
              <p className="text-sm text-gray-500">
                Click "Create Grid" to set up your OpenSimulator grid with the settings you've chosen.
                This process may take a few minutes to complete.
              </p>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-700">Grid Summary</h4>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Grid Name:</dt>
                  <dd className="text-gray-900">{form.getValues("name")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Grid Nickname:</dt>
                  <dd className="text-gray-900">{form.getValues("nickname")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Grid Address:</dt>
                  <dd className="text-gray-900">{form.getValues("externalAddress")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Default Region:</dt>
                  <dd className="text-gray-900">Welcome Island</dd>
                </div>
              </dl>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Get button text based on current step
  const getNextButtonText = () => {
    if (currentStep === WizardStep.Complete) {
      return isSettingUpGrid ? "Creating..." : "Create Grid";
    }
    return "Next";
  };
  
  // Handle final submission
  const handleNextOrSubmit = () => {
    if (currentStep === WizardStep.Complete) {
      form.handleSubmit(onSubmit)();
    } else {
      nextStep();
    }
  };
  
  return (
    <Dialog open={isSetupWizardOpen} onOpenChange={setIsSetupWizardOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RocketIcon className="mr-2 h-5 w-5 text-blue-500" />
            One-Click Grid Setup
          </DialogTitle>
          <DialogDescription>
            This wizard will help you set up your OpenSimulator grid with default settings.
            You can customize these settings later.
          </DialogDescription>
        </DialogHeader>
        
        {/* Wizard Steps Indicator */}
        <div className="flex justify-between mb-4">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full font-medium
              ${currentStep >= WizardStep.GridInfo 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700"}`}>
              1
            </div>
            <span className={`ml-2 text-sm font-medium
              ${currentStep >= WizardStep.GridInfo 
                ? "text-gray-900" 
                : "text-gray-500"}`}>
              Grid Info
            </span>
          </div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full font-medium
              ${currentStep >= WizardStep.Database 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700"}`}>
              2
            </div>
            <span className={`ml-2 text-sm font-medium
              ${currentStep >= WizardStep.Database 
                ? "text-gray-900" 
                : "text-gray-500"}`}>
              Database
            </span>
          </div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full font-medium
              ${currentStep >= WizardStep.Regions 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700"}`}>
              3
            </div>
            <span className={`ml-2 text-sm font-medium
              ${currentStep >= WizardStep.Regions 
                ? "text-gray-900" 
                : "text-gray-500"}`}>
              Regions
            </span>
          </div>
        </div>
        
        {/* Step Content */}
        <div className="my-4">
          {renderStepContent()}
        </div>
        
        <DialogFooter>
          {currentStep > WizardStep.GridInfo && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={isSettingUpGrid}
            >
              Back
            </Button>
          )}
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsSetupWizardOpen(false)}
            disabled={isSettingUpGrid}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleNextOrSubmit}
            disabled={isSettingUpGrid}
          >
            {getNextButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
