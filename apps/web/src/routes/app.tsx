import { authActions } from '@repo/auth/client';
import { trpc } from '../lib/trpc-provider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
// @ts-expect-error - TanStack Router exports are available at runtime but TypeScript has resolution issues
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

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

          {/* Session Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionData?.user && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">User Details</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID:</strong> {sessionData.user.id}
                    </div>
                    <div>
                      <strong>Email:</strong> {sessionData.user.email}
                    </div>
                    {sessionData.user.name && (
                      <div>
                        <strong>Name:</strong> {sessionData.user.name}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sessionData?.session && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Session Details</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Session ID:</strong> {sessionData.session.id}
                    </div>
                    <div>
                      <strong>Created:</strong>{' '}
                      {new Date(sessionData.session.createdAt).toLocaleString()}
                    </div>
                    {sessionData.session.expiresAt && (
                      <div>
                        <strong>Expires:</strong>{' '}
                        {new Date(sessionData.session.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 font-medium">
                  Raw session data
                </summary>
                <pre className="mt-3 bg-slate-100 p-4 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(sessionData, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>

          {/* tRPC Health Status Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>tRPC Health Status (Authenticated)</CardTitle>
              <CardDescription>
                Live data from tRPC health.status procedure with authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-2 text-slate-600">Loading health data via tRPC...</p>
                </div>
              )}

              {healthError && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-red-800 font-medium">tRPC Error:</p>
                  <p className="text-red-600 text-sm mt-1">{healthError.message}</p>
                  {healthError.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-red-600">
                        Error Details
                      </summary>
                      <pre className="mt-1 bg-red-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(healthError.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {healthData && (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="font-medium text-green-800">
                      tRPC Connected (Authenticated)
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Status:</strong> {healthData.status}
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {healthData.timestamp}
                    </div>
                    <div>
                      <strong>Response Time:</strong> {healthData.responseTime}ms
                    </div>
                    <div className="mt-3">
                      <strong>Service Checks:</strong>
                      <div className="ml-4 mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            healthData.checks?.database ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span>Database: {healthData.checks?.database ? 'Connected' : 'Failed'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            healthData.checks?.environment ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span>Environment: {healthData.checks?.environment ? 'Configured' : 'Missing vars'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            healthData.checks?.auth ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span>Auth: {healthData.checks?.auth ? 'Configured' : 'Failed'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800">
                      Raw tRPC response data
                    </summary>
                    <pre className="mt-2 bg-slate-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(healthData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-green-800 font-medium">Authentication Working</span>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div>✅ Frontend communicating with API</div>
                <div>✅ Session cookies being set and read</div>
                <div>✅ User data being retrieved</div>
                <div>✅ Protected route access working</div>
                <div>{healthData ? '✅' : '⏳'} tRPC health check working</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
