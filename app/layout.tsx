import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel — Plan any trip",
  description: "Generic travel platform — create trips from UI, API, or skill. Vietnam seeded as first trip. Each day node editable with flights, hotels, cabs, attachments.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#fafaf9] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">{children}</body>
    </html>
  );
}
