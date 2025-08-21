import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Link } from '@tanstack/react-router';

export function HomeComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Simple Integration Test
            </h1>
            <p className="text-lg text-slate-600">Testing React → API → Auth flow</p>
          </div>

          {/* Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome to the Integration Test</CardTitle>
              <CardDescription>
                This app demonstrates React → API → Auth → tRPC flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="font-medium text-blue-800">Public Route</span>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  <div>✅ Frontend running on Vite + React</div>
                  <div>✅ TanStack Router for navigation</div>
                  <div>✅ UI components from shared package</div>
                  <div>📝 Sign in to test authenticated tRPC calls</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auth Options */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Test the login flow</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth" search={{ mode: 'login' as const }}>
                  <Button className="w-full">Go to Login →</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Test the registration flow</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth" search={{ mode: 'signup' as const }}>
                  <Button variant="outline" className="w-full">
                    Go to Sign Up →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
