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
  await new Promise((r) => setTimeout(r, 2000));
  //   Fetch the PARTICULAR record from database
  const snippet = await db.snippet.findFirst({
    where: { id: parseInt(id) },
  });

  //   If no snippet  is found, show 404 page
  if (!snippet) {
    return notFound();
  }
  return <div>{snippet.title}</div>;
}
