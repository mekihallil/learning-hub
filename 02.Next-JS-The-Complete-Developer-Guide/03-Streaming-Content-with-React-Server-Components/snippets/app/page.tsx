import Link from "next/link";
import { db } from "./lib/db";

export default async function Home() {
  // Fetching data from databse
  const snippets = await db.snippet.findMany();

  // map over the data and display it
  const renderedSnippets = snippets.map(({ id, title }) => {
    return (
      <Link
        href={`snippets/${id}`}
        key={id}
        className="flex justify-between items-center p-2 border rounded"
      >
        <div>{title}</div>
        <div>View</div>
      </Link>
    );
  });
  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl bold">Snippets</h1>
        <Link href="snippets/new" className="border rounded p-2">
          New
        </Link>
      </div>
      <div>{renderedSnippets}</div>
    </div>
  );
}
