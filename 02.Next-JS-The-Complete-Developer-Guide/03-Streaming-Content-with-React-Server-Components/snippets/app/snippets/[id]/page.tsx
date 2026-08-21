import { notFound } from "next/navigation";
import { db } from "../../lib/db";

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

  const { title, code } = snippet;
  return (
    <div>
      <div className="flex m-4 justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="flex gap-4">
          <button className="p-2 border rounded">Edit</button>
          <button className="p-2 border rounded">Delete</button>
        </div>
      </div>
      <pre className="p-3 border rounded bg-gray-200 border-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}
