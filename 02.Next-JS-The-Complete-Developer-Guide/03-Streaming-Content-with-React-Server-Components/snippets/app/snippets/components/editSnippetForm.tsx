"use client";

import { Snippet } from "@/generated/prisma/client";
import { Editor } from "@monaco-editor/react";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function snippetEditForm({ snippet }: SnippetEditFormProps) {
  const { code } = snippet;
  return (
    <div>
      <Editor
        height="40vh"
        theme="vs-dark"
        language="javascript"
        defaultValue={code}
        options={{ minimap: { enabled: false } }}
      />
    </div>
  );
}
