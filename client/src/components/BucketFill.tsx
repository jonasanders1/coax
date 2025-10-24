import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BUBBLE_COUNT = 15;
const MIN_DELAY = 0;
const MAX_DELAY = 3;
const MIN_DURATION = 3;
const MAX_DURATION = 8;

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

const BucketFill = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Generate initial bubbles
    const initialBubbles = Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
      id: i,
      size: Math.random() * 10 + 5,
      left: Math.random() * 100,
      delay: Math.random() * MAX_DELAY,
      duration: Math.random() * (MAX_DURATION - MIN_DURATION) + MIN_DURATION,
    }));
    setBubbles(initialBubbles);
  }, []);

  return (
    <div className="relative w-40 h-48">
      {/* Bucket container */}
      <div className="absolute inset-0 rounded-b-[30px] overflow-hidden border-l-[4px] border-b-[4px] border-r-[4px] border-gray-500">
        {/* Main water fill */}
        <div className="relative w-full h-full overflow-hidden">
          {/* Water fill */}
          <motion.div
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-700 to-blue-500"
            initial={{ height: "0%" }}
            animate={{ height: "95%" }}
            transition={{ duration: 4, ease: "easeInOut" }}
            onUpdate={(latest) => {
              // This will be used to update the text position
              const height = parseFloat(latest.height as string);
            }}
          >
            {/* 10L text that moves with water level */}
            <motion.span
              className="absolute left-1/2 -translate-x-1/2 z-10 font-bold text-2xl text-white/80"
              initial={{ bottom: "0%", opacity: 0 }}
              animate={{
                bottom: "47.5%", // Half of 95% water height to center in water
                opacity: 1,
              }}
              transition={{
                duration: 3.8, // Slightly less than water fill duration
                ease: "easeInOut",
                delay: 0.2, // Small delay to let water start filling first
              }}
              style={{
                display: "var(--display, block)",
              }}
            >
              10L
            </motion.span>

            {/* Bubbles container - positioned within water */}
            <div className="relative w-full h-full">
              {bubbles.map((bubble) => (
                <motion.div
                  key={bubble.id}
                  className="absolute rounded-full bg-white/30"
                  style={{
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    left: `${bubble.left}%`,
                    bottom: "0%",
                  }}
                  initial={{ y: 100, opacity: 0.5 }}
                  animate={{
                    y: -130,
                    opacity: [0.5, 0.8, 0],
                    x: [0, (Math.random() - 0.5) * 20],
                  }}
                  transition={{
                    duration: bubble.duration,
                    delay: bubble.delay,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bucket rim */}
      {/* <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-44 h-4 bg-gray-500 rounded-t-full" /> */}
    </div>
  );
};

export default BucketFill;
