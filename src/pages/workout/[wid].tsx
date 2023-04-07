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

const notifyComplete = () => toast("Workout saved!");

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
                                  rows={8}
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
                                  <div className="rounded border border-red-400 text-red-400 px-4 py-1 font-semiboldshadow transition-colors hover:bg-red-400 hover:text-neutral-200 text-xs"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    deleteComment.mutate({
                                      commentId: editComment.id,
                                    });
                                    setEditComment(null);
                                  }}
                                  >Delete</div>
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
