import Link from "next/link";
import paths from "@/paths";
import PostShow from "@/components/post/postShow";
import CommentList from "@/components/comments/commentList";
import CommentCreateForm from "@/components/comments/commentCreateForm";
import { Suspense } from "react";
import fetchCommentsByPostId from "@/app/db/query/comment";

interface PostShowPageProps {
  params: Promise<{ slug: string; postId: string }>;
}

async function PostTitle({ params }: PostShowPageProps) {
  const { slug, postId } = await params;

  return (
    <div className="space-y-3">
      <Link className="underline decoration-solid" href={paths.topicShow(slug)}>
        {"< "}Back to {slug}
      </Link>
      <PostShow postId={postId} />
      <CommentCreateForm postId={postId} startOpen />
      <CommentList fetchData={() => fetchCommentsByPostId(postId)} />
    </div>
  );
}

export default function PostShowPage({ params }: PostShowPageProps) {
  return (
    <Suspense fallback={<p>Loading topic...</p>}>
      <PostTitle params={params} />
    </Suspense>
  );
}
