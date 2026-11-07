
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign Machine Community",
  description:
    "An open community platform for contributing hand gesture data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#080D18] text-white antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
