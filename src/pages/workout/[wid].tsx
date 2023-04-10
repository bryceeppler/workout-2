import { useRouter } from "next/router";
import Head from "next/head";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import {LoadingSpinner, LoadingPage} from "~/components/loading";
import SignInPage from "~/components/signin";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// import trash.svg from "~/public/trash.svg";
dayjs.extend(relativeTime);

const notifyComplete = () => toast("Workout saved!");

const trashIcon = () => (
<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path className="fill-red-500 hover:fill-red-600" fillRule="evenodd" clipRule="evenodd" d="M11.0001 2.98546V3.13665C11.6366 3.19492 12.2678 3.27154 12.8932 3.36599C13.1247 3.40095 13.3555 3.43837 13.5854 3.4782C13.8575 3.52533 14.0399 3.78411 13.9927 4.0562C13.9456 4.32829 13.6868 4.51066 13.4147 4.46352C13.3683 4.45549 13.3219 4.44755 13.2754 4.43971L12.6051 13.1534C12.525 14.1954 11.6561 15 10.611 15H5.38913C4.34406 15 3.47517 14.1954 3.39502 13.1534L2.72474 4.43971C2.67826 4.44755 2.63183 4.45549 2.58542 4.46352C2.31333 4.51066 2.05455 4.32829 2.00742 4.0562C1.96029 3.78411 2.14265 3.52533 2.41474 3.4782C2.64467 3.43837 2.87543 3.40095 3.10699 3.36599C3.73239 3.27154 4.3636 3.19492 5.00008 3.13665V2.98546C5.00008 1.94248 5.80844 1.05212 6.87704 1.01794C7.24994 1.00601 7.62432 1 8.00008 1C8.37585 1 8.75022 1.00601 9.12313 1.01794C10.1917 1.05212 11.0001 1.94248 11.0001 2.98546ZM6.90901 2.01743C7.27126 2.00584 7.63498 2 8.00008 2C8.36518 2 8.7289 2.00584 9.09115 2.01743C9.59423 2.03352 10.0001 2.45596 10.0001 2.98546V3.06055C9.33851 3.02038 8.67164 3 8.00008 3C7.32852 3 6.66166 3.02038 6.00008 3.06055V2.98546C6.00008 2.45596 6.40593 2.03352 6.90901 2.01743ZM6.67248 5.98078C6.66187 5.70484 6.42957 5.48976 6.15364 5.50037C5.8777 5.51098 5.66261 5.74328 5.67322 6.01922L5.90399 12.0192C5.9146 12.2952 6.1469 12.5102 6.42284 12.4996C6.69878 12.489 6.91386 12.2567 6.90325 11.9808L6.67248 5.98078ZM10.3263 6.01922C10.3369 5.74328 10.1219 5.51098 9.84591 5.50037C9.56998 5.48976 9.33768 5.70484 9.32707 5.98078L9.0963 11.9808C9.08568 12.2567 9.30077 12.489 9.57671 12.4996C9.85265 12.5102 10.0849 12.2952 10.0956 12.0192L10.3263 6.01922Z"/>
</svg>

)

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

  const [editComment, setEditComment] = useState<{
    id: number;
    comment: string;
  } | null>(null);

  const updateComment = api.workouts.updateComment.useMutation({
    onSuccess: () => {
      void utils.workouts.fetchComments
        .invalidate({ workoutId: Number(wid) });

      setEditComment(null);
    },
  });

  const deleteComment = api.workouts.deleteComment.useMutation({
    onSuccess: () => {
      void utils.workouts.fetchComments
        .invalidate({ workoutId: Number(wid) });

      setEditComment(null);
      toast("Comment deleted");
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
                <h2 className="font- text-2xl font-bold text-violet-400">
                  {data.title}
                </h2>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded border border-violet-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-neutral-700"
                >
                  Back
                </button>
              </div>
            )}
          </div>
          <div className="mx-3">
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

                  <div className="relative flex">
                    <div
                      className="text-md flex h-6 w-6 content-center justify-center rounded-full bg-violet-400 text-center "
                      onMouseEnter={() => setTooltipVisible(true)}
                      onMouseLeave={() => setTooltipVisible(false)}
                    >
                      ?
                    </div>
                    {/* tooltip */}
                    <div
                      className={`absolute right-0 top-0 z-10 w-48 -translate-x-10 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity duration-300 dark:bg-gray-700
                ${tooltipVisible ? "visible" : "invisible"}
                `}
                    >
                      Comments can be used to track your progress for this
                      workout. They will always be here so you can revisit them
                      later.
                    </div>
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
                    className="grow rounded border border-neutral-700 bg-transparent p-1 text-sm outline-none focus:border-violet-500"
                  ></textarea>
                </div>
                <div className="flex w-full justify-end p-4">
                  <div
                    className="rounded border border-violet-400 bg-violet-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-violet-400"
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
                          <div className="whitespace-pre-wrap text-sm">
                            {editComment && editComment.id === comment.id ? (
                              <div className="flex flex-col gap-3">
                                <textarea
                                  // rows={8}
                                  rows={comment.content.split("\n").length}
                                  placeholder="Add a comment"
                                  value={editComment.comment}
                                  onChange={(e) => {
                                    setEditComment({
                                      ...editComment,
                                      comment: e.target.value,
                                    });
                                  }}
                                  className="grow rounded border border-neutral-700 bg-transparent p-1 text-sm outline-none focus:border-violet-500"
                                ></textarea>
                                <div className="flex w-full justify-between p-4">
                                  <div className=""
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteComment.mutate({
                                      commentId: editComment.id,
                                    });
                                    setEditComment(null);
                                  }}
                                  >{trashIcon()}</div>
                                  <div className="flex gap-3">
                                  {/* cancel button */}
                                  <div
                                   className="rounded border border-violet-400 px-4 py-1 font-semibold text-neutral-200 shadow transition-colors hover:bg-violet-400 text-xs"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setEditComment(null);
                                    }}
                                  >
                                    Cancel
                                  </div>
                                  {/* submit button */}
                                  <div
                                    className="rounded border border-violet-400 bg-violet-500 px-4 py-1 font-semibold text-neutral-200 shadow transition-colors hover:bg-violet-400 text-xs"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      updateComment.mutate({
                                        commentId: editComment.id,
                                        comment: editComment.comment,
                                      });
                                      setEditComment(null);
                                    }}
                                  >
                                    Submit
                                    </div>
                                    </div>
                                    </div>
                                    </div>
                                    ) : (
                                      <div>{comment.content}</div>
                                    )}
                          </div>
                          {/* edit btn */}
                          {!editComment && <div className="flex justify-end">
                            {comment.authorId === user.id && (
                              <div

                                className="text-sm text-violet-400"
                                onClick={() => {
                                  setEditComment({
                                    id: comment.id,
                                    comment: comment.content,
                                  });
                                }}
                              >
                                Edit
                                </div>
                            )}
                            </div>
                  }
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
                        className="rounded border border-violet-400 bg-violet-500 px-4 py-2 font-semibold text-neutral-200 shadow transition-colors hover:bg-violet-400"
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
