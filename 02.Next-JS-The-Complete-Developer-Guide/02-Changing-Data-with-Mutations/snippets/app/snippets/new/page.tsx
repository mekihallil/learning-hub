const SnippetCreatePage = () => {
  return (
    <form>
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
