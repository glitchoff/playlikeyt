import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/lib/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlayLikeYT - High Performance Local Video Player",
  description: "A modern, high-fidelity YouTube-clone interface for managing and playing your local video collection with advanced controls and persistent progress.",
  keywords: ["video player", "youtube clone", "local video manager", "next.js", "indexeddb", "opfs"],
  authors: [{ name: "glitchoff" }],
  openGraph: {
    title: "PlayLikeYT - High Performance Local Video Player",
    description: "A modern, high-fidelity YouTube-clone interface for managing and playing your local video collection.",
    type: "website",
    siteName: "PlayLikeYT",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayLikeYT",
    description: "Native YouTube-like experience for local videos.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
