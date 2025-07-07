import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/redux/provider";
import { OnlineStatusListener } from "@/components/OnlineStatusListener"; // 👈 Add this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sambad",
  description: "Secure team chat and collaboration platform",
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
        <ReduxProvider>
          <OnlineStatusListener /> {/* 👈 Add this inside provider */}
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton={false}
            toastOptions={{
              className: "bg-secondary text-secondary-foreground",
              style: {
                fontFamily: "var(--font-geist-sans)",
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
