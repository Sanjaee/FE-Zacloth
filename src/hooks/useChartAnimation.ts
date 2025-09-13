import { useEffect, useState } from "react";

interface ChartDataPoint {
  date: string;
  visitors: number;
}

interface UseChartAnimationProps {
  data: ChartDataPoint[];
  duration?: number;
  delay?: number;
}

export const useChartAnimation = ({
  data,
  duration = 2000,
  delay = 0,
}: UseChartAnimationProps) => {
  const [animatedData, setAnimatedData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setAnimatedData([]);
      return;
    }

    const timer = setTimeout(() => {
      const startTime = Date.now();
      const maxVisitors = Math.max(...data.map((d) => d.visitors));

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentData = data.map((item, index) => {
          // Stagger animation for each data point
          const itemDelay = (index / data.length) * 0.3; // 30% of total duration for staggering
          const itemProgress = Math.max(
            0,
            Math.min(1, (progress - itemDelay) / (1 - itemDelay))
          );
          const itemEaseOut = 1 - Math.pow(1 - itemProgress, 3);

          return {
            ...item,
            visitors: Math.floor(item.visitors * itemEaseOut),
          };
        });

        setAnimatedData(currentData);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimatedData(data);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [data, duration, delay]);

  return animatedData;
};
