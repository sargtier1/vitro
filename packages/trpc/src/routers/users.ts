import { type } from 'arktype';
import { createTRPCRouter, protectedProcedure } from '../server';

// Arktype schemas
const UpdateProfileInput = type({
  'name?': 'string>0',
  'email?': 'string.email',
});

export const usersRouter = createTRPCRouter({
  // Get current user profile - requires auth
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  // Update profile - requires auth
  updateProfile: protectedProcedure
    .input((input: unknown) => UpdateProfileInput.assert(input))
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    }),

  // Get user stats - requires auth
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        createdAt: true,
        _count: {
          select: {
            // Add any relations you want to count
            // posts: true,
            // comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      userId: user.id,
      joinedAt: user.createdAt,
      lastLogin: new Date().toISOString(),
      // postsCount: user._count.posts || 0,
      // commentsCount: user._count.comments || 0,
    };
  }),
});
