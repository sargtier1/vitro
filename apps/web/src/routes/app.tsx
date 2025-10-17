import { authActions } from '@repo/auth/client';
import { trpc } from '../lib/trpc-provider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
// @ts-expect-error - TanStack Router exports are available at runtime but TypeScript has resolution issues
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import WeeklyCalendar from '@repo/ui/components/molecules/weekly-calendar';

export const Route = createFileRoute('/app')({
  component: AppComponent,
});

interface SessionData {
  user?: {
    id: string;
    email: string;
    name?: string;
    [key: string]: unknown;
  };
  session?: {
    id: string;
    createdAt: string | Date;
    expiresAt?: string | Date;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function AppComponent() {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // tRPC health check query
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
  } = trpc.health.status.useQuery();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const result = await authActions.getSession();

        if (result.error) {
          // Not authenticated, redirect to auth
          navigate({ to: '/auth', search: { mode: 'login' } });
          return;
        }

        if (!result.data) {
          // No session data, redirect to auth
          navigate({ to: '/auth', search: { mode: 'login' } });
          return;
        }

        setSessionData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session');
        // On error, also redirect to auth
        navigate({ to: '/auth', search: { mode: 'login' } });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const result = await authActions.signOut();

      if (!result.error) {
        navigate({ to: '/' });
      }
    } catch (err) {
      // Ignore logout errors
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 font-medium">Session Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <Button onClick={() => navigate({ to: '/auth' })}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {sessionData?.user?.name || sessionData?.user?.email || 'User'}!
              </h1>
              <p className="text-slate-600">You're successfully authenticated</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                Home
              </Button>
              <Button onClick={handleLogout}>Sign Out</Button>
            </div>
          </div>

          <WeeklyCalendar />
        </div>
      </div>
    </div>
  );
}
