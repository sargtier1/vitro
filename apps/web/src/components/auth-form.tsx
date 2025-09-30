import { signIn, signUp } from '@repo/auth';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@repo/ui';
// @ts-expect-error - TanStack Router exports are available at runtime but TypeScript has resolution issues
import { Link, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const navigate = useNavigate();

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message || 'Sign in failed');
          return;
        }
      } else {
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        const result = await signUp.email({ email, password, name, role: 'user' });
        if (result.error) {
          setError(result.error.message || 'Sign up failed');
          return;
        }
      }

      // Navigate to home on success
      navigate({ to: '/' });
    } catch (err) {
      // Fallback error handling
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
  };

  // Reset form when switching modes
  React.useEffect(() => {
    resetForm();
  }, [mode]);

  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {isLogin
            ? 'Enter your credentials to access your account'
            : 'Fill in your details to create a new account'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <div className="font-medium">{error}</div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? isLogin
                ? 'Signing in...'
                : 'Creating account...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <Link
                to="/auth"
                search={{ mode: 'signup' }}
                className="text-primary hover:underline font-medium"
              >
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link
                to="/auth"
                search={{ mode: 'login' }}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
