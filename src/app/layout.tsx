import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Scribe",
  description: "Github Copilot- but for writing",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark" attribute="class">
          <TRPCReactProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
