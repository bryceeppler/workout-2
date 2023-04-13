import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
function getDateString(date: Date): string {
  return dayjs(date).tz("America/Los_Angeles").format("YYYY-MM-DD");
}
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
  addActivity: publicProcedure
    .input(
      z.object({ userId: z.string(), activity: z.string(), value: z.number() })
    )
    .mutation(async ({ ctx, input }) => {
      try {
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
  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const activities = await ctx.prisma.activity.findMany({
        where: {
          authorId: input.userId,
        },
      });
      return activities;
    }),
  getWeightActivitiesByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const activities = await ctx.prisma.activity.findMany({
        where: {
          authorId: input.userId,
          type: "weight",
        },
      });
      // convert all dates to pst using dayjs
      activities.forEach((activity) => {
        activity.createdAt = dayjs(activity.createdAt)
          .utc()
          .tz("America/Los_Angeles")
          .toDate();
      });

      return activities;
    }),

  getDailyWaterActivitiesByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // console.log("getDailyWaterActivitiesByUser");
      // console.log("userId", input.userId);
      const activities = await ctx.prisma.activity.findMany({
        where: {
          authorId: input.userId,
          type: "water",
        },
      });
      // filter activities by checking date using getDateString
      // sum up all the values
      let total = 0;
      for (const activity of activities) {
        const dateString = getDateString(activity.createdAt);
        const today = getDateString(new Date());
        if (dateString === today) {
          total += activity.value;
        }
      }

      const waterGoal = 4000;

      return {
        total,
        goal: waterGoal,
        percentage: (total / waterGoal) * 100,
      };
    }),
});
