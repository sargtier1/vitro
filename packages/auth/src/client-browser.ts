import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Get API URL for browser environments
function getBrowserApiUrl(): string {
  // Browser environment (Vite) - check for import.meta safely
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore - import.meta is available in Vite but not in all environments
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        const viteApiUrl = import.meta.env.VITE_API_URL;
        const isProduction = import.meta.env.PROD;
        
        // In unified deployment (production with no VITE_API_URL), use current origin
        if (isProduction && !viteApiUrl) {
          return window.location.origin;
        }
        
        // Development or explicit API URL
        return viteApiUrl || 'http://localhost:3001';
      }
    } catch (e) {
      // Fallback if import.meta is not available
    }
    
    // Fallback to same origin in browser
    return window.location.origin;
  }

  // Default fallback
  return 'http://localhost:3001';
}

const apiUrl = getBrowserApiUrl();

export const authClient = createAuthClient({
  baseURL: apiUrl,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: 'string' as const,
        },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut, forgetPassword, resetPassword, updateUser } =
  authClient;

// Export the client methods for direct usage (non-React)
export const authActions = {
  signIn: authClient.signIn.email,
  signUp: authClient.signUp.email,
  signOut: authClient.signOut,
  getSession: authClient.getSession,
  forgetPassword: authClient.forgetPassword,
  resetPassword: authClient.resetPassword,
  updateUser: authClient.updateUser,
};

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;