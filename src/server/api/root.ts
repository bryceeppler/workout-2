import { createTRPCRouter } from "~/server/api/trpc";
import { workoutsRouter } from "~/server/api/routers/workouts";
import { usersRouter } from "~/server/api/routers/users";
import { activitiesRouter } from "./routers/activities";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workouts: workoutsRouter,
  users: usersRouter,
  activities: activitiesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
