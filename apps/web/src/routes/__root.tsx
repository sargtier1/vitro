// @ts-expect-error - TanStack Router exports are available at runtime but TypeScript has resolution issues
import { Outlet, createRootRoute } from '@tanstack/react-router';

function RootComponent() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
