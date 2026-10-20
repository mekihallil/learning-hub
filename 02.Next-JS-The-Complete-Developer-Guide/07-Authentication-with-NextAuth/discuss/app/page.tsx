import { Suspense } from "react";
import { auth } from "@/app/auth";
import * as action from "@/actions/action";
import Profile from "@/components/profile";

async function SessionInfo() {
  const session = await auth();
  return (
    <div>
      <form action={action.signIn}>
        <button type="submit">Sign In</button>
      </form>
      <form action={action.signOut}>
        <button type="submit">Sign Out</button>
      </form>
      {session?.user ? (
        <div>{JSON.stringify(session.user)}</div>
      ) : (
        <div>Signed out</div>
      )}
      <Profile />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SessionInfo />
    </Suspense>
  );
}
