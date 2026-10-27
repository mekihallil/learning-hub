import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import Header from "@/components/header";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discuss",
  description: "A discussion platform built with Next.js",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="container mx-auto px-4 max-w-6xl">
          <Providers>
            <Suspense
              fallback={<header className="h-16 animate-pulse border-b" />}
            >
              <Header />
            </Suspense>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
