import type { Metadata } from "next";
import "./globals.css";

import MobileNav from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "Vault Tracker",
  description:
    "Inventory management and transfer workflow for Broad St Buds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#06070A] text-white antialiased pb-24 lg:pb-0">
        <MobileNav />

        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}