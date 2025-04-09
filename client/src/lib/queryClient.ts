import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    try {
      // Get the response text first
      const text = await res.text();
      
      // If the response is empty, return an appropriate default
      if (!text || text.trim() === '') {
        console.warn('Empty response from server for', queryKey[0]);
        
        // Return appropriate defaults based on the endpoint
        if (queryKey[0] === '/api/currency/settings') {
          return {
            id: 1,
            enabled: false,
            currencyName: 'Grid Coins',
            exchangeRate: '250',
            minPurchase: '5.00',
            maxPurchase: '100.00',
            paypalEmail: '',
            paypalClientId: '',
            paypalSecret: '',
            lastUpdated: new Date()
          };
        } else if (queryKey[0] === '/api/currency/transactions') {
          return [];
        }
        
        // For other endpoints, return null
        return null;
      }
      
      // Try to parse the response as JSON
      try {
        return JSON.parse(text);
      } catch (error) {
        const parseError = error as Error;
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text:', text);
        
        // Return appropriate defaults based on the endpoint
        if (queryKey[0] === '/api/currency/settings') {
          return {
            id: 1,
            enabled: false,
            currencyName: 'Grid Coins',
            exchangeRate: '250',
            minPurchase: '5.00',
            maxPurchase: '100.00',
            paypalEmail: '',
            paypalClientId: '',
            paypalSecret: '',
            lastUpdated: new Date()
          };
        } else if (queryKey[0] === '/api/currency/transactions') {
          return [];
        }
        
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Error handling response:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
