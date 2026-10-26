"use client";

import { Avatar, Button, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const session = useSession();

  let authContent;

  if (session.data?.user) {
    authContent = (
      <div className="flex items-center gap-4">
        <Avatar>
          <Avatar.Image
            src={session.data?.user?.image ?? ""}
            alt={session.data?.user?.name ?? "GitHub user"}
          />
        </Avatar>
      </div>
    );
  } else {
    authContent = (
      <div>
        <Button variant="secondary">Sign in</Button>
        <Button variant="secondary">Sign Up</Button>
      </div>
    );
  }
  return (
    <nav className="mb-6 w-full border-b shadow">
      <header className="flex h-16 items-center justify-between gap-4 px-6">
        <Link href="/" className="shrink-0 font-bold">
          Discuss
        </Link>

        <div className="w-full max-w-md">
          <Input placeholder="Search discussions..." />
        </div>

        <div className="shrink-0">{authContent}</div>
      </header>
    </nav>
  );
}
