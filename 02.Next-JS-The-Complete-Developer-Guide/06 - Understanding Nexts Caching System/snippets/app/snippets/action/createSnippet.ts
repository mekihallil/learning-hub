"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSnippet(
  formState: { message: string },
  formData: FormData,
) {
  try {
    // Check the user's inputs and make sure they're valid
    const title = formData.get("title");
    const code = formData.get("code");
// error handling
    if (typeof title !== "string" || title.length < 3) {
      return {
        message: "Title must be longer",
      };
    }

    if (typeof code !== "string" || code.length < 10) {
      return {
        message: "Code must be longer",
      };
    }

    // Create a new record in the database
    await db.snippet.create({
      data: {
        title,
        code,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return {
        message: err.message,
      };
    } else {
      return {
        message: "Something went wrong...",
      };
    }
  }
  revalidatePath("/");
  // Redirect the user back to the root route
  redirect("/");
}
