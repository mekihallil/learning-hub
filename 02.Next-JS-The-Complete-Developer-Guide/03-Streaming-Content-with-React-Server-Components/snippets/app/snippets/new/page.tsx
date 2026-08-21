import { redirect } from "next/navigation";
import { db } from "../../lib/db";

const SnippetCreatePage = () => {
  async function createSnippet(formDate: FormData) {
    // This needs tobe a server action!
    "use server";
    // Check the user's inputes and make sure they're valid
    const title = formDate.get("title") as string;
    const code = formDate.get("code") as string;
    // Create a new record in the database
    const snippet = await db.snippet.create({
      data: {
        title,
        code,
      },
    });
    console.log(snippet);
    // Redirect the user back to the root router
    redirect("/");
  }

  return (
    <form action={createSnippet}>
      <h3 className="font-bold m-3">Create a Snippet</h3>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <label htmlFor="title" className="w-13">
            Title
          </label>
          <input
            name="title"
            type="text"
            className="border rounded p-2 w-full"
            id="title"
          />
        </div>

        <div className="flex gap-4">
          <label htmlFor="code" className="w-13">
            Code
          </label>
          <textarea
            name="code"
            className="border rounded p-2 w-full"
            id="title"
          />
        </div>
        <button type="submit" className="rounded p-2 bg-blue-200">
          Create
        </button>
      </div>
    </form>
  );
};
export default SnippetCreatePage;
