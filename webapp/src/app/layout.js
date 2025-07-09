import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "SparkNotes — YouTube Video Summarizer",
  description:
    "SparkNotes is a fast, AI-powered tool that summarizes YouTube videos into key points, mind maps, and more. Skip the fluff and get straight to the core ideas.",
  keywords: [
    "YouTube Summarizer",
    "Video Summarizer",
    "AI Summary",
    "Mind Map Generator",
    "AI Tools",
    "SparkNotes",
    "YouTube Video Summary",
  ],
  authors: [{ name: "AppajiDheeraj", url: "https://github.com/AppajiDheeraj" }],
  creator: "AppajiDheeraj",
  icons: {
    icon: "/Logo.svg",
  },
  themeColor: "#FFFBD6",
  openGraph: {
    title: "SparkNotes — YouTube Video Summarizer",
    description:
      "Summarize YouTube videos effortlessly with SparkNotes! Generate mind maps, extended thinking, and more in seconds.",
    url: "https://sparknotes.vercel.app/",
    siteName: "SparkNotes",
    images: [
      {
        url: "/logo.png", // Recommended: Add an OG image in /public
        width: 630,
        height: 630,
        alt: "SparkNotes - YouTube Summarizer",
      },
    ],
    type: "website",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;700&family=Fredoka+One&family=Luckiest+Guy&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
