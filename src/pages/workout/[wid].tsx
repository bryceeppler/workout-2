import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
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
const notifyComplete = () => toast.success("Workout saved!");
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
            <div key={i} className="flex justify-between">
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
  const utils = api.useContext();

  const completeWorkout = api.workouts.completeWorkout.useMutation({
    onSuccess: () => {
      notifyComplete();
      utils.workouts.get
        .invalidate({ id: Number(wid), userId: user?.id ?? "" })
        .catch((err) => console.log(err));
    },
  });
  
  const completeExercise = api.workouts.addExercise.useMutation({
    onSuccess: () => {
      notifyComplete();
      // utils.workouts.get
        // .invalidate({ id: Number(wid), userId: user?.id ?? "" })
        // .catch((err) => console.log(err));
    },
  });

  const { data, isLoading: workoutLoading } = api.workouts.get.useQuery(
    {
      id: Number(wid),
      userId: user?.id ?? "",
    },
    {
      enabled: userLoaded,
    }
  );

  const [numSets, setNumSets] = useState(2);
  const [notes, setNotes] = useState("");
  const [repsValues, setRepsValues] = useState<number[]>(Array(numSets).fill(0));
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

  const handleRepInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newRepsValues = [...repsValues];
    newRepsValues[index] = parseInt(e.target.value, 10);
    setRepsValues(newRepsValues);
  };

  if (!userLoaded) return <LoadingPage />;

  if (!isSignedIn) return <SignInPage />;

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
            {isSignedIn && data && (
                <div className="flex w-full justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-400 font-">
                  {data.title}
                </h2>
                <Link
                  href="/"
                  className="rounded border border-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                >
                  Back
                </Link>
                </div>
            )}
          </div>
          <div
          className="mx-2">
            {workoutLoading && <LoadingSpinner />}
            {data && (
              <div className="mt-5 flex flex-col gap-3">

                <div className="w-full space-y-1 whitespace-pre-wrap p-2 text-sm ">
                  {<div>{data.workout_str}</div>}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // console.log("Workout ID: ", wid);
                    // console.log("User ID: ", user?.id);
                    // console.log("Sets: ", setsValues);
                    // console.log("Reps: ", repsValues);
                    const setsAndRepsString = setsValues.map((set, i) => {
                      return `${set}x${repsValues[i]}`;
                    }).join(" ");
                    if (setsAndRepsString === "") return;
                    completeExercise.mutate({ workoutId: Number(wid), userId: user?.id ?? "", setsAndReps: setsAndRepsString, exerciseName: data.title || "", notes: notes  })

                    // completeWorkout.mutate({ id: Number(wid), userId: user?.id ?? "" });
                    // Submit the setsValues to the API or database
                    // api.workouts.submit({ sets: setsValues });
                  }}
                >
                  <div className="flex flex-col gap-3">
                    {/* <PreviousWorkoutView workout={previousWorkoutData} /> */}
                    <div>Select number of sets</div>
                    <select
                      onChange={handleNumSetsChange}
                      className="w-48 bg-black"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => {
                        return <option key={num} value={num}>{num}</option>;
                      })}
                    </select>

                    {
                      // Use Array.from to create an array of the desired length, then map over it
                      Array.from({ length: numSets }).map((_, i) => (
                        <div className="flex gap-3" key={i}>
                          <div>Set {i + 1}</div>
                          <div>Weight</div>
                          <input
                            className="bg-black"
                            type="number"
                            name={`set${i + 1}`}
                            onChange={(e) => handleSetInputChange(e, i)}
                          />
                          <div>Reps</div>
                          <input
                            className="bg-black"
                            type="number"
                            name={`set${i + 1}`}
                            onChange={(e) => handleRepInputChange(e, i)}
                          /> 
                        </div>
                      ))
                    }
                  </div>
                  <div className="my-4">
                    {/* notes */}
                    <div>Notes</div>
                    <textarea
                      className="bg-black w-full"
                      name="notes"
                      id="notes"
                      cols={30}
                      rows={10}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>

                  </div>
                  <button
                    type="submit"
                    className="mt-5 rounded border border-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                  >
                    Save Changes
                  </button>
                </form>

                <div className="mb-20 flex justify-center gap-3">
                  {data.status === null ? (
                    <>
                      {" "}
                      <div
                        className="rounded border border-neutral-400 bg-neutral-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-400"
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
                      <div
                        className="rounded border border-emerald-400 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-emerald-400"
                        onClick={(e) => {
                          e.preventDefault();
                          completeWorkout.mutate({
                            userId: user.id,
                            workoutId: Number(wid),
                            status: "completed",
                          });
                        }}
                      >
                        Complete
                      </div>
                    </>
                  ) : (
                    <div>
                      {data.status} on {data.completedAt?.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Toaster 
      toastOptions={{
        className: '',
        style: {
          color: 'white',
          background: '#44403c',
          border: '1px solid #10b981',

        },
      }}
      />
    </>
  );
};

export default Workout;
