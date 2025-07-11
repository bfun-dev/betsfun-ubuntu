import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Star, 
  Zap, 
  Brain, 
  Save, 
  Edit, 
  Check, 
  X,
  DollarSign,
  Users,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

export default function SubscriptionsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  
  // Initial subscription data (this would normally come from an API)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([
    {
      id: "market-creator",
      name: "Market Creator Pro",
      price: 19.99,
      description: "Unlock unlimited market creation",
      features: [
        "Create unlimited prediction markets",
        "Advanced market customization",
        "Priority market listing",
        "Detailed creator analytics"
      ],
      isActive: true,
      icon: "zap",
      color: "purple"
    },
    {
      id: "ai-insights",
      name: "AI Insights Pro",
      price: 4.99,
      description: "Smart predictions powered by AI",
      features: [
        "AI-powered bet recommendations",
        "Market trend analysis",
        "Risk assessment tools",
        "Personalized betting strategies"
      ],
      isActive: true,
      icon: "brain",
      color: "blue"
    }
  ]);

  const [bundleSettings, setBundleSettings] = useState({
    price: 21.99,
    discount: 12,
    isActive: true
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (updatedPlan: SubscriptionPlan) => {
      const response = await fetch(`/api/admin/subscriptions/${updatedPlan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(updatedPlan),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update subscription plan");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
      setEditingPlan(null);
      // Invalidate both admin and public subscription caches
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    },
  });

  const updateBundleMutation = useMutation({
    mutationFn: async (bundleData: any) => {
      const response = await fetch("/api/admin/subscriptions/bundle", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(bundleData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update bundle settings");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bundle settings updated successfully",
      });
      // Invalidate both admin and public subscription caches
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bundle settings",
        variant: "destructive",
      });
    },
  });

  const handlePlanUpdate = (planId: string, field: string, value: any) => {
    setSubscriptionPlans(plans => 
      plans.map(plan => 
        plan.id === planId ? { ...plan, [field]: value } : plan
      )
    );
  };

  const handleFeatureUpdate = (planId: string, featureIndex: number, value: string) => {
    setSubscriptionPlans(plans => 
      plans.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              features: plan.features.map((feature, index) => 
                index === featureIndex ? value : feature
              )
            }
          : plan
      )
    );
  };

  const savePlan = (plan: SubscriptionPlan) => {
    updatePlanMutation.mutate(plan);
    // Update local storage to persist changes across components
    localStorage.setItem('subscription_plans', JSON.stringify(subscriptionPlans));
  };

  const saveBundle = () => {
    updateBundleMutation.mutate(bundleSettings);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="h-6 w-6 text-white" />;
      case "brain":
        return <Brain className="h-6 w-6 text-white" />;
      default:
        return <Star className="h-6 w-6 text-white" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "purple":
        return "from-purple-500 to-pink-500";
      case "blue":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage subscription plans, pricing, and features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active Subscribers: 127</span>
        </div>
      </div>

      {/* Subscription Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              <div className="text-2xl font-bold">$2,847</div>
            </div>
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">127</div>
            </div>
            <p className="text-xs text-muted-foreground">Active Subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              <div className="text-2xl font-bold">23</div>
            </div>
            <p className="text-xs text-muted-foreground">Bundle Subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getColorClasses(plan.color)} flex items-center justify-center`}>
                    {getIcon(plan.icon)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                  >
                    {editingPlan === plan.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingPlan === plan.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`price-${plan.id}`}>Price ($)</Label>
                      <Input
                        id={`price-${plan.id}`}
                        type="number"
                        step="0.01"
                        value={plan.price}
                        onChange={(e) => handlePlanUpdate(plan.id, 'price', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={plan.isActive}
                        onCheckedChange={(checked) => handlePlanUpdate(plan.id, 'isActive', checked)}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${plan.id}`}>Description</Label>
                    <Input
                      id={`description-${plan.id}`}
                      value={plan.description}
                      onChange={(e) => handlePlanUpdate(plan.id, 'description', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Features</Label>
                    <div className="space-y-2 mt-2">
                      {plan.features.map((feature, index) => (
                        <Input
                          key={index}
                          value={feature}
                          onChange={(e) => handleFeatureUpdate(plan.id, index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => savePlan(plan)}
                      disabled={updatePlanMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingPlan(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${plan.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">per month</span>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Bundle Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Ultimate Bundle Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bundle-price">Bundle Price ($)</Label>
              <Input
                id="bundle-price"
                type="number"
                step="0.01"
                value={bundleSettings.price}
                onChange={(e) => setBundleSettings({
                  ...bundleSettings,
                  price: parseFloat(e.target.value)
                })}
              />
            </div>
            <div>
              <Label htmlFor="bundle-discount">Discount (%)</Label>
              <Input
                id="bundle-discount"
                type="number"
                value={bundleSettings.discount}
                onChange={(e) => setBundleSettings({
                  ...bundleSettings,
                  discount: parseInt(e.target.value)
                })}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={bundleSettings.isActive}
                onCheckedChange={(checked) => setBundleSettings({
                  ...bundleSettings,
                  isActive: checked
                })}
              />
              <Label>Bundle Active</Label>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Bundle Preview</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Individual total: ${(subscriptionPlans[0].price + subscriptionPlans[1].price).toFixed(2)}
                </p>
                <p className="text-lg font-bold">Bundle price: ${bundleSettings.price.toFixed(2)}</p>
                <p className="text-sm text-green-600">Save {bundleSettings.discount}%</p>
              </div>
              <Button
                onClick={saveBundle}
                disabled={updateBundleMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Update Bundle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}