# @repo/database

Database package powered by Prisma ORM with PostgreSQL for type-safe database operations and schema management.

## Features

- Prisma ORM - Type-safe database client with auto-completion
- PostgreSQL - Robust relational database support
- Better Auth Schema - Pre-configured authentication tables
- Type Safety - Full TypeScript integration
- Lazy Loading - Runtime initialization for optimal performance

## Installation

This package is part of the monorepo and installed automatically with:

```bash
pnpm install
```

## Environment Variables

Required environment variable in root `.env`:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Example with Neon (cloud PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

## Usage

### Basic Database Operations

```typescript
import { prisma } from '@repo/database';

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user'
  }
});

// Find users
const users = await prisma.user.findMany({
  where: { role: 'user' },
  include: { posts: true }
});

// Update user
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Jane Doe' }
});

// Delete user (cascades to posts and sessions)
await prisma.user.delete({
  where: { id: userId }
});
```

### Advanced Queries

```typescript
// Complex filtering and relations
const postsWithAuthors = await prisma.post.findMany({
  where: {
    published: true,
    author: {
      role: 'admin'
    }
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 10
});

// Transactions
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com', name: 'John' }
  });
  
  const post = await tx.post.create({
    data: {
      title: 'First Post',
      content: 'Hello world!',
      authorId: user.id
    }
  });
  
  return { user, post };
});
```

## Database Schema

### User Management (Better Auth Compatible)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique  
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts Account[]  // OAuth provider accounts
  sessions Session[]  // Active user sessions  
  posts    Post[]     // User's posts
}
```

### Authentication Tables

```prisma
model Account {
  id           String   @id @default(cuid())
  accountId    String   // Provider account ID
  providerId   String   // OAuth provider (google, github, etc.)
  userId       String   // Reference to User
  accessToken  String?  // OAuth access token
  refreshToken String?  // OAuth refresh token
  idToken      String?  // OAuth ID token
  expiresAt    DateTime? // Token expiration
  password     String?  // Hashed password for email/password auth

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime // Session expiration
  ipAddress String?  // Client IP for security
  userAgent String?  // Client user agent
  userId    String   // Reference to User

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Content Management

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String   // Post title
  content   String   // Post content (markdown/HTML)
  published Boolean  @default(false) // Published status
  authorId  String   // Reference to User
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

## Available Scripts

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database (development)
pnpm db:push

# Create and run migrations (production)
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database (development only)
pnpm db:reset

# Seed database with sample data
pnpm db:seed
```

## Database Migrations

### Development Workflow

```bash
# 1. Make schema changes in schema.prisma
# 2. Push changes to development database
pnpm db:push

# 3. Generate new client
pnpm db:generate

# 4. Test your changes
pnpm dev
```

### Production Workflow

```bash
# 1. Create migration after schema changes
pnpm db:migrate

# 2. Review generated migration file
# 3. Deploy migration to production
pnpm db:deploy
```

## Type Safety & Validation

### Generated Types

```typescript
import type { User, Post, Prisma } from '@repo/database';

// Prisma-generated types
type CreateUserInput = Prisma.UserCreateInput;
type UpdateUserInput = Prisma.UserUpdateInput;
type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>;

// Example usage with full type safety
async function createUserWithPost(data: CreateUserInput) {
  const user = await prisma.user.create({
    data,
    include: { posts: true }
  });
  
  return user; // Type: UserWithPosts
}
```

## Configuration

### Prisma Client Configuration

```typescript
// packages/database/src/index.ts
export const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});
```

### Connection Pool Settings

```env
# Advanced connection settings
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
```

## Production Considerations

### Performance Optimization

```typescript
// Query optimization
const users = await prisma.user.findMany({
  select: { id: true, email: true }, // Select only needed fields
  take: 50, // Limit results
  skip: 0,  // Pagination
  where: {
    createdAt: {
      gte: lastWeek // Indexed field
    }
  }
});
```

### Monitoring

```typescript
// Query logging in production
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' }
  ]
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log slow queries
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params
    });
  }
});
```

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Better Auth Integration](../auth/README.md)
- [tRPC Package](../trpc/README.md)