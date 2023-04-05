import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// Helper function to get the date string from a Date object
function getDateString(date: Date): string {
  return date.toISOString()?.split("T")[0] ?? "";
}
interface Points {
  [date: string]: {
    [userId: string]: number;
  };
}
// Pre-process function to combine entries with the same activity.type, activity.authorId, activity.createdAt date
function preprocessActivities(activities: any[]) {
  const combinedActivities: any[] = [];

  activities.forEach((activity) => {
    const date = getDateString(activity.createdAt);
    const existingActivity = combinedActivities.find(
      (a) =>
        a.authorId === activity.authorId &&
        a.type === activity.type &&
        getDateString(a.createdAt) === date
    );

    if (existingActivity) {
      existingActivity.value += activity.value;
    } else {
      combinedActivities.push(activity);
    }
  });

  return combinedActivities;
}
export const usersRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getPoints: publicProcedure.query(async ({ ctx }) => {
    // Each user can earn max 3 points per day

    // 3 meals in 1 days = 1 point
    // 1 workout = 1 point
    // 'cardio' activity where value > 15 = 1 point
    // 'stretching' activity where value > 15 = 1 point
    // 'cold plunge' activity where value > 0 = 1 point

    // get a point total for each day for each user and return something like this
    // {
    //   "2021-09-01": {
    //     "user1": 3,
    //     "user2": 2,
    //     "user3": 1,
    //   },
    //   "2021-09-02": {
    //     "user1": 2,
    //     "user2": 1,
    //     "user3": 0,
    //   },
    //   ...
    // }
    const users = await clerkClient.users.getUserList();
    const completedWorkouts = await ctx.prisma.completedWorkout.findMany();
    const completedActivities = await ctx.prisma.activity.findMany();
    const combinedActivities = preprocessActivities(completedActivities);
    let points: Points = {};

    users.forEach((user) => {
      const userWorkouts = completedWorkouts.filter(
        (workout) => workout.authorId === user.id
      );
      const userActivities = combinedActivities.filter(
        (activity) => activity.authorId === user.id
      );

      userWorkouts.forEach((workout) => {
        const date = getDateString(workout.createdAt);
        console.log(date);

        if (!points[date]) {
          points[date] = { [user.id]: 0 };
          // @ts-ignore
        } else if (!points[date][user.id]) {
          // @ts-ignore
          points[date][user.id] = 0;
        }
        // @ts-ignore
        points[date][user.id] += 1;
      });

      userActivities.forEach((activity) => {
        const date = getDateString(activity.createdAt);
        console.log(activity)

        if (!points[date]) {
          points[date] = { [user.id]: 0 };
          // @ts-ignore
        } else if (!points[date][user.id]) {
          // @ts-ignore
          points[date][user.id] = 0;
        }

        if (
          (activity.type === "cardio" && activity.value >= 15) ||
          (activity.type === "stretch" && activity.value >= 15) ||
          (activity.type === "cold plunge" && activity.value > 0)
        ) {
          // @ts-ignore
          points[date][user.id] += 1;
        } else if (activity.type === "meal") {
          const mealCount = Math.min(Math.floor(activity.value / 3), 1);
                    // @ts-ignore
          points[date][user.id] += mealCount;
        }        

        // Limit the points to a maximum of 3
        // @ts-ignore
        points[date][user.id] = Math.min(points[date][user.id], 3);
      });
    });

    return points;
  }),
});
