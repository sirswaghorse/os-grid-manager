import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SecuritySettings as SecuritySettingsType } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Info, RefreshCw, Save, Lock, Shield } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SecuritySettings() {
  const [formState, setFormState] = useState<SecuritySettingsType>({
    requireEmailVerification: false,
    minimumPasswordLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: 5,
    accountLockoutDuration: 30,
    sessionTimeout: 120,
    twoFactorAuthEnabled: false,
    ipAccessRestriction: false,
    allowedIPs: [],
    captchaOnRegistration: true,
    captchaOnLogin: false,
    gridAccessRestriction: "open"
  });
  
  const [newIP, setNewIP] = useState("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Fetch current security settings
  const { data: securitySettings, isLoading, error } = useQuery<SecuritySettingsType>({
    queryKey: ['/api/security-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/security-settings');
      return await response.json();
    },
    enabled: true,
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: SecuritySettingsType) => {
      const response = await apiRequest('PUT', '/api/security-settings', settings);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security-settings'] });
      toast({
        title: "Settings updated",
        description: "Your security settings have been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update form state when settings are loaded
  useEffect(() => {
    if (securitySettings) {
      setFormState(securitySettings);
    }
  }, [securitySettings]);
  
  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formState);
  };
  
  const addIP = () => {
    if (!newIP.trim()) return;
    
    // Simple IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(newIP)) {
      toast({
        title: "Invalid IP address",
        description: "Please enter a valid IP address or CIDR range (e.g., 192.168.1.1 or 192.168.1.0/24)",
        variant: "destructive",
      });
      return;
    }
    
    setFormState(prev => ({
      ...prev,
      allowedIPs: [...prev.allowedIPs, newIP]
    }));
    setNewIP("");
  };
  
  const removeIP = (ip: string) => {
    setFormState(prev => ({
      ...prev,
      allowedIPs: prev.allowedIPs.filter(item => item !== ip)
    }));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>Failed to load security settings: {(error as Error).message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure user authentication and password requirements
              </CardDescription>
            </div>
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible defaultValue="authentication">
            <AccordionItem value="authentication">
              <AccordionTrigger>Authentication & Verification</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="requireEmailVerification" 
                    checked={formState.requireEmailVerification}
                    onCheckedChange={(checked) => setFormState(prev => ({
                      ...prev,
                      requireEmailVerification: checked === true
                    }))}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="requireEmailVerification" className="text-sm font-medium">
                      Require email verification
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 ml-1 inline-block text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80 text-xs">Users will be required to verify their email address before they can log in. A verification email will be sent when they register.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Users must verify their email address before accessing the grid
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="twoFactorAuthEnabled" 
                    checked={formState.twoFactorAuthEnabled}
                    onCheckedChange={(checked) => setFormState(prev => ({
                      ...prev, 
                      twoFactorAuthEnabled: checked === true
                    }))}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="twoFactorAuthEnabled" className="text-sm font-medium">
                      Enable two-factor authentication
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Users can enable two-factor authentication for their accounts
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="password">
              <AccordionTrigger>Password Requirements</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumPasswordLength">Minimum password length</Label>
                    <Input 
                      id="minimumPasswordLength"
                      type="number" 
                      min={6} 
                      max={30}
                      value={formState.minimumPasswordLength}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        minimumPasswordLength: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="passwordRequireUppercase" 
                    checked={formState.passwordRequireUppercase}
                    onCheckedChange={(checked) => setFormState(prev => ({
                      ...prev,
                      passwordRequireUppercase: checked === true
                    }))}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="passwordRequireUppercase" className="text-sm font-medium">
                      Require uppercase letters
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Passwords must contain at least one uppercase letter
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="passwordRequireSpecialChar" 
                    checked={formState.passwordRequireSpecialChar}
                    onCheckedChange={(checked) => setFormState(prev => ({
                      ...prev,
                      passwordRequireSpecialChar: checked === true
                    }))}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="passwordRequireSpecialChar" className="text-sm font-medium">
                      Require special characters
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Passwords must contain at least one special character (!@#$%^&*)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="passwordRequireNumbers" 
                    checked={formState.passwordRequireNumbers}
                    onCheckedChange={(checked) => setFormState(prev => ({
                      ...prev,
                      passwordRequireNumbers: checked === true
                    }))}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="passwordRequireNumbers" className="text-sm font-medium">
                      Require numbers
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Passwords must contain at least one number
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sessions">
              <AccordionTrigger>Session & Lockout Settings</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session timeout (minutes)</Label>
                    <Input 
                      id="sessionTimeout"
                      type="number" 
                      min={5} 
                      max={1440}
                      value={formState.sessionTimeout}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value)
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Users will be automatically logged out after this period of inactivity
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Maximum login attempts</Label>
                    <Input 
                      id="maxLoginAttempts"
                      type="number" 
                      min={1} 
                      max={20}
                      value={formState.maxLoginAttempts}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        maxLoginAttempts: parseInt(e.target.value)
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of failed login attempts before account is locked
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountLockoutDuration">Account lockout duration (minutes)</Label>
                    <Input 
                      id="accountLockoutDuration"
                      type="number" 
                      min={1} 
                      max={1440}
                      value={formState.accountLockoutDuration}
                      onChange={(e) => setFormState(prev => ({
                        ...prev,
                        accountLockoutDuration: parseInt(e.target.value)
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Duration for which accounts remain locked after exceeding maximum login attempts
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Access Controls</CardTitle>
              <CardDescription>
                Configure grid access rules and restrictions
              </CardDescription>
            </div>
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Grid Registration</Label>
            <Select 
              value={formState.gridAccessRestriction}
              onValueChange={(value) => setFormState(prev => ({
                ...prev,
                gridAccessRestriction: value as "open" | "invite_only" | "closed"
              }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select grid access mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Registration (Anyone can register)</SelectItem>
                <SelectItem value="invite_only">Invite Only (Requires invitation code)</SelectItem>
                <SelectItem value="closed">Closed (No new registrations)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls who can register new accounts on your grid
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="captchaOnRegistration" 
                checked={formState.captchaOnRegistration}
                onCheckedChange={(checked) => setFormState(prev => ({
                  ...prev,
                  captchaOnRegistration: checked === true
                }))}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="captchaOnRegistration" className="text-sm font-medium">
                  Enable CAPTCHA on registration
                </Label>
                <p className="text-xs text-muted-foreground">
                  Require CAPTCHA verification during account registration (helps prevent automated signups)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="captchaOnLogin" 
                checked={formState.captchaOnLogin}
                onCheckedChange={(checked) => setFormState(prev => ({
                  ...prev,
                  captchaOnLogin: checked === true
                }))}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="captchaOnLogin" className="text-sm font-medium">
                  Enable CAPTCHA on login
                </Label>
                <p className="text-xs text-muted-foreground">
                  Require CAPTCHA verification during login (helps prevent brute force attacks)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="ipAccessRestriction" 
                checked={formState.ipAccessRestriction}
                onCheckedChange={(checked) => setFormState(prev => ({
                  ...prev,
                  ipAccessRestriction: checked === true
                }))}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="ipAccessRestriction" className="text-sm font-medium">
                  Enable IP address restrictions
                </Label>
                <p className="text-xs text-muted-foreground">
                  Restrict grid access to specific IP addresses or ranges
                </p>
              </div>
            </div>

            {formState.ipAccessRestriction && (
              <div className="mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                <h4 className="text-sm font-medium mb-2">Allowed IP Addresses</h4>
                
                <div className="flex space-x-2 mb-4">
                  <Input 
                    placeholder="Enter IP address or CIDR range" 
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIP()}
                  />
                  <Button onClick={addIP} size="sm">Add</Button>
                </div>

                {formState.allowedIPs.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No IP restrictions configured</p>
                )}

                <ul className="space-y-2">
                  {formState.allowedIPs.map((ip) => (
                    <li key={ip} className="flex items-center justify-between py-1 px-2 bg-white dark:bg-slate-800 rounded">
                      <span className="text-sm font-mono">{ip}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => removeIP(ip)}
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => {
            if (securitySettings) {
              setFormState(securitySettings);
            }
            setIsEditing(false);
          }}
          disabled={!isEditing || updateSettingsMutation.isPending}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}