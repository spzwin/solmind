import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolMind - AI Solana Investment Agent",
  description:
    "Autonomous AI agent that analyzes Solana on-chain data and generates investment insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-solana-dark antialiased">
        {children}
      </body>
    </html>
  );
}
