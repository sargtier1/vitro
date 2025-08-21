# Frontend Architecture

## Overview

The frontend is built with **React 18**, **TanStack Router**, and **TanStack Query** for a modern, type-safe development experience.

## Routing

### File-Based Routing

```
apps/web/src/routes/
├── __root.tsx          # Root layout
├── index.tsx           # Home page (/)
├── auth.tsx            # Authentication (/auth)
├── app.tsx             # Protected app (/app)
└── posts/
    ├── index.tsx       # Posts list (/posts)
    ├── $postId.tsx     # Post detail (/posts/$postId)
    └── new.tsx         # Create post (/posts/new)
```

### Route Examples

```typescript
// Basic route with search params
export const Route = createFileRoute('/auth')({
  validateSearch: (search) => ({
    mode: (search.mode as 'login' | 'signup') || 'login',
  }),
  component: AuthComponent,
});

// Protected route with guards
export const Route = createFileRoute('/app')({
  beforeLoad: async ({ location }) => {
    const session = await authActions.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth', search: { redirect: location.href } });
    }
  },
  component: AppComponent,
});
```

### Navigation

```typescript
import { useNavigate, Link } from '@tanstack/react-router';

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: '/posts', search: { q: 'react' } });

// Link component
<Link to="/posts/$postId" params={{ postId: '123' }}>
  View Post
</Link>
```

## State Management

### Server State (TanStack Query + tRPC)

```typescript
import { trpc } from '../lib/trpc';

function PostsList() {
  const { data: posts, isLoading } = trpc.posts.list.useQuery();
  
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      trpc.useContext().posts.list.invalidate();
    },
  });

  return (
    <div>
      {posts?.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

### Client State (React Hooks)

```typescript
// Local component state
const [formData, setFormData] = useState({ title: '', content: '' });

// Global state with Context
const ThemeContext = createContext();

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### Custom Hooks

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue] as const;
}
```

## UI Components

The UI system uses **Shadcn/UI** with **Tailwind CSS**. Components are available in the `@repo/ui` package.

```typescript
import { Button, Card, CardContent, Input } from '@repo/ui';

function ContactForm() {
  return (
    <Card>
      <CardContent className="space-y-4">
        <Input placeholder="Email" />
        <Button type="submit">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Best Practices

1. **Use file-based routing** for automatic route generation
2. **Server state with tRPC** for API calls and caching
3. **Local state for UI interactions** (forms, toggles, modals)
4. **Custom hooks for reusable logic**
5. **Type-safe navigation** with TanStack Router
6. **Optimistic updates** for better UX