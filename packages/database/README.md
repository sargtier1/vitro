# @repo/database 🗃️

Database package powered by **Prisma ORM** with **PostgreSQL** for type-safe database operations and schema management.

## ✨ Features

- 🔷 **Prisma ORM** - Type-safe database client with auto-completion
- 🐘 **PostgreSQL** - Robust relational database support
- 🔐 **Better Auth Schema** - Pre-configured authentication tables
- 📊 **GraphQL Integration** - Auto-generated GraphQL types via Pothos
- 🔄 **CRUD Generation** - Automatic CRUD operations for GraphQL
- 🛡️ **Type Safety** - Full TypeScript integration
- 🏃‍♂️ **Lazy Loading** - Runtime initialization for optimal performance

## 📦 Installation

This package is part of the monorepo and installed automatically with:

```bash
pnpm install
```

## 🔧 Environment Variables

Required environment variable in root `.env`:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Example with Neon (cloud PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

## 🚀 Usage

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

// Aggregations
const userStats = await prisma.user.aggregate({
  _count: { id: true },
  where: {
    createdAt: {
      gte: new Date('2024-01-01')
    }
  }
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

## 🗃️ Database Schema

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

model Verification {
  id         String   @id @default(cuid())
  identifier String   // Email or phone for verification
  value      String   // Verification token/code
  expiresAt  DateTime // Verification expiration
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

## 🏃‍♂️ Available Scripts

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

## 🔄 Database Migrations

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

### Migration Commands

```bash
# Create migration
pnpm dlx prisma migrate dev --name add_user_role

# Reset migrations (development only)
pnpm dlx prisma migrate reset

# Deploy migrations (production)
pnpm dlx prisma migrate deploy

# View migration status
pnpm dlx prisma migrate status
```

## 📊 GraphQL Integration

The database automatically generates GraphQL types and CRUD operations:

### Generated Types

```typescript
// Auto-generated from Prisma schema
type User {
  id: String!
  name: String
  email: String!
  role: String!
  createdAt: DateTime!
  posts: [Post!]!
}

type Post {
  id: String!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  createdAt: DateTime!
}
```

### Auto-Generated Queries

```graphql
query GetUsers {
  users {
    id
    name
    email
    posts {
      id
      title
      published
    }
  }
}

query GetPost($id: String!) {
  post(where: { id: $id }) {
    id
    title
    content
    author {
      name
      email
    }
  }
}
```

### Auto-Generated Mutations

```graphql
mutation CreatePost($data: PostCreateInput!) {
  createPost(data: $data) {
    id
    title
    content
    author {
      name
    }
  }
}

mutation UpdatePost($where: PostWhereUniqueInput!, $data: PostUpdateInput!) {
  updatePost(where: $where, data: $data) {
    id
    title
    published
  }
}
```

## 🛡️ Type Safety & Validation

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

### Input Validation

```typescript
import { z } from 'zod';

// Validation schemas based on Prisma types
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: z.enum(['user', 'admin']).default('user')
});

// Usage in API routes
export async function createUser(input: unknown) {
  const data = CreateUserSchema.parse(input);
  
  return prisma.user.create({ data });
}
```

## 🔧 Configuration

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

### Lazy Loading

The database client uses lazy initialization to improve startup performance:

```typescript
// Client is created only when first used
const user = await prisma.user.findFirst(); // Creates client here
```

## 🧪 Testing

### Test Database Setup

```typescript
// test/setup.ts
import { prisma } from '@repo/database';

beforeEach(async () => {
  // Clean database before each test
  await prisma.$executeRaw`TRUNCATE TABLE "user", "post", "session" CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Test Helpers

```typescript
// test/helpers.ts
export async function createTestUser(overrides: Partial<User> = {}) {
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      ...overrides
    }
  });
}

export async function createTestPost(authorId: string) {
  return prisma.post.create({
    data: {
      title: 'Test Post',
      content: 'Test content',
      authorId
    }
  });
}
```

## 🚀 Production Considerations

### Database Connection

```typescript
// Production connection with retry logic
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  },
  log: ['error'],
  errorFormat: 'minimal'
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Performance Optimization

```typescript
// Connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20&connect_timeout=60"

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

## 🔍 Debugging

### Enable Query Logging

```bash
# Add to .env for development
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public&connection_limit=5"
```

### Prisma Studio

```bash
# Visual database browser
pnpm db:studio

# Opens at http://localhost:5555
```

### Common Issues

**"Environment variable not found: DATABASE_URL"**
```bash
# Ensure DATABASE_URL is set
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/mydb" >> .env
```

**Migration errors**
```bash
# Reset development database
pnpm dlx prisma migrate reset

# Recreate from schema
pnpm db:push
```

**Client generation issues**
```bash
# Force regenerate client
rm -rf node_modules/.prisma
pnpm db:generate
```

## 📚 Related Documentation

- **[Prisma Documentation](https://www.prisma.io/docs/)** - Official Prisma docs
- **[Better Auth Integration](../auth/README.md)** - Authentication setup
- **[GraphQL Package](../graphql/README.md)** - Auto-generated GraphQL API
- **[tRPC Package](../trpc/README.md)** - Type-safe API procedures

## 🤝 Contributing

When modifying the database schema:

1. **Update schema**: Edit `prisma/schema.prisma`
2. **Push changes**: Run `pnpm db:push` (development)
3. **Generate client**: Run `pnpm db:generate`
4. **Update GraphQL**: Types auto-generated via Pothos
5. **Test changes**: Verify all integrations work
6. **Create migration**: Run `pnpm db:migrate` (production)

### Adding New Models

```prisma
// Example: Adding a Category model
model Category {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]

  @@map("categories")
}

// Add relation to existing model
model Post {
  // ... existing fields
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
}
```

---

**Built with Prisma for type-safe database operations** 🗃️