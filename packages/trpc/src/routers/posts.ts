import { type } from 'arktype';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server';

// Arktype schemas
const CreatePostInput = type({
  title: 'string>0',
  content: 'string>0',
});

const UpdatePostInput = type({
  id: 'string',
  'title?': 'string>0',
  'content?': 'string>0',
});

const PostIdInput = type({
  id: 'string',
});

export const postsRouter = createTRPCRouter({
  // Get all posts - public endpoint
  getAll: publicProcedure.query(async () => {
    // Uncomment when you have a Post model in your Prisma schema
    // const posts = await ctx.prisma.post.findMany({
    //   include: {
    //     author: {
    //       select: {
    //         id: true,
    //         name: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: 'desc',
    //   },
    // });
    // return posts;

    // Mock data for now
    return [
      {
        id: '1',
        title: 'Welcome Post',
        content: 'This is a sample post',
        author: { id: '1', name: 'System' },
        createdAt: new Date(),
      },
    ];
  }),

  // Get post by ID - public endpoint
  getById: publicProcedure
    .input((input: unknown) => {
      const result = PostIdInput.assert(input);
      return result;
    })
    .query(async ({ input }) => {
      // Uncomment when you have a Post model
      // const post = await ctx.prisma.post.findUnique({
      //   where: { id: input.id },
      //   include: {
      //     author: {
      //       select: {
      //         id: true,
      //         name: true,
      //       },
      //     },
      //   },
      // });
      // return post;

      // Mock data for now
      return {
        id: input.id,
        title: `Post ${input.id}`,
        content: `Content for post ${input.id}`,
        author: { id: '1', name: 'System' },
        createdAt: new Date(),
      };
    }),

  // Create post - requires auth
  create: protectedProcedure
    .input((input: unknown) => {
      const result = CreatePostInput.assert(input);
      return result;
    })
    .mutation(async ({ input, ctx }) => {
      // Uncomment when you have a Post model
      // const newPost = await ctx.prisma.post.create({
      //   data: {
      //     title: input.title,
      //     content: input.content,
      //     authorId: ctx.user.id,
      //   },
      //   include: {
      //     author: {
      //       select: {
      //         id: true,
      //         name: true,
      //       },
      //     },
      //   },
      // });
      // return newPost;

      // Mock response for now
      return {
        id: Date.now().toString(),
        title: input.title,
        content: input.content,
        author: { id: ctx.user.id, name: ctx.user.name },
        createdAt: new Date(),
      };
    }),

  // Update post - requires auth and ownership
  update: protectedProcedure
    .input((input: unknown) => {
      const result = UpdatePostInput.assert(input);
      return result;
    })
    .mutation(async ({ input, ctx }) => {
      // Uncomment when you have a Post model
      // const post = await ctx.prisma.post.findUnique({
      //   where: { id: input.id },
      // });

      // if (!post) {
      //   throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      // }

      // if (post.authorId !== ctx.user.id) {
      //   throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own posts' });
      // }

      // const updatedPost = await ctx.prisma.post.update({
      //   where: { id: input.id },
      //   data: {
      //     ...(input.title && { title: input.title }),
      //     ...(input.content && { content: input.content }),
      //   },
      //   include: {
      //     author: {
      //       select: {
      //         id: true,
      //         name: true,
      //       },
      //     },
      //   },
      // });
      // return updatedPost;

      // Mock response for now
      return {
        id: input.id,
        title: input.title || `Post ${input.id}`,
        content: input.content || 'Updated content',
        author: { id: ctx.user.id, name: ctx.user.name },
        updatedAt: new Date(),
      };
    }),

  // Delete post - requires auth and ownership
  delete: protectedProcedure
    .input((input: unknown) => {
      const result = PostIdInput.assert(input);
      return result;
    })
    .mutation(async ({ input, ctx }) => {
      // Uncomment when you have a Post model
      // const post = await ctx.prisma.post.findUnique({
      //   where: { id: input.id },
      // });

      // if (!post) {
      //   throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      // }

      // if (post.authorId !== ctx.user.id) {
      //   throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own posts' });
      // }

      // await ctx.prisma.post.delete({
      //   where: { id: input.id },
      // });

      return {
        success: true,
        deletedId: input.id,
        deletedBy: ctx.user?.id || 'unknown',
      };
    }),
});
