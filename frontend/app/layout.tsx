import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LoadingProvider } from "@/lib/loading-context";
import { GlobalLoading } from "@/components/global-loading";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MintCare | Nền tảng Chăm sóc Y tế Tại gia",
  description: "Trung tâm Điều hành Y tế Chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body 
        className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <LoadingProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <GlobalLoading />
        </LoadingProvider>
      </body>
    </html>
  );
}
