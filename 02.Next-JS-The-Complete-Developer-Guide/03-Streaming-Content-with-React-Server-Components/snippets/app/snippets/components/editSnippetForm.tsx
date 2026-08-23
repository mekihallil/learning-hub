"use client";

import { Snippet } from "@/generated/prisma/client";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function SnippetEditForm({ snippet }: SnippetEditFormProps) {
  const { code } = snippet;
  const [updatedCode, setCode] = useState(code);
  const handleEditorChange = (value: string = "") => {
    setCode(value);
  };
  console.log(updatedCode);
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
