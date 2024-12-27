import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Modals from "@/components/Modals/modules/Modals";
import Header from "@/components/Common/modules/Header";
import "@rainbow-me/rainbowkit/styles.css";
import Footer from "@/components/Common/modules/Footer";

export const metadata: Metadata = {
  title: "Triple A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <Providers>
          <div className="relative w-full h-screen flex flex-col items-start justify-start gap-3 px-2">
            <Header />
            {children}
          </div>
          <Footer />
          <Modals />
        </Providers>
      </body>
    </html>
  );
}
