"use client";

import { NextUIProvider } from "@nextui-org/react";

interface providerProps {
  children: React.ReactNode;
}
export default function Providers({ children }: providerProps) {
  return <NextUIProvider> {children}</NextUIProvider>;
}
