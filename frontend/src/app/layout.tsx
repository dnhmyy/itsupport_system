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

export const metadata: Metadata = {
  title: "OpsCore IT Support System",
  description: "Secure IT support, monitoring, and asset operations workspace.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
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
    <html lang="en">
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
