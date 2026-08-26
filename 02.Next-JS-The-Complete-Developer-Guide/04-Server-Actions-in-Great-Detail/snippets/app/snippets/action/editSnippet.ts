"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const editSnippet = async (id: number, code: string) => {
  await db.snippet.update({
    where: { id },
    data: { code },
  });
  redirect(`/snippets/${id}`);
};

export { editSnippet };
