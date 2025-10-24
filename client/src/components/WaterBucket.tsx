import React, { useEffect, useRef, useState } from 'react';
import styles from '@/components/WaterBucket.module.css';

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

const WaterBucket: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isFilling, setIsFilling] = useState(false);
  const waterRef = useRef<HTMLDivElement>(null);
  const bubbleContainerRef = useRef<HTMLDivElement>(null);
  const bubbleId = useRef(0);

  useEffect(() => {
    setIsFilling(true);
    return () => {
      setIsFilling(false);
    };
  }, []);
  
  console.log("styles", styles);
  useEffect(() => {
    if (!isFilling) return;

    const createBubble = () => {
      const size = Math.random() * 15 + 5; // 5-20px
      const left = Math.random() * 80 + 10; // 10-90%
      const delay = Math.random() * 2; // 0-2s
      const duration = Math.random() * 4 + 2; // 2-4s

      const newBubble: Bubble = {
        id: bubbleId.current++,
        size,
        left,
        delay,
        duration,
      };

      setBubbles((prev) => [...prev, newBubble]);

      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
      }, (duration + delay) * 1000);
    };

    const interval = setInterval(createBubble, 300);
    return () => clearInterval(interval);
  }, [isFilling]);

  return (
    <div className={styles.container}>
      <div className={styles.bucket}>
        <div className={styles.bucketTop}></div>
        <div className={styles.bucketBody}>
          <div
            ref={waterRef}
            className={`${styles.water} ${isFilling ? styles.filling : ''}`}
          >
            <div ref={bubbleContainerRef} className={styles.bubbleContainer}>
              {bubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  className={styles.bubble}
                  style={{
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`, // Fixed typo: bucket.size -> bubble.size
                    left: `${bubble.left}%`,
                    bottom: '0',
                    // animation: `bubbleRise ${bubble.duration}s ease-in-out ${bubble.delay}s forwards`,
                    // opacity: 0.6 + Math.random() * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterBucket;