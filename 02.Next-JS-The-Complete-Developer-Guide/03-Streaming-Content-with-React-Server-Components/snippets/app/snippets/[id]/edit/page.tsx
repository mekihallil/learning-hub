import { notFound } from "next/navigation";
import { db } from "../../../lib/db";

interface snippetPropsId {
  params: Promise<{
    id: string;
  }>;
}

export default async function snippetEditPage({ params }: snippetPropsId) {
  const snippetId = await params;
  const id = parseInt(snippetId.id);
  const snippet = await db.snippet.findFirst({
    where: { id },
  });
  if (!snippet) {
    return notFound;
  }
  const { title } = snippet;
  return <div>Edit snippet with title: {title}</div>;
}
