import "./scrollUp.css";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";


const ScrollUp = () => {
  
  window.addEventListener("scroll", function () {
    const scrollUp = this.document.querySelector(".scrollup");
    if (this.scrollY >= 560) {
      scrollUp?.classList.add("show-scroll");
    } else {
      scrollUp?.classList.remove("show-scroll");
    }
  });

  return (
    <a href="#" className="scrollup">
      <Button
        size="icon"
        className="md:h-12 md:w-12 h-10 w-10 rounded-full shadow-lg border border-border"
      >
        <ArrowUp className="h-10 w-10" />
      </Button>
    </a>
  );
};

export default ScrollUp;
