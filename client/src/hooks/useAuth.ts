import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      try {
        // Check if user explicitly logged out
        const userLoggedOut = localStorage.getItem('user_logged_out');
        if (userLoggedOut === 'true') {
          console.log("User logged out flag detected, skipping auth check");
          return null;
        }

        const res = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        // Return null for auth errors to prevent error overlay
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
