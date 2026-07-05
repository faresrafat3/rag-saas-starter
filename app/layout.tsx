import type { Metadata } from "next";
import { Cairo, Reem_Kufi } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-reem-kufi",
  display: "swap",
});

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
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${reemKufi.variable}`}
    >
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
