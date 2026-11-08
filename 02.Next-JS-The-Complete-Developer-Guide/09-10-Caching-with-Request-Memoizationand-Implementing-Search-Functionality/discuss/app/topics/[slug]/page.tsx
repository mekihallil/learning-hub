import { fetchPostsByTopicSlug } from "@/app/db/query/posts";
import { PostCreateForm } from "@/components/post/postCreateForm";
import PostList from "@/components/post/postList";
import { Suspense } from "react";

interface TopicShowPageProps {
  params: Promise<{
    slug: string;
  }>;
}
async function TopicTitle({ params }: TopicShowPageProps) {
  const { slug } = await params;
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="col-span-3">
        <h1 className="text-2xl font-bold mb-2">{slug}</h1>
        <PostList fetchData={() => fetchPostsByTopicSlug(slug)} />
      </div>
      <div>
        <PostCreateForm slug={slug} />
      </div>
    </div>
  );
}

export default function TopicShowPage({ params }: TopicShowPageProps) {
  return (
    <>
      <Suspense fallback={<p>Loading topic...</p>}>
        <TopicTitle params={params} />
      </Suspense>
    </>
  );
}
