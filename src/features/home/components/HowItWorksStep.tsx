"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ANIMATION_DELAY_STEP,
  ANIMATION_DURATION,
  ANIMATION_OFFSET_Y_STEP,
  EASING_CURVE,
} from "@/constants/animations";

type HowItWorksStepProps = {
  step: {
    icon: LucideIcon;
    title: string;
    text: string;
  };
  index: number;
};

export function HowItWorksStep({ step, index }: HowItWorksStepProps) {
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: ANIMATION_OFFSET_Y_STEP }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        delay: index * ANIMATION_DELAY_STEP,
        duration: ANIMATION_DURATION,
        ease: EASING_CURVE,
      }}
      className={`relative flex ${
        isEven ? "flex-row" : "flex-row-reverse"
      } items-center mb-12`}
    >
      <div
        className={`w-1/2 ${
          isEven
            ? "pr-4 md:pr-8 text-left md:text-center text-sm md:text-base"
            : "pl-4 md:pl-8 text-left md:text-center text-sm md:text-base"
        }`}
      >
        <h3 className="text-base md:text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-muted-foreground">{step.text}</p>
      </div>
      <div className="w-8 h-8 md:w-12 md:h-12 aspect-square bg-primary rounded-full flex items-center justify-center z-10 flex-shrink-0">
        <Icon className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
      </div>
      <div className="w-1/2"></div>
    </motion.div>
  );
}

