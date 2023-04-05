import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import LoadingPage from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import CloseButton from "~/components/closebutton";
import { set } from "zod";
// setModalOpen
import { Dispatch, SetStateAction } from "react";

interface ActivityModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}
const ActivityModal = ({ setModalOpen }: ActivityModalProps) => {
  const [selectedActivity, setSelectedActivity] = useState<String | null>(null);
  const [activityValue, setActivityValue] = useState<Number | null>(null);
  return (
    <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-neutral-900 bg-opacity-50 backdrop-blur-sm">
      <div className="w-full rounded bg-neutral-800 p-4 sm:max-w-md">
        <div className="flex justify-between">
          <div className="text-lg font-bold">Add Activity</div>
          <CloseButton onClick={() => setModalOpen(false)} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-sm font-bold">Activity</div>

          <div className="flex flex-grow">
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "meal"
                  ? "bg-emerald-500 text-neutral-200"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("meal")}
            >
              Meal
            </div>
            {/* cardio */}
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "cardio"
                  ? "bg-emerald-500 text-neutral-200"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("cardio")}
            >
              Cardio
            </div>

            {/* stretch */}
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "stretch"
                  ? "bg-emerald-500 text-neutral-200"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("stretch")}
            >
              Stretch
            </div>

            {/* cold plunge */}
            <div
              className={`w-40 rounded border border-neutral-600 py-2 text-center text-xs hover:bg-neutral-700 ${
                selectedActivity === "cold plunge"
                  ? "bg-emerald-500 text-neutral-200"
                  : "bg-neutral-800 text-neutral-400"
              }`}
              onClick={() => setSelectedActivity("cold plunge")}
            >
              Cold Plunge
            </div>
          </div>

          <div className="text-sm font-bold">
            {selectedActivity === "meal" ? "Number of meals" : "Minutes"}
          </div>
          <div className="">
            <input
              type="number"
              className="w-full rounded border border-neutral-600 bg-black p-2 focus:border-emerald-500 focus:outline-none"
              value={Number(activityValue)}
              onChange={(e) => setActivityValue(Number(e.target.value))}
            />
          </div>
          <div className="mx-auto w-40 rounded border border-emerald-600 bg-emerald-500 px-4 py-2 text-center font-semibold text-neutral-200 shadow hover:bg-emerald-400">
            Submit
          </div>
        </div>
      </div>
    </div>
  );
};
const AddActivityWizard = () => {
  const { user } = useUser();
  if (!user) return null;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {modalOpen && <ActivityModal setModalOpen={setModalOpen} />}
      <div className="flex gap-3">
        <Image
          src={user.profileImageUrl}
          alt="Profile image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        {/* <div className="my-auto rounded border border-emerald-600 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow hover:bg-emerald-400">
        Add meal
      </div> */}
        <div
          className="my-auto rounded border border-emerald-600 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow hover:bg-emerald-400"
          onClick={() => setModalOpen(true)}
        >
          Add activity
        </div>
      </div>
    </>
  );
};

type Workout = RouterOutputs["workouts"]["getIncomplete"][number];
const IncompleteWorkoutView = (props: { workout: Workout }) => {
  const { title, id } = props.workout;
  return (
    <Link
      href={`/workout/${id}`}
      className="rounded border border-neutral-600 p-4 hover:bg-neutral-800"
    >
      {title}
    </Link>
  );
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
      {/* grid displaying max the last 30 days of activity */}
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
};

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <LoadingPage />;

  // Return sign in page if user is not signed in
  if (!isSignedIn) return <SignInPage />;

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
            <div className="flex w-full flex-col justify-between ">
              <AddActivityWizard />
            </div>
          </div>
          <UpcomingWorkoutsView workouts={data} />
          <ProgressView />
          <LeaderboardView />
          <div className="mt-5 flex justify-center">
            <SignOutButton />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
