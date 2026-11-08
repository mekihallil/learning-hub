"use client";
import { Button, Spinner } from "@heroui/react";
import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface formButtonProps {
  children: ReactNode;
}
export default function FormButton({ children }: formButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isPending={pending}>
      {({ isPending }) => (
        <>
          {isPending && <Spinner className="text-white" size="sm" />}
          {isPending ? "Submitting" : children}
        </>
      )}
    </Button>
  );
}
 