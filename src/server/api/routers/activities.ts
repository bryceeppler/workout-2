import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const activitiesRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getPoints: publicProcedure.query(async ({ ctx }) => {
    // we are going to get a list of users, list of completed workouts, and list of compelted meals and list of completed activity
    // for each user we will calculate points

    const users = await clerkClient.users.getUserList();
    const completedWorkouts = await ctx.prisma.completedWorkout.findMany();
    const completedActivities = await ctx.prisma.activity.findMany();

  }),
  addActivity: publicProcedure.input(z.object({ userId: z.string(), activity: z.string(), value: z.number() })).mutation(async ({ ctx, input }) => {
    try{
    const activity = await ctx.prisma.activity.create({
      data: {
        authorId: input.userId,
        type: input.activity,
        value: input.value,
      },
    });
  } catch (e) {
    console.log(e);
  }
  }),
  getByUser:  publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    const activities = await ctx.prisma.activity.findMany({
      where: {
        authorId: input.userId,
      },
    });
    return activities;
  }
  ),
});

