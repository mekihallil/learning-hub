import { Suspense } from "react";
import PostCreateForm from "@/components/post/postCreateForm";

interface TopicShowPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function TopicTitle({ params }: TopicShowPageProps) {
  const { slug } = await params;

  return <h1 className="text-2xl font-bold mb-2">{slug}</h1>;
}
export default function Topic({ params }: TopicShowPageProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="col-span-3">
        <Suspense fallback={<p>Loading topic...</p>}>
          <TopicTitle params={params} />
        </Suspense>
      </div>

      <div>
        <PostCreateForm />
      </div>
    </div>
  );
}
