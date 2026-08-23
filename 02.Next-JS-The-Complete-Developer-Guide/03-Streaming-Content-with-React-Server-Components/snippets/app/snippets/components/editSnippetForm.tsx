"user client";

import { Snippet } from "@/generated/prisma/client";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function snippetEditForm({ snippet }: SnippetEditFormProps) {
  const { title } = snippet;
  return <div>Client component has snippet with title {title}</div>;
}
