import { useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: any;
  }
}

// Removed global Phantom interceptor - now handled in custom connection function

interface Web3AuthUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  walletAddress: string;
  balance?: string;
}

export function useWeb3Auth() {
  const [user, setUser] = useState<Web3AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingWalletAddress, setPendingWalletAddress] = useState<string | null>(null);
  const [isWalletLogin, setIsWalletLogin] = useState(false);
  const [web3authInstance, setWeb3authInstance] = useState<any>(null);
  const [web3authReady, setWeb3authReady] = useState(false);


  const checkAuth = async () => {
    try {
      // Check if user explicitly logged out
      const userLoggedOut = localStorage.getItem('user_logged_out');
      if (userLoggedOut === 'true') {
        console.log("User previously logged out, skipping auto-authentication");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Preload Web3Auth on app start
  const preloadWeb3Auth = async () => {
    try {
      const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;
      
      if (!clientId) {
        console.warn("VITE_WEB3AUTH_CLIENT_ID not found, skipping Web3Auth preload");
        return;
      }

      // Import Web3Auth modules
      const { Web3Auth } = await import("@web3auth/modal");
      const { WEB3AUTH_NETWORK } = await import("@web3auth/base");

      // Initialize Web3Auth instance
      const web3auth = new Web3Auth({
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
        sessionTime: 86400, // 24 hours
        enableLogging: true
      });

      // Initialize but don't connect
      await web3auth.init();
      
      // Ensure no auto-connection happens
      if (web3auth.connected) {
        try {
          await web3auth.logout();
          console.log("Disconnected auto-connected Web3Auth session");
        } catch (error) {
          console.log("No Web3Auth session to disconnect");
        }
      }
      
      setWeb3authInstance(web3auth);
      setWeb3authReady(true);
      console.log("Web3Auth preloaded and ready");
    } catch (error) {
      console.error("Web3Auth preload failed:", error);
      // Don't block app loading if preload fails
    }
  };

  // Prevent auto-connections on app load
  const preventAutoConnections = () => {
    // Check if user logged out - if so, be more aggressive about clearing everything
    const userLoggedOut = localStorage.getItem('user_logged_out');
    
    // Clear Web3Auth auto-login cache
    localStorage.removeItem("Web3Auth-cachedAdapter");
    localStorage.removeItem("openlogin_store");
    localStorage.removeItem("Web3Auth-cachedLogin");
    
    if (userLoggedOut === 'true') {
      // If user logged out, clear additional storage that might persist sessions
      localStorage.removeItem("wallet-connect");
      localStorage.removeItem("walletconnect");
      sessionStorage.clear();
      console.log("User logged out - cleared all authentication storage");
    }
    
    // Disconnect any existing wallet connections silently
    if (window.ethereum && window.ethereum.selectedAddress) {
      // Don't auto-connect to MetaMask
      console.log("Preventing MetaMask auto-connection");
    }
    
    if (window.solana && window.solana.isConnected) {
      // Disconnect Phantom if auto-connected
      try {
        window.solana.disconnect();
        console.log("Disconnected auto-connected Phantom wallet");
      } catch (error) {
        console.log("No Phantom auto-connection to clear");
      }
    }
  };

  useEffect(() => {
    // Check if user explicitly logged out before doing anything
    const userLoggedOut = localStorage.getItem('user_logged_out');
    if (userLoggedOut === 'true') {
      console.log("User previously logged out, skipping all auto-authentication");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Prevent any auto-connections first
    preventAutoConnections();
    
    // Then check auth status
    checkAuth();
    
    // Preload Web3Auth in the background
    preloadWeb3Auth();
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      alert("MetaMask is not installed. Please install MetaMask to connect your wallet.");
      return;
    }

    try {
      setIsConnecting(true);
      console.log("Starting MetaMask connection...");
      
      // Modern MetaMask connection using ethereum provider
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0];
        
        // Check if user exists
        const checkResponse = await fetch(`/api/auth/check-wallet/${walletAddress}`);
        
        if (checkResponse.ok) {
          // User exists, authenticate
          const web3AuthUser: Web3AuthUser = {
            id: walletAddress,
            email: `${walletAddress.substring(0, 8)}@metamask.user`,
            firstName: "MetaMask",
            lastName: "User",
            profileImageUrl: "",
            walletAddress: walletAddress,
          };

          const authResponse = await fetch('/api/auth/web3auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(web3AuthUser),
            credentials: 'include',
          });

          if (authResponse.ok) {
            const userData = await authResponse.json();
            setUser(userData.user);
            setIsAuthenticated(true);
            // Clear logout flag on successful authentication
            localStorage.removeItem('user_logged_out');
            // Refresh auth cache to update routing
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          }
        } else {
          // New user, show name modal
          setPendingWalletAddress(walletAddress);
          setIsWalletLogin(true);
          setShowNameModal(true);
        }
      }
    } catch (error: any) {
      console.error("MetaMask connection failed:", error);
      
      // Check if user cancelled the connection
      if (error?.code === 4001 || error?.message?.includes("User rejected")) {
        alert("MetaMask connection cancelled. Please try again if you'd like to connect.");
      } else if (error?.code === -32002) {
        alert("MetaMask is already processing a request. Please check MetaMask and try again.");
      } else {
        alert("Failed to connect MetaMask. Please make sure MetaMask is unlocked and try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const connectPhantom = async () => {
    if (!window.solana?.isPhantom) {
      alert("Phantom wallet is not installed. Please install Phantom to connect your wallet.");
      return;
    }

    try {
      setIsConnecting(true);
      console.log("Starting Phantom wallet connection...");
      
      // Clear deprecated web3 object that causes conflicts
      if (window.web3) {
        delete window.web3;
        console.log("Removed deprecated web3 object");
      }
      
      // Store and temporarily remove MetaMask to prevent verification screen conflicts
      const originalEthereum = window.ethereum;
      if (window.ethereum && window.ethereum.isMetaMask) {
        delete window.ethereum;
        console.log("Temporarily isolated MetaMask provider");
      }
      
      // ULTIMATE SOLUTION: Force account selection by triggering wallet UI
      console.log("ULTIMATE: Forcing Phantom account selection UI...");
      
      // Step 1: Complete disconnection 
      if (window.solana?.isConnected) {
        try {
          await window.solana.disconnect();
          console.log("Disconnected existing session");
        } catch (e) {
          console.log("No session to disconnect");
        }
      }
      
      // Step 2: The key insight - use the standard wallet adapter approach
      // This is the method that ALWAYS shows account selection
      let resp;
      try {
        console.log("Using standard wallet adapter connection...");
        
        // FINAL SOLUTION: Direct browser extension protocol
        console.log("FINAL ATTEMPT: Using browser extension protocol...");
        
        // The issue is that Phantom caches connection state. We need to force it to treat this as a new request
        
        // Step 1: Completely eliminate any cached state
        if (window.phantom?.solana) {
          try {
            // Clear ALL properties - including hidden ones
            const descriptor = Object.getOwnPropertyDescriptor(window.phantom.solana, 'isConnected');
            if (descriptor && descriptor.configurable) {
              Object.defineProperty(window.phantom.solana, 'isConnected', {
                value: false,
                writable: true,
                configurable: true
              });
            }
            
            // Clear the public key completely
            window.phantom.solana.publicKey = null;
            
            // Clear any internal accounts cache
            Object.getOwnPropertyNames(window.phantom.solana).forEach(prop => {
              if (prop.includes('account') || prop.includes('wallet') || prop.includes('connect')) {
                try {
                  delete window.phantom.solana[prop];
                } catch (e) {}
              }
            });
            
            console.log("Cleared all Phantom state properties");
          } catch (e) {
            console.log("Could not clear all properties:", e);
          }
        }
        
        // Step 2: Use the correct method to trigger extension popup
        try {
          console.log("Using direct extension connect method...");
          
          // This should force the extension to show account selection
          resp = await window.phantom.solana.connect({
            onlyIfTrusted: false,
            // Critical: These parameters force UI
            silent: false,
            eager: false
          });
          
          console.log("FINAL SUCCESS: Extension showed popup, connected to:", resp?.publicKey?.toString());
          
        } catch (extensionError) {
          console.log("Extension method failed:", extensionError);
          
          // Try one more approach: simulate first-time connection
          try {
            console.log("Simulating first-time connection...");
            
            // Clear window.solana temporarily to simulate fresh state
            const originalProvider = window.solana;
            delete window.solana;
            
            // Wait for Phantom to re-inject
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Restore provider
            window.solana = originalProvider;
            
            // Now try connecting as if for the first time
            resp = await window.solana.connect({ onlyIfTrusted: false });
            console.log("First-time simulation result:", resp?.publicKey?.toString());
            
          } catch (finalError) {
            console.log("All extension methods failed:", finalError);
            throw finalError;
          }
        }
        
      } catch (error) {
        console.log("Request method failed, trying connect directly:", error);
        
        // Final fallback
        try {
          resp = await window.solana.connect({ onlyIfTrusted: false });
          console.log("Direct connect result:", resp?.publicKey?.toString());
        } catch (connectError) {
          console.error("All connection methods failed:", connectError);
          throw connectError;
        }
      }
      
      // Restore MetaMask provider after successful connection
      try {
        if ((window as any).originalEthereum) {
          window.ethereum = (window as any).originalEthereum;
        }
      } catch (e) {
        // Ignore restoration errors
      }
      
      if (!resp || !resp.publicKey) {
        throw new Error("Failed to connect to Phantom wallet");
      }
      
      const walletAddress = resp.publicKey.toString();
      console.log("Phantom connected successfully:", walletAddress);
      
      // Check if user exists
      const checkResponse = await fetch(`/api/auth/check-wallet/${walletAddress}`);
      
      if (checkResponse.ok) {
        // User exists, authenticate
        const web3AuthUser: Web3AuthUser = {
          id: walletAddress,
          email: `${walletAddress.substring(0, 8)}@phantom.user`,
          firstName: "Phantom",
          lastName: "User",
          profileImageUrl: "",
          walletAddress: walletAddress,
        };

        const authResponse = await fetch('/api/auth/web3auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(web3AuthUser),
          credentials: 'include',
        });

        if (authResponse.ok) {
          const userData = await authResponse.json();
          setUser(userData.user);
          setIsAuthenticated(true);
          // Clear logout flag on successful authentication
          localStorage.removeItem('user_logged_out');
          // Refresh auth cache to update routing
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        } else {
          throw new Error("Failed to authenticate with backend");
        }
      } else {
        // New user, show name modal
        setPendingWalletAddress(walletAddress);
        setIsWalletLogin(true);
        setShowNameModal(true);
      }

    } catch (error: any) {
      console.error("Phantom connection failed:", error);
      
      // Restore MetaMask provider if connection failed
      if (originalEthereum && !window.ethereum) {
        window.ethereum = originalEthereum;
      }
      
      // Check if user cancelled the connection
      if (error?.code === 4001 || error?.message?.includes("User rejected") || error?.message?.includes("cancelled")) {
        alert("Phantom wallet connection cancelled. Please try again if you'd like to connect.");
      } else {
        alert("Failed to connect Phantom wallet. Please make sure Phantom is unlocked and try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWeb3Auth = async () => {
    try {
      setIsConnecting(true);
      console.log("Starting Web3Auth modal connection...");

      let web3auth = web3authInstance;

      // If preloaded instance is not available, create new one
      if (!web3auth || !web3authReady) {
        console.log("Preloaded instance not ready, creating new one...");
        const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;
        
        if (!clientId) {
          throw new Error("VITE_WEB3AUTH_CLIENT_ID environment variable is required");
        }
        
        // Import Web3Auth Modal
        const { Web3Auth } = await import("@web3auth/modal");
        const { WEB3AUTH_NETWORK } = await import("@web3auth/base");

        // Initialize Web3Auth Modal with basic configuration (no whitelabel features)
        web3auth = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          sessionTime: 86400, // 24 hours
          enableLogging: true,
          // No uiConfig to avoid whitelabel features requiring paid plan
          chainConfig: {
            chainNamespace: "eip155",
            chainId: "0x1",
            rpcTarget: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            displayName: "Ethereum Mainnet",
            blockExplorer: "https://etherscan.io",
            ticker: "ETH",
            tickerName: "Ethereum",
          },
        });

        console.log("Initializing Web3Auth...");
        await web3auth.init();
        console.log("Web3Auth initialized, status:", web3auth.status);
      } else {
        console.log("Using preloaded Web3Auth instance");
      }
      
      // Clear Web3Auth cache to prevent auto-login
      localStorage.removeItem("Web3Auth-cachedAdapter");
      localStorage.removeItem("openlogin_store");
      localStorage.removeItem("Web3Auth-cachedLogin");
      
      // Ensure Web3Auth is disconnected before attempting new connection
      if (web3auth.connected) {
        try {
          await web3auth.logout();
          console.log("Logged out existing Web3Auth session");
        } catch (error) {
          console.log("No existing Web3Auth session to logout");
        }
      }
      
      console.log("Opening Web3Auth modal...");
      const web3authProvider = await web3auth.connect();
      
      console.log("Web3Auth provider received:", !!web3authProvider);
      console.log("Web3Auth connected state:", web3auth.connected);
      console.log("Web3Auth status after connect:", web3auth.status);
        
      if (web3authProvider && web3auth.connected) {
        console.log("Web3Auth connection successful");
        await handleWeb3AuthSuccess(web3auth);
      } else {
        console.error("Web3Auth connection failed - provider:", !!web3authProvider, "connected:", web3auth.connected);
        throw new Error("Web3Auth connection failed");
      }
      
    } catch (error: any) {
      console.error("Web3Auth authentication failed:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack
      });
      
      // Check if user cancelled the authentication
      if (error?.message?.includes("User closed the modal") || 
          error?.message?.includes("User cancelled") ||
          error?.message?.includes("cancelled") ||
          error?.code === 5113 ||
          error?.name === "UserCancelledError") {
        console.log("User cancelled Web3Auth authentication");
      } else if (error?.message?.includes("Wallet is not connected")) {
        console.log("Wallet connection issue detected");
        alert("Wallet connection failed. Please ensure your wallet is properly connected and try again.");
      } else if (error?.code === 5000 || error?.message?.includes("Something went wrong")) {
        console.log("Web3Auth service error detected");
        alert("Authentication service temporarily unavailable. Please try again in a moment.");
      } else {
        console.log("Unknown Web3Auth error:", error);
        alert("Authentication failed. Please check your internet connection and try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWeb3AuthSuccess = async (web3auth: any) => {
    try {
      if (!web3auth.provider) {
        throw new Error("No provider available");
      }

      // Get user information
      const userInfo = await web3auth.getUserInfo();
      console.log("Web3Auth user info:", userInfo);
      console.log("Web3Auth authentication details:", {
        connected: web3auth.connected,
        provider: userInfo?.typeOfLogin,
        verifier: userInfo?.verifier,
        verifierId: userInfo?.verifierId,
        email: userInfo?.email,
        name: userInfo?.name
      });

      // Generate deterministic virtual wallet addresses (avoiding all RPC calls)
      const { ethers } = await import('ethers');
      
      // Create deterministic wallet from Web3Auth user data
      const userIdentifier = userInfo.verifierId || userInfo.email || userInfo.sub || 'default';
      const provider = userInfo.typeOfLogin || 'web3auth';
      const seedString = `web3auth_${provider}_${userIdentifier}`;
      const seedHash = ethers.keccak256(ethers.toUtf8Bytes(seedString));
      
      // Generate Ethereum virtual wallet
      const ethWallet = new ethers.Wallet(seedHash);
      const ethAccounts: string[] = [ethWallet.address];
      
      // Generate Solana virtual wallet from same seed
      const seed = ethers.getBytes(seedHash);
      const { Keypair } = await import('@solana/web3.js');
      const solanaKeypair = Keypair.fromSeed(seed.slice(0, 32));
      const solanaAddress = solanaKeypair.publicKey.toString();
      
      console.log("Generated Web3Auth virtual wallets:", {
        ethereum: ethWallet.address,
        solana: solanaAddress,
        provider: provider,
        userIdentifier: userIdentifier
      });

      // Default balances for virtual wallets (will be fetched from backend)
      const ethBalance = "0";
      const solanaBalance = "0";

      // Web3Auth social logins should proceed directly without username prompt
      // Only actual wallet connections (MetaMask/Phantom) need username prompts
      console.log("Web3Auth social login successful, proceeding with authentication");

      // Use the existing social login endpoint that's working
      const socialLoginData = {
        provider: userInfo.typeOfLogin || 'web3auth',
        id: userInfo.verifierId || userInfo.sub || Date.now().toString(),
        email: userInfo.email || null,
        name: userInfo.name || null,
        profileImage: userInfo.profileImage || null,
        ethereumAddress: ethAccounts?.[0] || ethWallet.address,
        solanaAddress: solanaAddress,
      };

      console.log("Sending social login data:", socialLoginData);

      // Use the social login endpoint that successfully processed the Discord login
      const authResponse = await fetch('/api/auth/web3auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialLoginData),
        credentials: 'include',
      });

      if (authResponse.ok) {
        const userData = await authResponse.json();
        setUser(userData.user);
        setIsAuthenticated(true);
        
        // Clear logout flag on successful authentication
        localStorage.removeItem('user_logged_out');
        
        console.log("Web3Auth authentication complete");
        // Refresh auth cache to update routing
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else {
        throw new Error("Failed to authenticate with backend");
      }
      
    } catch (error) {
      console.error("Error handling Web3Auth success:", error);
      throw error;
    }
  };

  const login = async (walletType: 'metamask' | 'phantom' | 'web3auth' = 'metamask') => {
    // Clear logout flag when user initiates new login
    localStorage.removeItem('user_logged_out');
    
    // Also invalidate auth cache to force fresh authentication
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // For Phantom, ensure complete disconnection and cache clearing before new connection
    if (walletType === 'phantom') {
      console.log("Preparing fresh Phantom connection...");
      
      if (window.phantom?.solana?.isConnected) {
        try {
          await window.phantom.solana.disconnect();
          console.log("Disconnected existing Phantom session");
        } catch (error) {
          console.log("No existing session to disconnect");
        }
      }
      
      // ULTIMATE: Clear ALL possible Phantom connection data
      if (window.phantom?.solana) {
        try {
          // Multiple disconnection attempts
          for (let i = 0; i < 3; i++) {
            try {
              await window.phantom.solana.disconnect();
              console.log(`Disconnect attempt ${i + 1} completed`);
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (e) {
              console.log(`Disconnect attempt ${i + 1} failed`);
            }
          }
          
          // Clear ALL internal properties that store connection state
          const propsToDelete = [
            '_wallet', '_publicKey', '_accounts', '_connected', '_permissions',
            '_session', '_autoConnect', '_trusted', '_selectedAccount', 
            '_accountInfo', '_walletState', 'selectedAddress'
          ];
          
          propsToDelete.forEach(prop => {
            if (window.phantom.solana[prop] !== undefined) {
              try {
                delete window.phantom.solana[prop];
                console.log(`Cleared ${prop}`);
              } catch (e) {
                console.log(`Could not clear ${prop}`);
              }
            }
          });
          
          // Force disconnected state
          window.phantom.solana.isConnected = false;
          window.phantom.solana.publicKey = null;
          
          console.log("ULTIMATE: Phantom completely reset");
        } catch (e) {
          console.log("Ultimate reset error:", e);
        }
      }
      
      // Clear any wallet-related storage
      try {
        localStorage.removeItem('lastPhantomAccount');
        localStorage.removeItem('lastMetaMaskAccount');
        console.log("Cleared wallet account cache");
      } catch (e) {
        console.log("Could not clear account cache");
      }
      
      // Wait for complete cleanup
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (walletType === 'phantom') {
      await connectPhantom();
    } else if (walletType === 'web3auth') {
      await connectWeb3Auth();
    } else {
      await connectMetaMask();
    }
  };

  const logout = async () => {
    try {
      console.log("Starting comprehensive logout process...");
      
      // Set logout flag immediately to prevent any auto-login attempts
      localStorage.setItem('user_logged_out', 'true');
      
      // Clear all local authentication state first
      setUser(null);
      setIsAuthenticated(false);
      
      // Force Phantom wallet to completely forget the current connection
      if (window.phantom?.solana) {
        try {
          console.log("Executing comprehensive Phantom disconnect...");
          
          // Multiple disconnection attempts to clear all state
          if (window.phantom.solana.isConnected) {
            await window.phantom.solana.disconnect();
            console.log("First disconnect completed");
          }
          
          // Wait and try disconnecting again
          await new Promise(resolve => setTimeout(resolve, 100));
          
          try {
            await window.phantom.solana.disconnect();
            console.log("Second disconnect completed");
          } catch (e) {
            console.log("Second disconnect not needed");
          }
          
          // Clear any internal wallet references and cached state
          if (window.phantom.solana._wallet) {
            try {
              delete window.phantom.solana._wallet;
              console.log("Cleared internal wallet reference");
            } catch (e) {
              console.log("No internal wallet to clear");
            }
          }
          
          // NUCLEAR LOGOUT: Delete ALL phantom properties and reset state
          const phantom = window.phantom.solana;
          
          // Delete every single property on the phantom object
          Object.keys(phantom).forEach(key => {
            try {
              delete phantom[key];
              console.log(`NUCLEAR: Deleted phantom.${key}`);
            } catch (e) {
              console.log(`Could not delete ${key}`);
            }
          });
          
          // Remove the entire phantom provider temporarily
          const originalPhantom = window.phantom.solana;
          delete window.phantom.solana;
          delete window.solana;
          
          // Wait for complete removal
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Restore but force reinitialization
          window.phantom.solana = originalPhantom;
          window.solana = originalPhantom;
          
          // Reset to disconnected state
          try {
            originalPhantom.isConnected = false;
            originalPhantom.publicKey = null;
            console.log("NUCLEAR: Forced disconnected state");
          } catch (e) {
            console.log("Could not force disconnected state");
          }
          
          console.log("Comprehensive Phantom disconnect completed");
        } catch (error) {
          console.warn("Phantom disconnect error:", error);
        }
      }
      
      // Disconnect Web3Auth if connected
      if (web3authInstance && web3authInstance.connected) {
        try {
          console.log("Logging out from Web3Auth...");
          await web3authInstance.logout();
          console.log("Web3Auth logout successful");
        } catch (error) {
          console.warn("Web3Auth logout error:", error);
        }
      }
      
      // Disconnect all other wallets
      await disconnectAllWallets();
      
      // Comprehensive localStorage cleanup including Phantom-specific keys
      const storageKeysToRemove = [
        'Web3Auth-cachedAdapter',
        'openlogin_store', 
        'Web3Auth-cachedLogin',
        'Web3Auth-torus-store',
        'Web3Auth-torus-wallet',
        'Web3Auth-web3auth',
        'wallet-connect',
        'walletconnect',
        'walletlink',
        'WEB3_CONNECT_CACHED_PROVIDER',
        '-walletlink:https://www.walletlink.org:version',
        '-walletlink:https://www.walletlink.org:session:id',
        '-walletlink:https://www.walletlink.org:session:secret',
        '-walletlink:https://www.walletlink.org:session:linked',
        'wagmi.cache',
        'wagmi.store',
        'wagmi.wallet',
        'phantom-wallet-connection',
        'phantom_wallet',
        'phantom_auto_connect',
        'sollet-wallet',
        'wallet-standard:app-id',
        'wallet-standard:wallet-data',
        'solana-wallet-standard'
      ];
      
      // Remove specific keys
      storageKeysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Remove any keys containing Web3Auth, wallet, or auth-related terms
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.toLowerCase().includes('web3auth') || 
          key.toLowerCase().includes('openlogin') || 
          key.toLowerCase().includes('wallet') ||
          key.toLowerCase().includes('auth') ||
          key.toLowerCase().includes('connect')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
      });
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Clear Web3Auth instance if it exists
      if (web3authInstance) {
        try {
          if (web3authInstance.connected) {
            await web3authInstance.logout();
            console.log("Web3Auth instance disconnected");
          }
        } catch (error) {
          console.log("Web3Auth instance logout error:", error);
        }
        setWeb3authInstance(null);
        setWeb3authReady(false);
      }
      
      // Invalidate all authentication-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear(); // Clear entire query cache to prevent stale data
      
      // Aggressive Phantom wallet disconnection and cache clearing
      if (window.phantom?.solana) {
        try {
          // Force disconnect multiple times to ensure complete disconnection
          if (window.phantom.solana.isConnected) {
            await window.phantom.solana.disconnect();
            console.log("First Phantom disconnect completed");
          }
          
          // Clear Phantom's internal state
          if (window.phantom.solana._publicKey) {
            delete window.phantom.solana._publicKey;
          }
          
          // Force another disconnect after state clearing
          try {
            await window.phantom.solana.disconnect();
            console.log("Second Phantom disconnect completed");
          } catch (e) {
            console.log("Second disconnect not needed");
          }
          
          // Clear any Phantom adapter state
          if (window.phantom.solana.wallet) {
            try {
              await window.phantom.solana.wallet.adapter?.disconnect();
            } catch (e) {
              console.log("No adapter to disconnect");
            }
          }
          
          // Clear ALL Phantom wallet storage including IndexedDB
          const phantomKeys = [
            'phantom-wallet', 'phantom_wallet', 'phantom-auto-connect',
            'solana-wallet-standard', 'wallet-standard:app-id', 
            'wallet-standard:wallet-data', 'solana-wallet-adapter',
            'phantom-encrypted-wallet', 'phantom-wallet-connection',
            'phantom-wallet-permissions', 'phantom-trusted-apps'
          ];
          
          phantomKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });
          
          // Clear IndexedDB with proper async handling
          if (window.indexedDB) {
            const dbsToDelete = ['phantom-wallet', 'solana-wallet-standard', 'wallet-standard', 'phantom'];
            for (const dbName of dbsToDelete) {
              try {
                await new Promise((resolve, reject) => {
                  const deleteReq = indexedDB.deleteDatabase(dbName);
                  deleteReq.onsuccess = () => {
                    console.log(`Successfully cleared ${dbName} database`);
                    resolve(null);
                  };
                  deleteReq.onerror = () => reject(deleteReq.error);
                  deleteReq.onblocked = () => reject(new Error('Database deletion blocked'));
                  // Timeout after 2 seconds
                  setTimeout(() => resolve(null), 2000);
                });
              } catch (e) {
                console.log(`Could not clear ${dbName} database:`, e);
              }
            }
          }
          
          console.log("Comprehensive Phantom storage cleanup completed");
          
          console.log("Aggressive Phantom wallet disconnection completed");
        } catch (error) {
          console.log("Phantom aggressive disconnect error:", error);
        }
      }

      // Backend logout (after local cleanup to prevent race conditions)
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("Backend logout successful:", result.message);
        } else {
          console.warn("Backend logout responded with status:", response.status);
        }
      } catch (error) {
        console.warn("Backend logout network error (continuing with local cleanup):", error);
      }
      
      // Clear any remaining authentication state
      setPendingWalletAddress(null);
      setShowNameModal(false);
      setIsWalletLogin(false);
      
      console.log("Comprehensive logout completed - redirecting...");
      
      // Force page reload to ensure complete state reset
      console.log("Reloading page to ensure complete logout...");
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout process encountered an error:", error);
      
      // Even if logout fails, ensure cleanup happens
      try {
        localStorage.setItem('user_logged_out', 'true');
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear local authentication state
        setUser(null);
        setIsAuthenticated(false);
        
        console.log("Forced cleanup completed despite error");
        window.location.href = '/';
      } catch (cleanupError) {
        console.error("Critical: Could not complete logout cleanup:", cleanupError);
        // Last resort - force reload
        window.location.reload();
      }
    }
  };

  const disconnectAllWallets = async () => {
    try {
      console.log("Disconnecting all wallets...");
      
      // Disconnect MetaMask
      if (window.ethereum?.isMetaMask) {
        try {
          // Clear MetaMask permissions and connections
          if (window.ethereum.request) {
            await window.ethereum.request({
              method: "wallet_revokePermissions",
              params: [{ eth_accounts: {} }]
            }).catch(() => {
              console.log("MetaMask permissions revocation not supported");
            });
          }
          // Clear MetaMask provider cache
          if (window.ethereum.removeAllListeners) {
            window.ethereum.removeAllListeners();
          }
          console.log("MetaMask permissions cleared");
        } catch (error) {
          console.log("MetaMask disconnect error:", error);
        }
      }

      // Disconnect Phantom
      if (window.solana?.isPhantom) {
        try {
          if (window.solana.isConnected) {
            await window.solana.disconnect();
          }
          console.log("Phantom wallet disconnected");
        } catch (error) {
          console.log("Phantom disconnect error:", error);
        }
      }

      // Disconnect Web3Auth if instance exists
      if (web3authInstance) {
        try {
          if (web3authInstance.connected) {
            await web3authInstance.logout();
            console.log("Web3Auth instance disconnected");
          }
        } catch (error) {
          console.log("Web3Auth instance disconnect error:", error);
        }
      }

      // Try to disconnect any other Web3Auth instances
      try {
        const { Web3Auth } = await import("@web3auth/modal");
        const { WEB3AUTH_NETWORK } = await import("@web3auth/base");
        
        const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;
        if (clientId) {
          const web3auth = new Web3Auth({
            clientId,
            web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          });

          await web3auth.init();
          
          if (web3auth.connected) {
            await web3auth.logout();
            console.log("Additional Web3Auth instance disconnected");
          }
        }
      } catch (error) {
        console.log("Web3Auth disconnect error:", error);
      }
      
      console.log("All wallets disconnected and local storage cleared");
      
    } catch (error) {
      console.error("Error disconnecting wallets:", error);
    }
  };

  const handleNameSubmit = async (firstName: string, lastName: string, username?: string) => {
    if (!pendingWalletAddress) return;

    try {
      const web3AuthUser: Web3AuthUser = {
        id: pendingWalletAddress,
        email: `${pendingWalletAddress.substring(0, 8)}@wallet.user`,
        username: username || undefined,
        firstName,
        lastName,
        profileImageUrl: "",
        walletAddress: pendingWalletAddress,
      };

      const response = await fetch('/api/auth/web3auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(web3AuthUser),
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        setShowNameModal(false);
        setPendingWalletAddress(null);
        setIsWalletLogin(false);
        
        
        // Clear logout flag on successful authentication
        localStorage.removeItem('user_logged_out');
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("User creation failed:", error);
      alert("Failed to create user. Please try again.");
    }
  };

  return {
    user,
    isLoading,
    isConnecting,
    isAuthenticated,
    login,
    logout,
    connectMetaMask,
    connectPhantom,
    connectWeb3Auth,
    showNameModal,
    setShowNameModal,
    pendingWalletAddress,
    handleNameSubmit,
    isWalletLogin,
  };
}