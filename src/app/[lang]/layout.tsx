import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MediaUploadProvider } from "@/contexts/MediaUploadContext";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Coffee Click",
  description: "A Web-App to you buy and sell coffee",
};

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body>
        <ThemeProvider props={{}}>
          <AuthProvider>
            <MediaUploadProvider>
              {children}
            </MediaUploadProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
