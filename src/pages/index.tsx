import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";


const AddActivityWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  return <div className="flex gap-3">
    <Image src={user.profileImageUrl} alt="Profile image" className="w-14 h-14 rounded-full"
    width={56} height={56}/>
    <div className="bg-emerald-500 hover:bg-emerald-400 text-neutral-200 font-semibold py-2 px-4 border border-emerald-600 rounded shadow my-auto">Add meal</div>
    <div className="bg-emerald-500 hover:bg-emerald-400 text-neutral-200 font-semibold py-2 px-4 border border-emerald-600 rounded shadow my-auto">Add activity</div>
  </div>
}

type Workout = RouterOutputs["workouts"]["getIncomplete"][number];
const IncompleteWorkoutView = (props: {workout:Workout}) => {
  const { title } = props.workout;
  return (
    <div className="border-b border-neutral-600 p-8">{title}</div>
  )
}

const Home: NextPage = () => {
  const user = useUser();
  console.log(user)

  if (!user.isSignedIn) return (
    <main className="flex h-screen justify-center">

    <div className="flex justify-center text-emerald-500"><SignInButton /></div>
    </main>
  );


  const { data, isLoading } = api.workouts.getIncomplete.useQuery({userId: user.user.id});

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;



  return (
    <>
      <Head>
        <title>Gym App 2</title>
        <meta name="description" content="Brycey boys website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-neutral-600 md:max-w-2xl">
          <div className="flex border-b border-neutral-600 p-4">
            {!user.isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {user.isSignedIn && <div className="flex w-full justify-between"><AddActivityWizard /><SignOutButton /></div>}
          </div>
          <div className="flex flex-col">
            {data?.map((workout) => (
              <IncompleteWorkoutView key={workout.id} workout={workout} />   
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
