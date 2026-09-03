import { notFound } from "next/navigation";
import SnippetEditForm from "@/snippets/components/editSnippetForm";
import { db } from "@/lib/db";

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
    return notFound();
  }
  return (
    <div>
      <SnippetEditForm snippet={snippet} />
    </div>
  );
}
