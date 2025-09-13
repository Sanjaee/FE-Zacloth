import { useEffect, useState } from "react";

interface UsePercentageAnimationProps {
  end: number;
  duration?: number;
  start?: number;
  delay?: number;
}

export const usePercentageAnimation = ({
  end,
  duration = 1500,
  start = 0,
  delay = 0,
}: UsePercentageAnimationProps) => {
  const [percentage, setPercentage] = useState(start);

  useEffect(() => {
    if (end === start) {
      setPercentage(end);
      return;
    }

    const timer = setTimeout(() => {
      const startTime = Date.now();
      const difference = end - start;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercentage = start + difference * easeOut;

        setPercentage(currentPercentage);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setPercentage(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [end, duration, start, delay]);

  return percentage;
};
