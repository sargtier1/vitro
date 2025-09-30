import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Get API URL for client-side auth with unified deployment support
function getApiUrl(): string {
  // Node.js environment fallback (for SSR/API context)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3001';
  }

  // Default fallback
  return 'http://localhost:3001';
}

const apiUrl = getApiUrl();

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
