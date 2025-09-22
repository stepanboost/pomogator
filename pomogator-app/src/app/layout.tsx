import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

export const metadata: Metadata = {
  title: "Помогатор",
  description: "Универсальный академический помощник для решения задач",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
          onError={(e) => {
            console.warn('Failed to load Telegram Web App script:', e);
          }}
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
