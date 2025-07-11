import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PurchaseSubscriptionData {
  planId: string;
}

interface PurchaseResponse {
  message: string;
  subscription: {
    id: number;
    userId: string;
    planId: string;
    isActive: boolean;
    purchasedAt: string;
    expiresAt: string;
    price: string;
    planName: string;
  };
}

export function useSubscriptionPurchase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<PurchaseResponse, Error, PurchaseSubscriptionData>({
    mutationFn: async (data) => {
      const response = await fetch("/api/subscriptions/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to purchase subscription");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `You now have access to ${data.subscription.planName}`,
      });
      
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase subscription",
        variant: "destructive",
      });
    },
  });
}