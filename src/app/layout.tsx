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
  title: "MoreStars.co",
  description:
    "MoreStars helps businesses collect more positive public reviews and capture private customer feedback.",
  applicationName: "MoreStars",
  keywords: [
    "reviews",
    "google reviews",
    "business reviews",
    "qr code reviews",
    "customer feedback",
    "review software",
    "small business software",
  ],
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
      <body className="min-h-full bg-[#F8FBFF] text-[#1E293B]">
        {children}
      </body>
    </html>
  );
}