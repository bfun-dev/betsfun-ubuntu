import { Button } from "@/components/ui/button";
import { useSubscriptionPurchase } from "@/hooks/useSubscriptionPurchase";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CreditCard, Check } from "lucide-react";

interface SubscriptionPurchaseButtonProps {
  planId: string;
  planName: string;
  price: number;
  className?: string;
}

export function SubscriptionPurchaseButton({ 
  planId, 
  planName, 
  price, 
  className 
}: SubscriptionPurchaseButtonProps) {
  const { user } = useAuth();
  const purchaseMutation = useSubscriptionPurchase();

  // Check if user has this subscription
  const { data: subscriptionStatus } = useQuery({
    queryKey: [`/api/user/subscriptions/${planId}/status`],
    enabled: !!user,
  });

  const userBalance = parseFloat(user?.balance || "0");
  const hasActiveSubscription = (subscriptionStatus as { hasActiveSubscription?: boolean })?.hasActiveSubscription;
  const canAfford = userBalance >= price;

  const handlePurchase = () => {
    purchaseMutation.mutate({ planId });
  };

  if (hasActiveSubscription) {
    return (
      <Button 
        variant="outline" 
        disabled
        className={className}
      >
        <Check className="w-4 h-4 mr-2" />
        Active
      </Button>
    );
  }

  return (
    <Button 
      onClick={handlePurchase}
      disabled={!canAfford || purchaseMutation.isPending}
      className={className}
      variant={canAfford ? "default" : "outline"}
    >
      {purchaseMutation.isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {canAfford ? `Buy for $${price}` : "Insufficient Balance"}
        </>
      )}
    </Button>
  );
}