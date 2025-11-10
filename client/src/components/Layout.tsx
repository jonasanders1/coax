import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Outlet, ScrollRestoration, useOutletContext } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo, { SITE_URL } from "@/components/Seo";

import type { Variants } from "framer-motion";

const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.16, 0.3, 0.3, 1], // Custom cubic-bezier for smoother motion
    },
  },
};

const Layout = () => {
  const location = useLocation();
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Set a small delay to ensure the initial render is complete
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Seo
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "COAX",
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.ico`,
          sameAs: [
            "https://www.linkedin.com/company/coax-norway/",
            "https://www.facebook.com/coax.no",
          ],
        }}
      />
      <Header />
      <ScrollRestoration />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))]"
          onAnimationComplete={() => setIsAnimated(true)}
        >
          <Outlet context={{ isAnimated }} />
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
};

export const useLayoutAnimation = () => {
  return useOutletContext<{ isAnimated: boolean }>();
};

export default Layout;
