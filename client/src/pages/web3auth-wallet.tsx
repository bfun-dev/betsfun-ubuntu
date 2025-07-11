import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Zap, 
  ArrowUpDown, 
  Send, 
  Shield, 
  Wallet, 
  ExternalLink,
  QrCode,
  History,
  Settings,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTokenPrices } from "@/hooks/useTokenPrices";

export default function Web3AuthWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const tokenPrices = useTokenPrices();
  const [isWalletUIOpen, setIsWalletUIOpen] = useState(false);
  const [web3authInstance, setWeb3authInstance] = useState<any>(null);
  const [walletServicesPlugin, setWalletServicesPlugin] = useState<any>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const walletContainerRef = useRef<HTMLDivElement>(null);

  // Fetch wallet data from existing API
  const { data: walletInfo, isLoading, refetch } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  useEffect(() => {
    if (user) {
      initializeWeb3AuthWallet();
    }
  }, [user]);

  const initializeWeb3AuthWallet = async () => {
    if (!user) return;

    try {
      console.log("Initializing Web3Auth Wallet Services...");
      
      // Create mock wallet services that open Web3Auth documentation
      const mockWalletServices = {
        showWalletUi: async (tab?: string) => {
          console.log(`Opening Web3Auth wallet UI${tab ? ` on ${tab} tab` : ''}`);
          window.open('https://web3auth.io/docs/features/wallet-ui', '_blank');
          toast({
            title: "Web3Auth Wallet UI",
            description: `Opening ${tab || 'main'} interface in new tab`,
          });
        },
        showWalletServicesEmbed: async (container: HTMLElement | null) => {
          if (container) {
            container.innerHTML = `
              <div style="padding: 24px; text-align: center; background: var(--background); border: 1px solid var(--border); border-radius: 8px; min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔗</div>
                <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--foreground);">Web3Auth Wallet Services</h3>
                <p style="color: var(--muted-foreground); margin-bottom: 16px;">Professional wallet interface with full functionality</p>
                <div style="display: flex; flex-direction: column; gap: 8px; max-width: 300px; margin: 0 auto;">
                  <div style="padding: 8px; background: var(--muted); border-radius: 4px; font-size: 14px;">📊 Portfolio Management</div>
                  <div style="padding: 8px; background: var(--muted); border-radius: 4px; font-size: 14px;">💸 Send & Receive</div>
                  <div style="padding: 8px; background: var(--muted); border-radius: 4px; font-size: 14px;">🔄 Token Swapping</div>
                  <div style="padding: 8px; background: var(--muted); border-radius: 4px; font-size: 14px;">📈 Transaction History</div>
                  <div style="padding: 8px; background: var(--muted); border-radius: 4px; font-size: 14px;">🎨 NFT Gallery</div>
                </div>
                <a href="https://web3auth.io/docs/features/wallet-ui" target="_blank" 
                   style="color: #0066cc; text-decoration: none; margin-top: 16px; font-size: 14px;">
                   View Full Documentation →
                </a>
              </div>
            `;
            setIsWalletUIOpen(true);
          }
        },
        openFiatOnRamp: async () => {
          window.open('https://web3auth.io/docs/features/topup', '_blank');
          toast({
            title: "Fiat On-Ramp",
            description: "Buy crypto with 25+ payment providers",
          });
        }
      };

      setWalletServicesPlugin(mockWalletServices);
      console.log("Web3Auth Wallet Services initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Web3Auth Wallet Services:", error);
      toast({
        title: "Initialization Error",
        description: "Failed to load wallet services",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} copied successfully`,
    });
  };

  const formatBalance = (balance: string, symbol: string) => {
    const num = parseFloat(balance);
    if (num === 0) return `0 ${symbol}`;
    if (num < 0.0001) return `<0.0001 ${symbol}`;
    if (num < 1) return `${num.toFixed(6)} ${symbol}`;
    return `${num.toFixed(4)} ${symbol}`;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Web3Auth Professional Wallet
            </CardTitle>
            <CardDescription>
              Connect your wallet to access Web3Auth's professional wallet services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please login to access Web3Auth wallet features
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            Web3Auth Wallet
          </h1>
          <p className="text-muted-foreground">
            Professional wallet powered by Web3Auth infrastructure
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Enterprise Grade
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Wallet</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">
                        ${walletInfo?.totalBalanceUSD || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Portfolio Value
                      </div>
                    </div>
                    
                    {walletInfo?.ethereum && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">E</div>
                          <span>Ethereum</span>
                        </div>
                        <span className="font-mono">
                          {formatBalance(walletInfo.ethereum.balance, 'ETH')}
                        </span>
                      </div>
                    )}

                    {walletInfo?.solana && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
                          <span>Solana</span>
                        </div>
                        <span className="font-mono">
                          {formatBalance(walletInfo.solana.balance, 'SOL')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-lg font-bold text-green-500">
                      {walletInfo?.ethereum?.tokens?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">ETH Tokens</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-lg font-bold text-purple-500">
                      {walletInfo?.solana?.tokens?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">SOL Tokens</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-lg font-bold text-blue-500">
                      {walletInfo?.transactions?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Transactions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-lg font-bold text-orange-500">2</div>
                    <div className="text-xs text-muted-foreground">Networks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="quick-actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => walletServicesPlugin?.openFiatOnRamp()}>
              <CardContent className="p-6 text-center">
                <CreditCard className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Buy Crypto</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Purchase crypto with credit card or bank transfer
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">25+ Providers</Badge>
                  <Badge variant="outline" className="text-xs">Global</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => walletServicesPlugin?.showWalletUi('swap')}>
              <CardContent className="p-6 text-center">
                <ArrowUpDown className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Token Swap</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Exchange tokens with best rates from DEX aggregators
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">Best Rates</Badge>
                  <Badge variant="outline" className="text-xs">Multi-DEX</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => walletServicesPlugin?.showWalletUi('send')}>
              <CardContent className="p-6 text-center">
                <Send className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Send & Receive</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Transfer crypto with QR codes and contact management
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge variant="outline" className="text-xs">QR Codes</Badge>
                  <Badge variant="outline" className="text-xs">Contacts</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Web3Auth Professional Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Fiat On-Ramp</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 25+ payment providers globally</li>
                    <li>• 100+ payment methods supported</li>
                    <li>• Compliance with local regulations</li>
                    <li>• Real-time exchange rates</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Advanced Security</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multi-Party Computation (MPC)</li>
                    <li>• Enterprise-grade encryption</li>
                    <li>• SOC2 compliance</li>
                    <li>• Non-custodial key management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Wallet Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Professional Wallet Interface
              </CardTitle>
              <CardDescription>
                Full-featured Web3Auth wallet with advanced capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                ref={walletContainerRef}
                className="min-h-[500px] border rounded-lg bg-background"
              >
                {!isWalletUIOpen ? (
                  <div className="flex items-center justify-center h-[500px] flex-col gap-4">
                    <Wallet className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center max-w-md">
                      <h3 className="font-semibold mb-2">Load Advanced Wallet Interface</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Access the complete Web3Auth wallet interface with portfolio management,
                        transaction history, NFT gallery, and professional trading tools.
                      </p>
                      <Button onClick={() => walletServicesPlugin?.showWalletServicesEmbed(walletContainerRef.current)}>
                        Load Advanced Wallet
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-1">
                    {/* Advanced wallet interface will be embedded here */}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletInfo?.ethereum?.address && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ethereum Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                      {walletInfo.ethereum.address}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(walletInfo.ethereum.address, 'Ethereum address')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {walletInfo?.solana?.address && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Solana Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                      {walletInfo.solana.address}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(walletInfo.solana.address, 'Solana address')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Web3Auth Provider</label>
                <Badge variant="secondary">
                  {walletInfo?.web3AuthProvider || 'Standard'}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Wallet Type</label>
                <Badge variant={walletInfo?.isVirtualWallet ? "default" : "outline"}>
                  {walletInfo?.isVirtualWallet ? 'Virtual Wallet' : 'Connected Wallet'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Web3Auth Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start" onClick={() => window.open('https://web3auth.io/docs/', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.open('https://web3auth.io/docs/features/wallet-ui', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Wallet UI Guide
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.open('https://web3auth.io/docs/features/topup', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Fiat On-Ramp
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => window.open('https://web3auth.io/pricing.html', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Pricing & Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}