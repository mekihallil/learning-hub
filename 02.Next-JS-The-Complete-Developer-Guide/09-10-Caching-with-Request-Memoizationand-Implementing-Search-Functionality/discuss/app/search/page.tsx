import PostList from "@/components/post/postList";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { fetchPostsBySearchTerm } from "../db/query/posts";

interface searchPageProps {
  searchParams: Promise<{
    term: string;
  }>;
}

async function SerachTitle({ searchParams }: searchPageProps) {
  const { term } = await searchParams;

  if (!term?.trim()) {
    redirect("/");
  }
  return <PostList fetchData={() => fetchPostsBySearchTerm(term)} />;
}
export default async function SearchPage({ searchParams }: searchPageProps) {
  return (
    <Suspense fallback={"Loading search...."}>
      <SerachTitle searchParams={searchParams} />
    </Suspense>
  );
}
