"use client";
import { search } from "@/actions/action";
import { Input } from "@heroui/react";
import { useSearchParams } from "next/navigation";

export default function SearchInput() {
  const searchParam = useSearchParams();
  return (
    <form action={search}>
      <Input name="term" defaultValue={searchParam.get("term") || ""} />
    </form>
  );
}
