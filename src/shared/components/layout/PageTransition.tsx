import { motion, type Transition } from "framer-motion";
import type { PropsWithChildren } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const pageTransition: Transition = {
  duration: 0.22,
  ease: "easeInOut",
};

export const PageTransition = ({ children }: PropsWithChildren) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className="min-h-screen w-full"
  >
    {children}
  </motion.div>
);
