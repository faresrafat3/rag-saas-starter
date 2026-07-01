import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "RAG SaaS Starter — مساعد الذكاء الاصطناعي",
    template: "%s | RAG SaaS Starter",
  },
  description:
    "Production-ready RAG chatbot SaaS starter with Arabic support, multi-document chat, and streaming responses.",
  keywords: [
    "RAG",
    "AI chatbot",
    "Next.js",
    "Arabic AI",
    "SaaS starter",
    "OpenAI",
  ],
  authors: [{ name: "Fares Rafat", url: "https://github.com/faresrafat3" }],
  openGraph: {
    title: "RAG SaaS Starter",
    description:
      "Production-ready RAG chatbot SaaS starter with Arabic support.",
    type: "website",
    locale: "ar_EG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
