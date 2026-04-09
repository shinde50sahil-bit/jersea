import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";

const headline = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-headline"
});

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Jersea | Streetwear Jerseys",
  description: "High-energy jerseys with one-click WhatsApp checkout."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headline.variable} ${body.variable}`}>
      <body className="bg-jersea-bg text-white antialiased">{children}</body>
    </html>
  );
}
