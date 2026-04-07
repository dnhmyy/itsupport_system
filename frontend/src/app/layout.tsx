import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://support.akhdnn.web.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "IT Support System",
  description: "Secure IT support, monitoring, and asset operations workspace.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

import AuthProvider from "@/components/layout/AuthProvider";
import SidebarWrapper from "@/components/layout/SidebarWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <AuthProvider>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
