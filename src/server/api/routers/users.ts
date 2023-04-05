// @ts-nocheck
import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { Activity } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// Helper function to get the date string from a Date object
function getDateString(date: Date): string {
  return date.toISOString()?.split("T")[0] ?? "";
}
interface UserPoints {
  [userId: string]: number;
}

interface Points {
  [date: string]: UserPoints;
}

// Pre-process function to combine entries with the same activity.type, activity.authorId, activity.createdAt date
function preprocessActivities(activities: Activity[]) {
  const combinedActivities: Activity[] = [];

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

function filterUserData(users: User[]) {

    return users.map((user) => {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        username: user.username,
      };
    })
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
    const points = {} as Points;
  

    users.forEach((user) => {
      const userWorkouts = completedWorkouts.filter(
        (workout) => workout.authorId === user.id
      );
      const userActivities = combinedActivities.filter(
        (activity) => activity.authorId === user.id
      );

      userWorkouts.forEach((workout) => {
        if (workout.status !== "completed") {
          return;
        }
        const date = getDateString(workout.createdAt);
        
        if (!points[date]) {
          points[date] = { [user.id]: 0 };
        } else if (!points[date][user.id]) {
          points[date][user.id] = 0;
        }
        
        
        // @ts-ignore
        // if status is completed, add 1 point
        points[date][user.id] += 1;
      });

      userActivities.forEach((activity) => {
        const date = getDateString(activity.createdAt);
        console.log(activity)

        if (!points[date]) {
          points[date] = { [user.id]: 0 };

        } else if (!points[date][user.id]) {

          points[date][user.id] = 0;
        }

        if (
          (activity.type === "cardio" && activity.value >= 15) ||
          (activity.type === "stretch" && activity.value >= 10) ||
          (activity.type === "cold plunge" && activity.value > 0)
        ) {

          points[date][user.id] += 1;
        } else if (activity.type === "meal") {
          const mealCount = Math.min(Math.floor(activity.value / 3), 1);
          
          points[date][user.id] += mealCount;
        }        

        // Limit the points to a maximum of 3
        // @ts-ignore
        points[date][user.id] = Math.min(points[date][user.id], 3);
      });
    });

    return points;
  }),

  getAllUserInfo: publicProcedure.query(async ({ ctx }) => {
    const users = await clerkClient.users.getUserList();

    return filterUserData(users);
  }),

  getUserInfo: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(input.userId);

      return filterUserData([user])[0];
    }
  ),
});
