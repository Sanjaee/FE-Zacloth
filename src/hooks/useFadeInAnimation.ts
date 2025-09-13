import { useEffect, useState } from "react";

interface UseFadeInAnimationProps {
  delay?: number;
  duration?: number;
}

export const useFadeInAnimation = ({
  delay = 0,
  duration = 600,
}: UseFadeInAnimationProps = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [transform, setTransform] = useState("translateY(20px)");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);

      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setOpacity(easeOut);
        setTransform(`translateY(${20 * (1 - easeOut)}px)`);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setOpacity(1);
          setTransform("translateY(0px)");
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, duration]);

  return {
    isVisible,
    style: {
      opacity,
      transform,
      transition: isVisible ? "none" : "opacity 0.3s ease, transform 0.3s ease",
    },
  };
};
