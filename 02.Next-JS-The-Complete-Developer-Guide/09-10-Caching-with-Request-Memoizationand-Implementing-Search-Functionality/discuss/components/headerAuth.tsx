"use client";

import { Popover } from "@heroui/react/popover";
import { Avatar } from "@heroui/react/avatar";
import { Button } from "@heroui/react/button";
import { useSession } from "next-auth/react";
import * as action from "../actions/action";

export default function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <form action={action.signIn}>
          <Button type="submit" variant="primary">
            Sign in
          </Button>
        </form>

        <form action={action.signIn}>
          <Button type="submit" variant="secondary">
            Sign up
          </Button>
        </form>
      </div>
    );
  }
if (typeof window !== "undefined") {
  return null
}
  return (
    <Popover>
      <Popover.Trigger>
        <Avatar>
          <Avatar.Image
            src={session.user.image ?? ""}
            alt={session.user.name ?? "User avatar"}
          />
        </Avatar>
      </Popover.Trigger>

      <Popover.Content>
        <div className="p-4">
          <p className="mb-3">{session.user.name}</p>

          <form action={action.signOut}>
            <Button type="submit">Sign out</Button>
          </form>
        </div>
      </Popover.Content>
    </Popover>
  );
}
