"use client";

import Gallery from "@/components/Common/modules/Gallery";
import Header from "@/components/Common/modules/Header";

export default function Home() {
  return (
    <div className="relative w-full h-full min-h-screen max-h-screen flex flex-col items-start justify-start px-3 sm:px-8 gap-10">
      <Header />
      <Gallery />
    </div>
  );
}
