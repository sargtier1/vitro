import { authActions } from '@repo/auth/client';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@repo/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as 'login' | 'signup') || 'login',
    };
  },
  component: AuthComponent,
});

function AuthComponent() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: unknown;

      if (mode === 'signup') {
        result = await authActions.signUp({
          email,
          password,
          name,
        });
      } else {
        result = await authActions.signIn({
          email,
          password,
        });
      }

      if (result.error) {
        throw new Error(result.error.message || 'Authentication failed');
      }

      // Redirect to /app on success
      navigate({ to: '/app' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    navigate({ search: { mode: newMode } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <p className="text-slate-600">
              {mode === 'signup' ? 'Sign up to get started' : 'Sign in to your account'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : mode === 'signup' ? (
                  'Sign Up'
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {mode === 'signup' ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                ← Back to home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
