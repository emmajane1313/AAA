"use client";
import { motion } from "framer-motion";
import { useContext, useEffect } from "react";
import { AnimationContext } from "./providers";

export default function Animation({ children }: { children: React.ReactNode }) {
  const context = useContext(AnimationContext);

  useEffect(() => {
    if (context?.pageChange) {
      const timer = setTimeout(() => {
        context?.setPageChange(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [context?.pageChange]);

  return (
    <motion.div
      style={{ height: "100%", width: "100%" }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: context?.pageChange ? 0 : 1,
        scale: context?.pageChange ? 0.8 : 1,
        rotate: context?.pageChange ? 10 : 0, 
        backgroundColor: context?.pageChange ? "#73B6DF" : undefined,
      }}
      transition={{
        duration: 0.7, 
        ease: [0.6, -0.05, 0.01, 0.99], 
      }}
    >
      {children}
    </motion.div>
  );
}
