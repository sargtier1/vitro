# @repo/ui

Shared UI component library built with Shadcn/UI, Radix UI primitives, and Tailwind CSS for consistent, accessible, and beautiful user interfaces.

## Features

- Shadcn/UI Components - High-quality, accessible React components
- Radix UI Primitives - Unstyled, accessible UI building blocks
- Tailwind CSS - Utility-first styling with CSS variables
- Class Variance Authority - Type-safe component variants
- Accessibility First - ARIA compliance and keyboard navigation
- Dark Mode Ready - CSS variables for theme switching
- Responsive Design - Mobile-first approach
- TypeScript Support - Full type safety for all components

## Installation

This package is part of the monorepo and installed automatically with:

```bash
pnpm install
```

## Available Components

### Alert
Status messages and notifications with customizable severity levels:

```tsx
import { Alert, AlertDescription, AlertTitle } from '@repo/ui';

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Your session has expired.</AlertDescription>
</Alert>
```

**Variants:** `default`, `destructive`

### Button
Interactive buttons with multiple variants and sizes:

```tsx
import { Button } from '@repo/ui';

<Button>Default Button</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="ghost" size="lg">Large Ghost</Button>
<Button disabled>Disabled</Button>

// As Link component
<Button asChild>
  <Link href="/profile">Profile</Link>
</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
**Sizes:** `default`, `sm`, `lg`, `icon`

### Card
Container components for grouping related content:

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description or subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input
Form input fields with consistent styling:

```tsx
import { Input, Label } from '@repo/ui';

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>

<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled input" />
```

**Types:** `text`, `email`, `password`, `number`, `tel`, `url`, etc.

### Label
Accessible form labels with proper association:

```tsx
import { Label } from '@repo/ui';

<Label htmlFor="username">Username</Label>
<Label className="text-destructive">Required field *</Label>
```

### Separator
Visual dividers for content sections:

```tsx
import { Separator } from '@repo/ui';

<div>
  <p>Above separator</p>
  <Separator />
  <p>Below separator</p>
</div>

<div className="flex">
  <p>Left content</p>
  <Separator orientation="vertical" />
  <p>Right content</p>
</div>
```

**Orientations:** `horizontal` (default), `vertical`

## Styling & Customization

### CSS Variables
The UI package uses CSS variables for theming:

```css
/* packages/ui/src/styles/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  /* ... more variables */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark theme overrides */
}
```

### Utility Function
The `cn()` utility combines class names intelligently:

```tsx
import { cn } from '@repo/ui';

// Merge classes with conflict resolution
const buttonClasses = cn(
  "px-4 py-2 bg-blue-500",  // Base classes
  "hover:bg-blue-600",      // Hover state
  disabled && "opacity-50", // Conditional classes
  className                 // User-provided classes
);

<button className={buttonClasses}>Click me</button>
```

## Usage in Apps

### Import Components

```tsx
// Individual component imports
import { Button, Card, CardContent, Alert } from '@repo/ui';

// Use in your components
function LoginForm() {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <Button className="w-full">Sign In</Button>
      </CardContent>
    </Card>
  );
}
```

### Style Integration
Components automatically include the global CSS:

```tsx
// Apps automatically get styles when importing components
import { Button } from '@repo/ui'; // Includes globals.css
```

## Adding New Components

### Using Shadcn/UI CLI

```bash
# Add new components from the UI package directory
cd packages/ui

# Add individual components
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form

# Add multiple components
npx shadcn@latest add dialog dropdown-menu form
```

### Manual Component Addition

1. **Create component file**: `src/components/ui/dialog.tsx`
2. **Export from index**: Add export to `src/index.ts`
3. **Update package.json**: Add to component exports if needed

```tsx
// Example: Adding Dialog component
// src/components/ui/dialog.tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "../../lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))

export { Dialog, DialogTrigger, DialogContent }
```

```tsx
// src/index.ts - Add export
export { Dialog, DialogTrigger, DialogContent } from "./components/ui/dialog";
```

## Best Practices

### Component Composition
Build complex UIs by composing simple components:

```tsx
function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={user.role} disabled />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Edit</Button>
        <Button variant="destructive">Delete</Button>
      </CardFooter>
    </Card>
  );
}
```

### Consistent Spacing
Use Tailwind's spacing scale for consistency:

```tsx
<div className="space-y-4"> {/* Vertical spacing */}
  <Card className="p-6">   {/* Padding */}
    <div className="flex gap-3"> {/* Horizontal gap */}
      <Button size="sm">Save</Button>
      <Button variant="outline" size="sm">Cancel</Button>
    </div>
  </Card>
</div>
```

### Responsive Design
Components are mobile-first by default:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {cards.map(card => (
    <Card key={card.id} className="p-4">
      <CardTitle className="text-lg md:text-xl">{card.title}</CardTitle>
    </Card>
  ))}
</div>
```

## Dark Mode Support

### Theme Toggle Implementation

```tsx
import { useState } from 'react';
import { Button } from '@repo/ui';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Button variant="outline" onClick={toggleTheme}>
      {isDark ? '☀️' : '🌙'}
    </Button>
  );
}
```

## Build & Development

### Available Scripts

```bash
# Build TypeScript declarations
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm type-check

# Add new Shadcn/UI components
pnpm ui:add dialog
pnpm ui:add dropdown-menu form
```

### Package Exports

The package exports components through multiple entry points:

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./components/*": {
      "types": "./src/components/*.tsx", 
      "default": "./src/components/*.tsx"
    },
    "./lib/*": {
      "types": "./src/lib/*.ts",
      "default": "./src/lib/*.ts"  
    }
  }
}
```

Usage:
```tsx
import { Button } from '@repo/ui';                    // Main export
import { Button } from '@repo/ui/components/ui/button'; // Direct import
import { cn } from '@repo/ui/lib/utils';                // Utility import
```

## Related Documentation

- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)