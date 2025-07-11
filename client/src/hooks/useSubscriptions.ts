import { useQuery } from "@tanstack/react-query";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
  icon: string;
  color: string;
}

interface BundleSettings {
  price: number;
  discount: number;
  isActive: boolean;
}

interface SubscriptionData {
  plans: SubscriptionPlan[];
  bundle: BundleSettings;
}

export function useSubscriptions() {
  return useQuery<SubscriptionData>({
    queryKey: ["/api/subscriptions"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}