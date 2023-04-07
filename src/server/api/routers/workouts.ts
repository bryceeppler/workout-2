import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const workoutsRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.workout.findMany();
  }),
  getIncomplete: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    // const user = await clerkClient.users.getUser(input.userId);

    const workouts = await ctx.prisma.workout.findMany({
        // We want all workouts where this user there is no CompletedWorkout for this user
        // CompletedWorkout is a relationship for users to workouts
        take: 4,
        where: {
            completedWorkouts: {
                none: {
                    authorId: input.userId
                }
            }
        }
    });



    return workouts;
    }),
  get: publicProcedure.input(z.object({ id: z.number(), userId: z.string() })).query(async ({ ctx, input }) => {
    const workout = await ctx.prisma.workout.findUnique({
      where: {
        id: input.id,
      },
    });

    const completedWorkout = await ctx.prisma.completedWorkout.findFirst({
      where: {
        authorId: input.userId,
        workoutId: input.id,
      },
    });
    return {
      ...workout,
      status: completedWorkout ? completedWorkout.status : null,
      completedAt: completedWorkout ? completedWorkout.createdAt : null,
    }
  }
  ),
  completeWorkout: publicProcedure.input(z.object({ userId: z.string(), workoutId: z.number(), status: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      // if there is already a completedWorkout for this user and workout, update it
      const existingCompletedWorkout = await ctx.prisma.completedWorkout.findFirst({
        where: {
          authorId: input.userId,
          workoutId: input.workoutId,
        },
      });

      if (existingCompletedWorkout) {
        await ctx.prisma.completedWorkout.update({
          where: {
            id: existingCompletedWorkout.id,
          },
          data: {
            status: input.status,
          },
        });
      } else {
        await ctx.prisma.completedWorkout.create({
          data: {
            authorId: input.userId,
            workoutId: input.workoutId,
            status: input.status,
          },
        });
      }
    } catch (err) {
      console.log(err);
    }

  }),

  createComment: publicProcedure.input(z.object({ userId: z.string(), workoutId: z.number(), comment: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.workoutComment.create({
        data: {
          authorId: input.userId,
          workoutId: input.workoutId,
          content: input.comment,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
  ),

  updateComment: publicProcedure.input(z.object({ comment: z.string(), commentId: z.number() })).mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.workoutComment.update({
        where: {
          id: input.commentId,
        },
        data: {
          content: input.comment,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
  ),

  deleteComment: publicProcedure.input(z.object({ commentId: z.number() })).mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.workoutComment.delete({
        where: {
          id: input.commentId,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
  ),
  

  fetchComments: publicProcedure.input(z.object({ workoutId: z.number() })).query(async ({ ctx, input }) => {
    // we want to return the comment, but we also want to return the author instead of the author id and the user's profile image url.
    const userList = await clerkClient.users.getUserList();
    const comments = await ctx.prisma.workoutComment.findMany({
      where: {
        workoutId: input.workoutId,
      },
    });

    const commentsWithAuthor = comments.map((comment) => {
      const author = userList.find((user) => user.id === comment.authorId);
      return {
        ...comment,
        authorName: `${author?.firstName || ""} ${author?.lastName || ""}`,
        authorImageUrl: author?.profileImageUrl,
      };
    });

    return commentsWithAuthor;
  }
  ),
});

// completeWorkout: publicProcedure
// // accept a workout id and user id and create a completedWorkout entry with the given status
// // return the completedWorkout entry
// .input(z.object({ id: z.number(), userId: z.number(), status: z.string(), title: z.string() }))
// .mutation(async ({ ctx, input }) => {
//   try {
//     await ctx.prisma.completedWorkouts.create({
//       data: {
//         workoutId: input.id,
//         userId: input.userId,
//         status: input.status,
//         title: input.title,
//       },
//     });
//   }
//   catch (err) {
//     console.log(err);
//   }

// }
// ),