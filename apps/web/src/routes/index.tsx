// @ts-expect-error - TanStack Router exports are available at runtime but TypeScript has resolution issues
import { createFileRoute } from '@tanstack/react-router';
import { HomeComponent } from '../components/HomeComponent';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});
