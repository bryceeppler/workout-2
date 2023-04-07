// @ts-nocheck
import { type User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { type Activity, type CompletedWorkout } from "@prisma/client";
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

function calculatePoints(
  users: User[],
  completedWorkouts: CompletedWorkout[],
  activities: Activity[]
) {
  const points = {} as Points;
  users.forEach((user) => {
    const userWorkouts = completedWorkouts.filter(
      (workout) => workout.authorId === user.id
    );
    const userActivities = activities.filter(
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
}

function calculateStreak(
  completedWorkouts: CompletedWorkout[],
  activities: Activity[]
) {
  console.log("calculateStreak")
  const today = new Date();
  let streakDay = new Date(today);

  const pointEarnedToday = completedWorkouts.some(
    (workout) => getDateString(workout.createdAt) === getDateString(today) && workout.status === "completed"
  ) || activities.some(
    (activity) =>
      (getDateString(activity.createdAt) === getDateString(today)) && (activity.type === "meal") ? (activity.value >= 3 ? true : false) : true
  );


  while (true) {
    // Create a new date object for the previous day
    const previousDay = new Date(streakDay);
    previousDay.setDate(previousDay.getDate() - 1);

    // Check if there are any completed workouts or activities on the previous day
    if (
      completedWorkouts.some(
        (workout) =>
          getDateString(workout.createdAt) === getDateString(previousDay) && workout.status === "completed"
      )
    ) {
      streakDay = previousDay;
    } else if (
      activities.some(
        (activity) =>
          (getDateString(activity.createdAt) === getDateString(previousDay)) && (activity.type === "meal") ? (activity.value >= 3 ? true : false) : true
      )
    ) {
      streakDay = previousDay;
    } else {
      break;
    }
  }

  const lengthOfStreakInDays = Math.floor(
    (today.getTime() - streakDay.getTime()) / (1000 * 3600 * 24)
  );
  if (pointEarnedToday) {
    return lengthOfStreakInDays + 1;
  }
  return lengthOfStreakInDays;
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
  });
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
    const points = calculatePoints(
      users,
      completedWorkouts,
      combinedActivities
    );

    return points;
  }),

  getAllUserInfo: publicProcedure.query(async ({ ctx }) => {
    const users = await clerkClient.users.getUserList();
    // const filteredUsers = filterUserData(users);
    // now we want
    const filteredUsers = filterUserData(users);
    // now we want a streak field for each user
    const completedWorkouts = await ctx.prisma.completedWorkout.findMany();
    const completedActivities = await ctx.prisma.activity.findMany();
    const combinedActivities = preprocessActivities(completedActivities);
    const usersWithStreak = filteredUsers.map((user) => {
      const streak = calculateStreak(
        completedWorkouts.filter((workout) => workout.authorId === user.id),
        combinedActivities.filter((activity) => activity.authorId === user.id)
      );
      return {
        ...user,
        streak,
      };
    });
    return usersWithStreak;
  
  }),

  getUserInfo: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(input.userId);
      // now we want to add a streak field t the user object
      const filteredUser = filterUserData([user][0]);
      // fetch the users completed workouts and activities and calculate the streak
      const completedWorkouts = await ctx.prisma.completedWorkout.findMany({
        where: {
          authorId: user.id,
        },
      });
      const completedActivities = await ctx.prisma.activity.findMany({
        where: {
          authorId: user.id,
        },
      });
      const combinedActivities = preprocessActivities(completedActivities);
      const streak = calculateStreak(completedWorkouts, combinedActivities);
      return {
        ...filteredUser,
        streak,
      };
    }),

  getUserSpiderChart: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // same at getPoints
      const user = await clerkClient.users.getUser(input.userId);
      const completedWorkouts = await ctx.prisma.completedWorkout.findMany();
      const completedActivities = await ctx.prisma.activity.findMany();
      const combinedActivities = preprocessActivities(completedActivities);
      // labels: ['Meals', 'Stretch', 'Cardio', 'Workouts', 'Cold Plunge'],
      //     label: '# of Points',
      //     data: [5, 9, 12, 6, 4],
      // build to data array and return it

      const userWorkouts = completedWorkouts.filter(
        (workout) => workout.authorId === user.id
      );

      const userActivities = combinedActivities.filter(
        (activity) => activity.authorId === user.id
      );

      const data = [0, 0, 0, 0, 0];
      userWorkouts.forEach((workout) => {
        if (workout.status !== "completed") {
          return;
        }
        data[3] += 1;
      });

      userActivities.forEach((activity) => {
        if (activity.type === "cardio" && activity.value >= 15) {
          data[2] += 1;
        }
        if (activity.type === "stretch" && activity.value >= 10) {
          data[1] += 1;
        }
        if (activity.type === "cold plunge" && activity.value > 0) {
          data[4] += 1;
        }
        if (activity.type === "meal") {
          const mealCount = Math.min(Math.floor(activity.value / 3), 1);
          data[0] += mealCount;
        }
      });

      return data;
    }),
  getActivityFeed: publicProcedure.query(async ({ ctx }) => {
    // get all completedWorkouts and activities for the last 7 days
    // sort by date
    // return an array of objects with the following shape
    // {
    //   date: "2021-09-01",
    //   type: "workout", // || "meal" || "stretch" || "cardio" || "cold plunge" ||
    //   message: "User1 completed Legs workout." || "User1 completed 25 min of cardio." || "User1 completed 10 min of stretching." || "User1 completed a 2 min cold plunge." || "User1 completed 3 meals.
    // }
    const completedWorkouts = await ctx.prisma.completedWorkout.findMany({
      include: {
        workout: true,
      },
    });
    const completedActivities = await ctx.prisma.activity.findMany();
    const combinedActivities = preprocessActivities(completedActivities);
    console.log(`Number of completed workouts: ${completedWorkouts.length}`);
    console.log(`Number of combined activities: ${combinedActivities.length}`);
    const users = await clerkClient.users.getUserList();
    const feed = [] as [
      {
        date: Date;
        type: string;
        message: string;
      }
    ];
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const filteredWorkouts = completedWorkouts.filter((workout) => {
      const workoutDate = new Date(workout.createdAt);
      return workoutDate >= lastWeek && workoutDate <= today;
    });

    const filteredActivities = combinedActivities.filter((activity) => {
      const activityDate = new Date(activity.createdAt);
      return activityDate >= lastWeek && activityDate <= today;
    });

    console.log(`Number of filtered workouts: ${filteredWorkouts.length}`);
    filteredWorkouts.forEach((workout) => {
      const user = users.find((user) => user.id === workout.authorId);
      feed.push({
        date: workout.createdAt,
        type: "workout",
        // should be completed / skipped workout
        message: `${user.firstName || ""} ${
          workout.status !== "completed" ? "skipped" : "completed"
        } ${workout.workout.title || ""} workout.`,
      });
    });
    filteredActivities.forEach((activity) => {
      const user = users.find((user) => user.id === activity.authorId);
      if (activity.type === "cardio") {
        feed.push({
          date: activity.createdAt,
          type: "cardio",
          message: `${user.firstName || ""} completed ${
            activity.value || 0
          } min of cardio.`,
        });
      }
      if (activity.type === "stretch") {
        feed.push({
          date: activity.createdAt,
          type: "stretch",
          message: `${user.firstName || ""} completed ${
            activity.value || 0
          } min of stretching.`,
        });
      }
      if (activity.type === "cold plunge") {
        feed.push({
          date: activity.createdAt,
          type: "cold plunge",
          message: `${user.firstName || ""} completed a ${
            activity.value || 0
          } min cold plunge.`,
        });
      }
      if (activity.type === "meal") {
        feed.push({
          date: activity.createdAt,
          type: "meal",
          message: `${user.firstName || ""} completed ${
            activity.value || 0
          } meals.`,
        });
      }
    });
    feed.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    return feed;
  }),
});
