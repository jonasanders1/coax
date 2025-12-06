"use client";

import { useEffect, useRef } from "react";
import styles from "./scrollUp.module.css";
import { Button } from "@/shared/components/ui/button";
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
      aria-label="Scroll til toppen av siden"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <Button
        size="icon"
        className="md:h-12 md:w-12 h-10 w-10 rounded-full shadow-md border border-border"
        aria-hidden="true"
        tabIndex={-1}
      >
        <ArrowUp className="h-10 w-10" aria-hidden="true" />
      </Button>
    </a>
  );
};

export default ScrollUp;
