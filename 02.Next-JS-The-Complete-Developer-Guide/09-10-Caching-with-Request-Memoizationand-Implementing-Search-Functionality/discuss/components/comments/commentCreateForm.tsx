"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react/button";
import FormButton from "../common/formButton";
import * as actions from "../../actions/createComment";
interface CommentCreateFormProps {
  postId: string;
  parentId?: string;
  startOpen?: boolean;
}

export default function CommentCreateForm({
  postId,
  parentId,
  startOpen,
}: CommentCreateFormProps) {
  const [open, setOpen] = useState(startOpen);
  const ref = useRef<HTMLFormElement | null>(null);

  const [formState, action] = useActionState(
    actions.createComment.bind(null, { postId, parentId }),
    { errors: {} },
  );
  useEffect(() => {
    if (formState.success) {
      ref.current?.reset();

      if (!startOpen) {
      }
    }
  }, [formState, startOpen]);

  const form = (
    <form action={action} ref={ref}>
      <div className="space-y-2 px-1">
        <textarea
          name="content"
          placeholder="Enter your comment"
          // isInvalid={!!formState.errors.content}
          // errorMessage={formState.errors.content?.join(", ")}
        />

        {formState.errors._form ? (
          <div className="p-2 bg-red-200 border rounded border-red-400">
            {formState.errors._form?.join(", ")}
          </div>
        ) : null}

        <FormButton>Create Comment</FormButton>
      </div>
    </form>
  );

  return (
    <div>
      <Button size="sm" onClick={() => setOpen(!open)}>
        Reply
      </Button>
      {open && form}
    </div>
  );
}
