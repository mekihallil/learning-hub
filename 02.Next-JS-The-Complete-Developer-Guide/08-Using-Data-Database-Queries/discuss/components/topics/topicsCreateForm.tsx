"use client";
import {
  Button,
  FieldError,
  Input,
  Label,
  Popover,
  TextArea,
  TextField,
} from "@heroui/react";
import * as actions from "../../actions/action";
import { useActionState } from "react";
export default function TopicCretaeForm() {
  const [formState, action] = useActionState(actions.createTopic, {
    errors: {},
  });
  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="primary">Create a Topic</Button>
      </Popover.Trigger>
      <Popover.Content placement="left">
        <Popover.Dialog>
          <form action={action}>
            <div className="flex flex-col gap-4 p-4 w-80">
              <h3 className="text-lg">Create a Topic</h3>
              <TextField name="name" isInvalid={!!formState.errors.name}>
                <Label>Name</Label>
                <Input placeholder="Name" />
                <FieldError>{formState.errors.name?.join(", ")}</FieldError>
              </TextField>
              <TextField
                name="description"
                isInvalid={!!formState.errors.description}
              >
                <Label>Description</Label>
                <TextArea placeholder="Describe your topic" />
                <FieldError>
                  {formState.errors.description?.join(", ")}
                </FieldError>
              </TextField>
              {formState.errors._form ? (
                <div className=" text-red-400 border border-red-400 rounded-xl">
                  {formState.errors?._form?.join(", ")}
                </div>
              ) : null}
              <Button type="submit"> Submit</Button>
            </div>
          </form>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
