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
      <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
        <ArrowUp className="h-10 w-10" />
      </Button>
    </a>
  );
};

export default ScrollUp;
