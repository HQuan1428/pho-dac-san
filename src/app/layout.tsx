import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0b6b55",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: "Phố Đặc Sản",
  description: "Chợ đặc sản vùng miền nhiều gian hàng",
  applicationName: "Phố Đặc Sản",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Phố Đặc Sản",
    title: "Phố Đặc Sản",
    description: "Chợ đặc sản vùng miền nhiều gian hàng",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Phố Đặc Sản",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phố Đặc Sản",
    description: "Chợ đặc sản vùng miền nhiều gian hàng",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Phố Đặc Sản",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${body.variable} ${mono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
