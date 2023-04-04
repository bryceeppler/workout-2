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
  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const workout = await ctx.prisma.workout.findUnique({
      where: {
        id: input.id,
      },
    });

    return workout;
  }
  ),
});
