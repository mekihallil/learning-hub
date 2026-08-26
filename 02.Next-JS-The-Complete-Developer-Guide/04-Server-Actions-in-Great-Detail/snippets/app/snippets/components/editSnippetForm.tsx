"use client";

import { Snippet } from "@/generated/prisma/client";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import editSnippet from "../action/editSnippet";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function SnippetEditForm({ snippet }: SnippetEditFormProps) {
  const { id, code } = snippet;
  const [updatedCode, setCode] = useState(code);
  const handleEditorChange = (value: string = "") => {
    setCode(value);
  };
  const handleClick = async () => {
    await editSnippet(id, updatedCode);
  };
  return (
    <div>
      <Editor
        height="40vh"
        theme="vs-dark"
        language="javascript"
        defaultValue={code}
        options={{ minimap: { enabled: false } }}
        onChange={handleEditorChange}
      />
      <div>
        <button
          onClick={handleClick}
          className="border rounded p-2 mt-2 cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
}
