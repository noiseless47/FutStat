import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { TopNavigation } from '@/components/TopNavigation'
import { SportsNavigation } from '@/components/SportsNavigation'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from 'next-themes'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "FutStat Pro - Live Football Stats & Analytics",
  description: "Real-time football scores, statistics, and analytics for all major leagues and competitions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopNavigation />
          <SportsNavigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
