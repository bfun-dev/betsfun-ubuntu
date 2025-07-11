import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Trophy, BarChart3, Crown, Zap, Brain, Check, Star } from "lucide-react";
import { BadgeIcon } from "@/lib/badge-icons";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { SubscriptionPurchaseButton } from "@/components/subscription-purchase-button";
import type { UserBadgeWithBadge } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("premium");
  const { data: subscriptionData, isLoading: subscriptionsLoading } = useSubscriptions();

  // Fetch user badges
  const { data: userBadges = [] } = useQuery<UserBadgeWithBadge[]>({
    queryKey: ['/api/user/badges', user?.id],
    enabled: !!user?.id,
  });

  const getUserDisplayName = () => {
    // Prioritize username if set (not system-generated)
    if (user?.username && !user.username.startsWith('user_')) {
      return user.username;
    }
    // Fall back to first name or email
    return user?.firstName || user?.email?.split('@')[0] || 'User';
  };

  if (!user) {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center ${isMobile ? 'ml-0 pb-20' : 'ml-12'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'ml-0 pb-20' : 'ml-12'}`}>
      <div className={`max-w-4xl mx-auto ${isMobile ? 'p-3' : 'p-6'}`}>
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'} gap-4`}>
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-10 w-10 text-primary" />
                </div>
                
                <div className={`flex-1 ${isMobile ? 'text-center' : ''}`}>
                  <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>
                    {getUserDisplayName()}
                  </h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  {user.firstName && user.lastName && (
                    <p className="text-sm text-muted-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                  )}
                </div>
                
                <div className={`flex ${isMobile ? 'flex-row gap-4' : 'flex-col'} items-center gap-2`}>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>
                      ${parseFloat(user.balance || '0').toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Balance</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-secondary`}>
                      {userBadges.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="premium" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Premium
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userBadges.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No badges earned yet</p>
                      <p className="text-sm text-muted-foreground">Start betting to earn your first achievement!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userBadges.map((userBadge) => (
                        <div
                          key={userBadge.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BadgeIcon iconName={userBadge.badge.icon} className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{userBadge.badge.name}</h4>
                            <p className="text-sm text-muted-foreground">{userBadge.badge.description}</p>
                            {userBadge.earnedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Premium Tab */}
            <TabsContent value="premium" className="space-y-4">
              {subscriptionsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subscriptionData?.plans?.map((plan) => {
                      const IconComponent = plan.icon === 'zap' ? Zap : Brain;
                      const colorClasses = plan.color === 'purple' 
                        ? {
                            border: 'border-gradient-to-r from-purple-500 to-pink-500',
                            bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
                            iconBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
                            badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                            buttonBg: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                          }
                        : {
                            border: 'border-gradient-to-r from-blue-500 to-cyan-500',
                            bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
                            iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                            badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                            buttonBg: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                          };

                      return (
                        <Card key={plan.id} className={`border-2 ${colorClasses.border} relative overflow-hidden`}>
                          <div className={`absolute inset-0 ${colorClasses.bg} opacity-50`}></div>
                          <CardHeader className="relative">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full ${colorClasses.iconBg} flex items-center justify-center`}>
                                  <IconComponent className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className={colorClasses.badgeBg}>
                                {plan.color === 'purple' ? 'Premium' : 'AI-Powered'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="relative space-y-4">
                            <div className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 border-t border-border/50">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="text-2xl font-bold text-foreground">${plan.price}</div>
                                  <div className="text-sm text-muted-foreground">per month</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-green-600 font-medium">
                                    {plan.color === 'purple' ? 'Save 20%' : 'Best Value'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {plan.color === 'purple' ? 'vs. per-market fees' : 'for AI features'}
                                  </div>
                                </div>
                              </div>
                              <SubscriptionPurchaseButton
                                planId={plan.id}
                                planName={plan.name}
                                price={plan.price}
                                className={`w-full ${colorClasses.buttonBg} text-white`}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Bundle Option */}
                  {subscriptionData?.bundle?.isActive && (
                    <Card className="border-2 border-gradient-to-r from-yellow-500 to-orange-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 opacity-50"></div>
                      <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                              <Star className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Ultimate Bundle</CardTitle>
                              <p className="text-sm text-muted-foreground">Everything you need to dominate prediction markets</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                            Best Deal
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-foreground mb-2">Includes everything from both plans:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {subscriptionData?.plans?.flatMap(plan => plan.features).map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-foreground">${subscriptionData.bundle.price}</div>
                                <div className="text-sm text-muted-foreground line-through">
                                  ${(subscriptionData?.plans?.reduce((sum, plan) => sum + plan.price, 0) || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">per month</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-green-600 font-medium">Save {subscriptionData.bundle.discount}%</div>
                              <div className="text-xs text-muted-foreground">vs. separate plans</div>
                            </div>
                          </div>
                          <SubscriptionPurchaseButton
                            planId="ultimate-bundle"
                            planName="Ultimate Bundle"
                            price={subscriptionData.bundle.price}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email || ""} 
                      disabled 
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed as it's managed by authentication
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={user.firstName || ""} 
                        disabled 
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={user.lastName || ""} 
                        disabled 
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <div className="text-sm text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}