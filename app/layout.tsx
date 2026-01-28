import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AtmosphereWrapper } from "@/components/AtmosphereWrapper";

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
    default: "Planer",
    template: "%s | Planer",
  },
  description: "Stop estimating, start living. Planer adjusts your tasks based on your actual energy levels and deadlines. Features Reality Mode for instant prioritization.",
  keywords: ["productivity", "task manager", "todo list", "reality mode", "energy management", "focus"],
  authors: [{ name: "Planer Team" }],
  creator: "Planer",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://planer-app.vercel.app", // Fallback, updated on deploy
    title: "Planer",
    description: "Tasks adjusted for your energy. Stop overplanning.",
    siteName: "Planer",
    images: [
      {
        url: "/icon-512x512.png", // We should ideally add a real og-image.png later
        width: 512,
        height: 512,
        alt: "Planer Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planer",
    description: "Tasks adjusted for your energy.",
    images: ["/icon-512x512.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Planer",
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
        className={`${inter.variable} ${jakarta.variable} antialiased min-h-screen flex justify-center transition-colors duration-1000 bg-gray-900`}
      >
         {/* Mobile Wrapper handled by Client Component */}
        <AtmosphereWrapper>
          {children}
        </AtmosphereWrapper>
      </body>
    </html>
  );
}
