import { Analytics } from "@vercel/analytics/next"
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
  title: "3D Particle Music Visualizer",
  description: "A real-time 3D music visualizer where particles react to bass and mid frequencies of an uploaded MP3. Built with Three.js and the Web Audio API.",
  authors: [{name: "Jordan S. Johnson"}],
  keywords: ["3D", "music", "visualizer", "three.js", "next.js", "react", "webgl", "web audio api", "particles", "instanced rendering"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <canvas id="bg"></canvas>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
