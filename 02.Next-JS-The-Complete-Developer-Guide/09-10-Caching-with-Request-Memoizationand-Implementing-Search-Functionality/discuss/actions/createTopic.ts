"use server";

import { auth } from "@/app/auth";
import { db } from "@/app/db/db";
import paths from "@/paths";
import { Topic } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

interface createTopicFormState {
  errors: {
    name?: string[];
    description?: string[];
    _form?: string[];
  };
}
const createTopicSchema = z.object({
  name: z
    .string()
    .min(3)
    .regex(/[a-z-]/, {
      message: "Must be lowercase letters or dashes without spaces",
    }),
  description: z.string().min(10),
});
export async function createTopic(
  formState: createTopicFormState,
  formData: FormData,
): Promise<createTopicFormState> {
  const session = await auth();

  const result = createTopicSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return {
      errors: result.error?.flatten().fieldErrors,
    };
  }
  if (!session || !session.user) {
    return {
      errors: {
        _form: ["You must be signed in to do this."],
      },
    };
  }
  let topic: Topic;
  try {
    topic = await db.topic.create({
      data: {
        slug: result.data.name,
        description: result.data.description,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      };
    } else {
      return {
        errors: {
          _form: ["Somthing was wrong"],
        },
      };
    }
  }
  revalidatePath("/");
  redirect(paths.topicShow(topic.slug));
}
