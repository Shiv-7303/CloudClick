import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from 'next/font/google';
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/ui/Navbar";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import "./globals.css";

const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'], 
  style: ['normal', 'italic'], 
  weight: '400',
  variable: '--font-instrument-serif'
});

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: "CloudClick",
  description: "Generate premium social content from YouTube videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body bg-bg-base text-text-p antialiased`}>
        <Providers>
          <Navbar />
          <main className="pt-20 min-h-screen">
            {children}
          </main>
          <UpgradeModal />
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
