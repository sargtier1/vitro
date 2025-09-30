import { type } from 'arktype';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../server';

// Input validation schemas
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

// Mock data store (replace with database when ready)
const mockPosts = [
  {
    id: '1',
    title: 'Welcome Post',
    content: 'This is a sample post to demonstrate the tRPC setup.',
    author: { id: '1', name: 'System' },
    createdAt: new Date(),
  },
];

export const postsRouter = createTRPCRouter({
  // Get all posts - public endpoint
  getAll: publicProcedure.query(async () => {
    return mockPosts;
  }),

  // Get post by ID - public endpoint
  getById: publicProcedure
    .input((input: unknown) => PostIdInput.assert(input))
    .query(async ({ input }) => {
      const post = mockPosts.find(p => p.id === input.id);
      if (!post) {
        throw new Error('Post not found');
      }
      return post;
    }),

  // Create post - requires auth
  create: protectedProcedure
    .input((input: unknown) => CreatePostInput.assert(input))
    .mutation(async ({ input, ctx }) => {
      const newPost = {
        id: Date.now().toString(),
        title: input.title,
        content: input.content,
        author: { id: ctx.user.id, name: ctx.user.name || 'Anonymous' },
        createdAt: new Date(),
      };
      
      // Add to mock store (in real app, save to database)
      mockPosts.unshift(newPost);
      
      return newPost;
    }),

  // Update post - requires auth (simplified for demo)
  update: protectedProcedure
    .input((input: unknown) => UpdatePostInput.assert(input))
    .mutation(async ({ input, ctx: _ctx }) => {
      const postIndex = mockPosts.findIndex(p => p.id === input.id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }
      
      // Update mock post
      const updatedPost = {
        ...mockPosts[postIndex],
        ...(input.title && { title: input.title }),
        ...(input.content && { content: input.content }),
        updatedAt: new Date(),
      };
      
      mockPosts[postIndex] = updatedPost;
      return updatedPost;
    }),

  // Delete post - requires auth (simplified for demo)
  delete: protectedProcedure
    .input((input: unknown) => PostIdInput.assert(input))
    .mutation(async ({ input, ctx: _ctx }) => {
      const postIndex = mockPosts.findIndex(p => p.id === input.id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }
      
      // Remove from mock store
      mockPosts.splice(postIndex, 1);
      
      return {
        success: true,
        deletedId: input.id,
      };
    }),
});
