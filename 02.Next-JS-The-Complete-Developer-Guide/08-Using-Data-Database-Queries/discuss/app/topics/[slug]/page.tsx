import { PostCreateForm } from "@/components/post/postCreateForm";
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
      </div>
      <div>
        <PostCreateForm slug={slug} />
      </div>
    </div>
  );
}

export default async function Topic({ params }: TopicShowPageProps) {
  return (
    <>
      <Suspense fallback={<p>Loading topic...</p>}>
        <TopicTitle params={params} />
      </Suspense>
    </>
  );
}
