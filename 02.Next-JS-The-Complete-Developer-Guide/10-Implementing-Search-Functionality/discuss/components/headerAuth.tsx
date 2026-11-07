"use client";
import {
  Avatar,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import * as action from "../actions/action";
import { useSession } from "next-auth/react";

export default function HeaderAuth() {
  const session = useSession();
  let authContent: React.ReactNode;

  if (session.status === "loading") {
    authContent = null;
  } else if (session.data?.user) {
    authContent = (
      <Popover>
        <PopoverTrigger>
          <Avatar>
            <Avatar.Image
              src={session.data.user?.image ?? ""}
              alt={session.data.user?.name ?? "GitHub user"}
            />
          </Avatar>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-4">
            <form action={action.signOut}>
              <Button type="submit">SignOut</Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    );
  } else {
    authContent = (
      <div className="flex">
        <form action={action.signIn}>
          <Button type="submit" variant="primary">
            Sign in
          </Button>
        </form>
        <form action={action.signIn}>
          <Button type="submit" variant="secondary">
            Sign Up
          </Button>
        </form>
      </div>
    );
  }
  return authContent;
}
