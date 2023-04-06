import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
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
  const [comment, setComment] = useState("");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const fetchComments = api.workouts.fetchComments.useQuery({
    workoutId: Number(wid),
  });
  const { data: comments, isLoading: commentsLoading } = fetchComments;
  const sortedComments = comments?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const completeWorkout = api.workouts.completeWorkout.useMutation({
    onSuccess: () => {
      notifyComplete();
      utils.workouts.get
        .invalidate({ id: Number(wid), userId: user?.id ?? "" })
        .catch((err) => console.log(err));
    },
  });

  const createComment = api.workouts.createComment.useMutation({
    onSuccess: () => {
      utils.workouts.fetchComments
        .invalidate({ workoutId: Number(wid) })
        .catch((err) => console.log(err));
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
              <div className="flex w-full items-center justify-between">
                <h2 className="font- text-2xl font-bold text-emerald-400">
                  {data.title}
                </h2>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded border border-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                >
                  Back
                </button>
              </div>
            )}
          </div>
          <div className="mx-2">
            {workoutLoading && <LoadingSpinner />}
            {data && (
              <div className="mt-5 flex flex-col gap-3">
                <div className="w-full space-y-1 whitespace-pre-wrap p-2 text-sm text-neutral-200 ">
                  {<div>{data.workout_str}</div>}
                </div>

                <div className="flex flex-row justify-between">
                  <div className="">
                    <div className="text-lg font-semibold text-white">
                      Comments
                    </div>
                    <div className="text-sm text-neutral-400">
                      {sortedComments?.length || "0"} comments
                    </div>
                  </div>

                  {/* question mark button to open a small tooltip explaining the component */}
                  {/* circle that triggers the tooltip on hover */}
                  <div
                    className="flex relative"
                  >
                    <div
                      className="text-md flex h-6 w-6 content-center justify-center rounded-full bg-emerald-400 text-center "
                      onMouseEnter={() => setTooltipVisible(true)}
                      onMouseLeave={() => setTooltipVisible(false)}
                    >
                      ?
                    </div>
                    {/* tooltip */}
                    <div
                      className={`absolute top-0 right-0 -translate-x-10 z-10 w-48 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity duration-300 dark:bg-gray-700
                ${tooltipVisible ? "visible" : "invisible"}
                `}
                    >Comments can be used to track your progress for this workout. They will always be here so you can revisit them later.</div>
                  </div>

                </div>

                <div className="text-sm text-neutral-300"></div>
                {/* comments */}
                {/* create comment */}
                <div className="flex w-full gap-3">
                  <Image
                    src={user.profileImageUrl}
                    alt="Profile image"
                    className="h-10 w-10 rounded-full"
                    width={40}
                    height={40}
                  />
                  <textarea
                    rows={8}
                    placeholder="Add a comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                    }}
                    className="grow rounded border border-neutral-700 bg-transparent p-1 text-sm outline-none focus:border-emerald-500"
                  ></textarea>
                </div>
                <div className="flex w-full justify-end p-4">
                  <div
                    className="rounded border border-emerald-400 bg-emerald-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-emerald-400"
                    onClick={(e) => {
                      e.preventDefault();
                      createComment.mutate({
                        userId: user.id,
                        workoutId: Number(wid),
                        comment,
                      });
                      setComment("");
                    }}
                  >
                    Submit
                  </div>
                </div>

                {/* comments */}
                <div className="flex flex-col gap-6">
                  {sortedComments?.map((comment) => {
                    return (
                      <div className="flex gap-3" key={comment.id}>
                        <Link
                          href={`/user/${comment.authorId}`}
                          className="h-10 w-10 rounded-full"
                        >
                          <Image
                            src={comment.authorImageUrl!}
                            alt="Profile image"
                            className="rounded-full"
                            width={40}
                            height={40}
                          ></Image>
                        </Link>
                        <div className="flex w-full flex-col">
                          <div className="flex justify-between">
                            <Link
                              className="text-sm font-bold"
                              href={`/user/${comment.authorId}`}
                            >
                              {comment.authorName}
                            </Link>
                            <div className="text-sm">
                              {dayjs(comment.createdAt).fromNow()}
                            </div>
                          </div>
                          <div className="text-sm">{comment.content}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* complete buttons/status */}
                <div className="mb-20 mt-10 flex justify-center gap-3">
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
    </>
  );
};

export default Workout;
