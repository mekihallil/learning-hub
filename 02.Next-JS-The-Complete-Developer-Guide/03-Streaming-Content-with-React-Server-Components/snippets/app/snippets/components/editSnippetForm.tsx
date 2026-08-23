"use client";

import { Snippet } from "@/generated/prisma/client";
import { Editor } from "@monaco-editor/react";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function SnippetEditForm({ snippet }: SnippetEditFormProps) {
  const { code } = snippet;
  const handleEditorChange = (value: string = "") => {
    console.log(value);
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
    </div>
  );
}
