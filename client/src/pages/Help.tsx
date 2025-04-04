import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Help() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help & Documentation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Learn how to use the OpenSimulator Grid Manager
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get your grid up and running</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Learn how to set up your first grid and create regions.
            </p>
            <a 
              href="#quickstart"
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Read the guide &rarr;
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Region Management</CardTitle>
            <CardDescription>Create and manage regions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Learn how to add, edit, and delete regions in your grid.
            </p>
            <a 
              href="#regions"
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Read the guide &rarr;
            </a>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage grid users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Learn how to create and manage user accounts for your grid.
            </p>
            <a 
              href="#users"
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Read the guide &rarr;
            </a>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                What is OpenSimulator?
              </AccordionTrigger>
              <AccordionContent>
                OpenSimulator is an open source multi-platform, multi-user 3D application server. It can be used
                to create a virtual environment (or world) which can be accessed through a variety of clients,
                on multiple protocols. It allows virtual world creators to customize their worlds using the
                technologies they feel work best.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>
                What is a grid?
              </AccordionTrigger>
              <AccordionContent>
                A grid is a collection of regions (virtual land parcels) that are connected together to form a
                larger virtual world. Grids can be standalone or connected to other grids via the hypergrid protocol.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>
                How do I connect to my grid?
              </AccordionTrigger>
              <AccordionContent>
                You can connect to your grid using any compatible viewer client such as Firestorm, Kokua, or Singularity.
                In the viewer, go to the Grid Manager and add your grid's login URI (http://your-grid-address:port)
                and then log in with your avatar credentials.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>
                What are the system requirements?
              </AccordionTrigger>
              <AccordionContent>
                OpenSimulator can run on most modern systems with at least 4GB of RAM. Each region requires
                approximately 256MB of RAM. For the best performance, we recommend a system with a multi-core
                processor, 8GB+ of RAM, and an SSD for storage.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>
                How do I back up my grid?
              </AccordionTrigger>
              <AccordionContent>
                You can create backups of your grid using the Backup & Restore tab in the Settings page.
                This will create a full backup of your grid including all regions and user data. You can also
                schedule automatic backups to run on a regular basis.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card id="quickstart">
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Getting your grid up and running in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Step 1: One-Click Setup</h3>
            <p className="text-sm text-gray-600">
              Click the "One-Click Grid Setup" button on the Dashboard. This will open the setup wizard
              that will guide you through creating your first grid.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Step 2: Enter Grid Information</h3>
            <p className="text-sm text-gray-600">
              Enter your grid name, short name (nickname), admin email, and the external address that
              users will use to connect to your grid.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Step 3: Configuration</h3>
            <p className="text-sm text-gray-600">
              Configure your database settings. For most users, the default SQLite database is sufficient.
              You can also customize port settings if needed.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Step 4: Region Setup</h3>
            <p className="text-sm text-gray-600">
              A default Welcome Island region will be created. You can add more regions later from the
              Regions page.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Step 5: Complete Setup</h3>
            <p className="text-sm text-gray-600">
              Review your settings and click "Create Grid" to finish the setup process. The grid will
              start automatically once setup is complete.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Step 6: Connect to Your Grid</h3>
            <p className="text-sm text-gray-600">
              Use a compatible viewer like Firestorm to connect to your grid. Add your grid's login URI
              (http://your-grid-address:port) in the Grid Manager and log in with the admin credentials.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
