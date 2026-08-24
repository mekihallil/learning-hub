"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function editSnippet(id: number, code: string) {
  await db.snippet.update({
    where: { id },
    data: { code },
  });
  redirect(`/snippets/${id}`);
}
