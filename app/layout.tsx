
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
  title: "PlanREAL",
  description: "Reality-focused task management.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PlanREAL",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png", // Use same icon for now
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
        <div className="relative flex min-h-screen w-full max-w-[430px] flex-col bg-[#FFFFFF] shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
