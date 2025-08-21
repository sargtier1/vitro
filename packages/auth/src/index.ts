// Server exports
export { auth, type AuthSession } from './server';

// Client exports
export {
  authClient,
  authActions,
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
  updateUser,
} from './client';

// Types
import type { AuthSession } from './server';
export type Session = AuthSession;
export type User = AuthSession['user'];
