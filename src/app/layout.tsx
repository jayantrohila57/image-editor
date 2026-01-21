import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebAssembly Image Editor",
  description:
    "A high-performance web-based image editor built with Next.js and WebAssembly. Apply professional filters in real-time with C++-compiled processing.",
  keywords: [
    "image editor",
    "webassembly",
    "wasm",
    "image processing",
    "filters",
    "nextjs",
  ],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "WebAssembly Image Editor",
    description: "High-performance image editing with WebAssembly",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebAssembly Image Editor",
    description: "High-performance image editing with WebAssembly",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
