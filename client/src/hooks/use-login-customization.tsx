import { useQuery, useMutation } from "@tanstack/react-query";
import { LoginCustomization } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useLoginCustomization() {
  const { toast } = useToast();

  const {
    data: customization,
    isLoading,
    error,
  } = useQuery<LoginCustomization>({
    queryKey: ["/api/login-customization"],
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: async (newCustomization: LoginCustomization) => {
      const response = await apiRequest("PUT", "/api/login-customization", newCustomization);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-customization"] });
      toast({
        title: "Login page updated",
        description: "The login page customization has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    customization,
    isLoading,
    error,
    updateCustomization: (data: LoginCustomization) => updateMutation.mutate(data),
    isUpdating: updateMutation.isPending,
  };
}