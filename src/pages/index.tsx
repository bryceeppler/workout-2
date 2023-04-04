import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import LoadingPage from "~/components/loading";
import SignInPage from "~/components/signin";

const AddActivityWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="my-auto rounded border border-emerald-600 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow hover:bg-emerald-400">
        Add meal
      </div>
      <div className="my-auto rounded border border-emerald-600 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow hover:bg-emerald-400">
        Add activity
      </div>
    </div>
  );
};

type Workout = RouterOutputs["workouts"]["getIncomplete"][number];
const IncompleteWorkoutView = (props: { workout: Workout }) => {
  const { title, id } = props.workout;
  return <Link href={`/workout/${id}`} className="rounded border border-neutral-600 p-4">{title}</Link>;
};

const UpcomingWorkoutsView = (props: { workouts: Workout[] }) => {
  const { workouts } = props;
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-lg font-bold">Upcoming Workouts</div>
      {workouts?.map((workout) => (
        <IncompleteWorkoutView key={workout.id} workout={workout} />
      ))}
    </div>
  );
};

const ProgressView = () => {
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-lg font-bold">Progress</div>
      <div className="rounded border border-neutral-600 p-4">Progress</div>
    </div>
  );
};

const LeaderboardView = () => {
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-lg font-bold">Leaderboard</div>
      <div className="rounded border border-neutral-600 p-4">Leaderboard</div>
    </div>
  );
}

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <LoadingPage />;

  // Return sign in page if user is not signed in
  if (!isSignedIn)
    return <SignInPage /> 

  const { data, isLoading: workoutsLoaded } =
    api.workouts.getIncomplete.useQuery({ userId: user.id });

  if (workoutsLoaded) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Gym App 2</title>
        <meta name="description" content="Brycey boys website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full md:max-w-2xl">
          <div className="flex border-b border-neutral-600 p-4">
              <div className="flex w-full justify-between">
                <AddActivityWizard />
                <SignOutButton />
              </div>
          </div>
          <UpcomingWorkoutsView workouts={data} />
          <ProgressView />
          <LeaderboardView />
        </div>
      </main>
    </>
  );
};

export default Home;
