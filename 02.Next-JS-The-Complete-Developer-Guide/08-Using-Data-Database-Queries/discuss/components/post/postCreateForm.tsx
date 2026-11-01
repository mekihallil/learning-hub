"use client";

import * as action from "@/actions/action";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react/popover";
import FormButton from "../common/formButton";
import { useActionState } from "react";
import { FieldError, Label, TextArea, TextField } from "@heroui/react";
export default function PostCreateForm() {
  const [formState, actions] = useActionState(action.createPost, {
    errors: {},
  });
  return (
    <Popover>
      <PopoverTrigger>
        <Button>Create a Post</Button>
      </PopoverTrigger>
      <PopoverContent>
        <form action={actions}>
          <div className="flex flex-col gap-4 p-4 w-80">
            <h3 className="text-lg">Create a Post</h3>
            <TextField isInvalid={!!formState.errors.title}>
              <Label>Title</Label>
              <Input id="title" name="title" placeholder="title" />
              <FieldError>{formState.errors.title?.join(",")}</FieldError>
            </TextField>
            <TextField isInvalid={!!formState.errors.content}>
              <Label>Content</Label>
              <TextArea id="content" name="content" placeholder="content" />
              <FieldError>{formState.errors.content?.join(",")}</FieldError>
            </TextField>
            {formState.errors._form ? (
              <div className=" text-red-400 border border-red-400 rounded-xl">
                {formState.errors._form?.join(", ")}
              </div>
            ) : null}
            <FormButton>Create Post</FormButton>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
