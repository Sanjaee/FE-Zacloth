import { useEffect, useState } from "react";

interface UseCounterAnimationProps {
  end: number;
  duration?: number;
  start?: number;
  delay?: number;
}

export const useCounterAnimation = ({
  end,
  duration = 2000,
  start = 0,
  delay = 0,
}: UseCounterAnimationProps) => {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (end === start) {
      setCount(end);
      return;
    }

    const timer = setTimeout(() => {
      setIsAnimating(true);

      const startTime = Date.now();
      const difference = end - start;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = start + difference * easeOut;

        setCount(Math.floor(currentCount));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      setIsAnimating(false);
    };
  }, [end, duration, start, delay]);

  return { count, isAnimating };
};
