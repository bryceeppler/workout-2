import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
const PreviousWorkoutView = (props: {
  workout: {
    title: string;
    date: string;
    exercise: string;
    sets: {
      weight: number;
      reps: number;
    }[];
  };
}) => {
  return (
    <div className="rounded bg-neutral-800 p-4">
      <div>Previous workout:</div>

      <div className="flex justify-between">
        <div>{props.workout.title}</div>
        <div>{props.workout.date}</div>
      </div>
      <div className="flex justify-between">
        <div>{props.workout.exercise}</div>
        <div>{props.workout.sets.length} sets</div>
      </div>
      <div className="flex flex-col">
        {props.workout.sets.map((set, i) => {
          return (
            <div className="flex justify-between">
              <div>Set {i + 1}</div>
              <div>
                {set.weight} lbs x {set.reps}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const Workout = () => {
  const router = useRouter();
  const { wid } = router.query;
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const previousWorkoutData = {
    title: "Chest",
    date: "2021-08-01",
    exercise: "Barbell Bench Press",
    sets: [
      {
        weight: 100,
        reps: 10,
      },
      {
        weight: 100,
        reps: 10,
      },
      {
        weight: 100,
        reps: 10,
      },
    ],
  };
  
  const completeWorkout = api.workouts.completeWorkout.useMutation({
    onSuccess: () => {
    //   utils.workouts.getIncompleteWorkouts
    //   .invalidate()
    //   .catch((err) => console.log(err));
    // utils.users.getUserList.invalidate().catch((err) => console.log(err));
    }
  });

  if (!userLoaded) return <LoadingPage />;

  // Return sign in page if user is not signed in
  if (!isSignedIn) return <SignInPage />;

  // wid is a string, but we need it to be a number
  const { data, isLoading: workoutLoading } = api.workouts.get.useQuery({
    id: Number(wid),
  });
  console.log(data);

  const [numSets, setNumSets] = useState(2);
  const handleNumSetsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNumSets(parseInt(e.target.value, 10));
  };
  const [setsValues, setSetsValues] = useState<number[]>(
    Array(numSets).fill(0)
  );

  const handleSetInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSetsValues = [...setsValues];
    newSetsValues[index] = parseInt(e.target.value, 10);
    setSetsValues(newSetsValues);
  };

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
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && (
              <div className="flex w-full justify-between">
                <div>
                  <p>Workout: {wid}</p>
                </div>
                <SignOutButton />
              </div>
            )}
          </div>
          <div>
            {workoutLoading && <LoadingSpinner />}
            {data && (
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/"
                  className="mr-auto rounded border border-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                >
                  Back
                </Link>
                <h2 className="text-2xl font-bold text-emerald-400">
                  {data.title}
                </h2>
                <div className="w-full space-y-1 whitespace-pre-wrap p-2 text-sm ">
                  {<div>{data.workout_str}</div>}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Submit the setsValues to the API or database
                    // api.workouts.submit({ sets: setsValues });
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <PreviousWorkoutView workout={previousWorkoutData} />
                    <div>Select number of sets</div>
                    <select onChange={handleNumSetsChange} className="w-48 bg-black">
                      {[1, 2, 3, 4, 5, 6].map((num) => {
                        return <option value={num}>{num}</option>;
                      })}
                    </select>
                    
                    {
                      // Use Array.from to create an array of the desired length, then map over it
                      Array.from({ length: numSets }).map((_, i) => (
                        <div className="flex gap-3" key={i}>
                          <div>Set {i + 1}</div>
                          <input
                            className="bg-black"
                            type="number"
                            name={`set${i + 1}`}
                            onChange={(e) => handleSetInputChange(e, i)}
                          />
                        </div>
                      ))
                    }
                  </div>
                  <button
                    type="submit"
                    className="mt-5 rounded border border-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                  >
                    Save Changes
                  </button>
                </form>

                <div className="flex justify-center gap-3 mb-20">
                  <div className="rounded border border-neutral-400 bg-neutral-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-400"
                    onClick={(e) => {
                      e.preventDefault();
                      completeWorkout.mutate({ 
                        userId: user.id,
                        workoutId: Number(wid),
                        status: "skipped",
                      });
                    }}
                  >
                    Skip
                  </div>

                  <div className="rounded border border-emerald-400 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-emerald-400"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Complete Clicked");
                      completeWorkout.mutate({ 
                        userId: user.id,
                        workoutId: Number(wid),
                        status: "completed",
                      });
                    }}
                  >
                    Complete
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Workout;
