"use client";

import { useEffect, useRef } from "react";
import styles from "./scrollUp.module.css";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const ScrollUp = () => {
  const scrollUpRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollUpRef.current) return;

      if (window.scrollY >= 560) {
        scrollUpRef.current.classList.add(styles.showScroll);
      } else {
        scrollUpRef.current.classList.remove(styles.showScroll);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      ref={scrollUpRef}
      href="#"
      className={styles.scrollUp}
      aria-label="Til toppen"
    >
      <Button
        size="icon"
        className="md:h-12 md:w-12 h-10 w-10 rounded-full shadow-md border border-border"
      >
        <ArrowUp className="h-10 w-10" />
      </Button>
    </a>
  );
};

export default ScrollUp;
