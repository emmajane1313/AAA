"use client";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Animation({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const onClick = (e: any) => {
      const target = e.target as HTMLElement;

      var foundTarget = target;

      if (
        target.tagName.toLowerCase() !== "a" &&
        target.tagName.toLowerCase() !== "button"
      ) {
        const closestAnchor = target.closest("a");
        if (closestAnchor) {
          foundTarget = closestAnchor;
        }
      }
      const lcTagName = foundTarget.tagName.toLowerCase();

      if (lcTagName === "a" || lcTagName === "button") {
        const href = foundTarget.getAttribute("href");
        if (href && href.startsWith("/")) {
          e.preventDefault();
          if (href !== path) {
            setLoading(true);
          }
          router.push(href);
        }
      }
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [router, path]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(false);
  }, [path]);

  return (
    <motion.div
      style={{ height: "100%", width: "100%" }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: loading ? 0.5 : 1, scale: loading ? 0.3 : 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 1, bounce: 2 },
      }}
    >
      {children}
    </motion.div>
  );
}
