"use client";

interface errorPageProps {
  error: Error;
  reset: () => void;
}
export default function errorPage({ error }: errorPageProps) {
  return <div>{error.message}</div>;
}
