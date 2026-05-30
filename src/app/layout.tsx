import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lifting Diary",
  description: "Track your lifts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <header className="flex items-center justify-end px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <Show when="signed-out">
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="px-4 py-1.5 text-sm font-medium rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-1.5 text-sm font-medium rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
