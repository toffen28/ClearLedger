import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/store/AppContext";

export const metadata: Metadata = {
  title: "ClearLedger — Personal Finance for Freelancers",
  description: "Track income, expenses, invoices, and tax obligations in one place. No complexity, no spreadsheets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}