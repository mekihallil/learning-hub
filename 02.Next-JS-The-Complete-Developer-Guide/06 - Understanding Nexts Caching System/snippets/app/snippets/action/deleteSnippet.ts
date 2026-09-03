"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const deleteSnippet = async (id: number) => {
  await db.snippet.delete({
    where: { id },
  });
  redirect("/");
};

export { deleteSnippet };
