import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useLoginCustomization } from "@/hooks/use-login-customization";
import { loginCustomizationSchema, LoginCustomization } from "@shared/schema";

export default function LoginPageSettings() {
  const [activeTab, setActiveTab] = useState<string>("text");
  
  const {
    customization,
    isLoading,
    updateCustomization,
    isUpdating
  } = useLoginCustomization();
  
  const form = useForm<LoginCustomization>({
    resolver: zodResolver(loginCustomizationSchema),
    defaultValues: {
      displayType: "text",
      textValue: "OpenSimulator Grid Manager",
      imageUrl: ""
    }
  });
  
  // Update form when customization data is loaded
  useEffect(() => {
    if (customization) {
      form.reset(customization);
      setActiveTab(customization.displayType);
    }
  }, [customization, form]);
  
  const onSubmit = (data: LoginCustomization) => {
    updateCustomization(data);
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Login Page Customization</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Login Page Customization</CardTitle>
        <CardDescription>
          Customize how the login page appears to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Display Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setActiveTab(value);
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="text" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Text: Display a customizable text title
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="image" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Image: Display a logo image
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Settings</TabsTrigger>
                <TabsTrigger value="image">Image Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="textValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title Text</FormLabel>
                      <FormControl>
                        <Input placeholder="OpenSimulator Grid Manager" {...field} />
                      </FormControl>
                      <FormDescription>
                        This text will be displayed as the main title on the login page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                  <h3 className="mb-2 text-sm font-medium">Preview:</h3>
                  <div className="rounded-md border border-border bg-white p-6 dark:bg-slate-950">
                    <h1 className="text-2xl font-bold text-center text-primary">
                      {form.watch("textValue") || "OpenSimulator Grid Manager"}
                    </h1>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="image" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/logo.png" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the URL of your logo image. For best results, use a PNG or SVG with transparent background.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("imageUrl") && (
                  <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-900">
                    <h3 className="mb-2 text-sm font-medium">Preview:</h3>
                    <div className="rounded-md border border-border bg-white p-6 flex justify-center dark:bg-slate-950">
                      <img 
                        src={form.watch("imageUrl")} 
                        alt="Logo Preview" 
                        className="max-h-24 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.alt = "Invalid image URL";
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}