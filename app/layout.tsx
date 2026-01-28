
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zooming for app-like feel
};

export const metadata: Metadata = {
  title: {
    default: "PlanREAL - Reality-Based Task Manager",
    template: "%s | PlanREAL",
  },
  description: "Stop estimating, start living. PlanREAL adjusts your tasks based on your actual energy levels and deadlines. Features Reality Mode for instant prioritization.",
  keywords: ["productivity", "task manager", "todo list", "reality mode", "energy management", "focus"],
  authors: [{ name: "PlanREAL Team" }],
  creator: "PlanREAL",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://planer-app.vercel.app", // Fallback, updated on deploy
    title: "PlanREAL - Reality-Based Task Manager",
    description: "Tasks adjusted for your energy. Stop overplanning.",
    siteName: "PlanREAL",
    images: [
      {
        url: "/icon-512x512.png", // We should ideally add a real og-image.png later
        width: 512,
        height: 512,
        alt: "PlanREAL Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlanREAL",
    description: "Tasks adjusted for your energy.",
    images: ["/icon-512x512.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PlanREAL",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased bg-gray-50 min-h-screen flex justify-center`}
      >
         {/* Mobile Wrapper */}
        <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-[#FFFFFF] shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
