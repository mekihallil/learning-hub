import { db } from "./lib/db";

export default async function Home() {
  // Fetching data from databse
  const snippets = await db.snippet.findMany();

  // map over the data and display it
  const renderedSnippets = snippets.map(({ id, title }) => {
    return <div key={id}>{title}</div>;
  });
  return <div>{renderedSnippets}</div>;
}
