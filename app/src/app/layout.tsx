import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Modals from "@/components/Modals/modules/Modals";
import Header from "@/components/Common/modules/Header";
import "@rainbow-me/rainbowkit/styles.css";

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
          <div className="relative w-full h-screen flex flex-col items-start justify-start px-3 sm:px-8 gap-10">
            <Header />
            {children}
          </div>
        </Providers>
        <Modals />
      </body>
    </html>
  );
}
