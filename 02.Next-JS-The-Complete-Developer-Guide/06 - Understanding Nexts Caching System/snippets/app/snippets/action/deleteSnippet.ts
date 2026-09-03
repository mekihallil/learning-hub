"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const deleteSnippet = async (id: number) => {
  await db.snippet.delete({
    where: { id },
  });
  revalidatePath("/");
  redirect("/");
};

export { deleteSnippet };
