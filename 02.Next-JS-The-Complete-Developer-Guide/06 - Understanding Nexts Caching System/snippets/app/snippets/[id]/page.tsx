import { notFound } from "next/navigation";
import { db } from "../../lib/db";
import Link from "next/link";
import { deleteSnippet } from "../action/deleteSnippet";

interface snippetShowPageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function snippetShowPage({
  params,
}: snippetShowPageProps) {
  // Get the ID from params
  const { id } = await params;

  // Fetch the PARTICULAR record from database
  const snippet = await db.snippet.findFirst({
    where: { id: parseInt(id) },
  });
  // If no snippet  is found, show 404 page
  if (!snippet) {
    return notFound();
  }
  const deleteButton = deleteSnippet.bind(null, snippet.id);

  const { title, code } = snippet;
  return (
    <div>
      <div className="flex m-4 justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="flex gap-4">
          <Link href={`/snippets/${id}/edit`} className="p-2 border rounded">
            Edit
          </Link>
          <form action={deleteButton}>
            <button className="p-2 border rounded">Delete</button>
          </form>
        </div>
      </div>
      <pre className="p-3 border rounded bg-gray-200 border-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export async function generateStaticParams() {
  const snippet = await db.snippet.findMany();

  return snippet.map(({ id }) => {
    return {
      id: id.toString(),
    };
  });
}
