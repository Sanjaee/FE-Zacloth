"use client";

import { useEffect, useState } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useCounterAnimation } from "@/hooks/useCounterAnimation";
import { usePercentageAnimation } from "@/hooks/usePercentageAnimation";
import { useFadeInAnimation } from "@/hooks/useFadeInAnimation";

interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  newCustomers: number;
  visitorGrowth: number;
  customerGrowth: number;
}

export function SectionCards() {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    newCustomers: 0,
    visitorGrowth: 0,
    customerGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  // Counter animations with staggered delays
  const newCustomersCount = useCounterAnimation({
    end: stats.newCustomers,
    duration: 2000,
    delay: 200,
  });
  const totalVisitorsCount = useCounterAnimation({
    end: stats.totalVisitors,
    duration: 2000,
    delay: 400,
  });
  const uniqueVisitorsCount = useCounterAnimation({
    end: stats.uniqueVisitors,
    duration: 2000,
    delay: 600,
  });

  // Percentage animations
  const customerGrowthPercentage = usePercentageAnimation({
    end: stats.customerGrowth,
    duration: 1500,
    delay: 800,
  });
  const visitorGrowthPercentage = usePercentageAnimation({
    end: stats.visitorGrowth,
    duration: 1500,
    delay: 1000,
  });
  const uniqueVisitorRatio = usePercentageAnimation({
    end:
      stats.totalVisitors > 0
        ? (stats.uniqueVisitors / stats.totalVisitors) * 100
        : 0,
    duration: 1500,
    delay: 1200,
  });

  // Fade-in animations for cards
  const card1Animation = useFadeInAnimation({ delay: 100 });
  const card2Animation = useFadeInAnimation({ delay: 200 });
  const card3Animation = useFadeInAnimation({ delay: 300 });
  const card4Animation = useFadeInAnimation({ delay: 400 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = (await api.visitors.getStats("30d")) as {
          success: boolean;
          stats: VisitorStats;
        };

        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        console.error("Error fetching visitor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <CardDescription>Loading...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card" style={card1Animation.style}>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Revenue for the last 30 days
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" style={card2Animation.style}>
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {newCustomersCount.count.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge
              variant={stats.customerGrowth >= 0 ? "outline" : "destructive"}
            >
              {stats.customerGrowth >= 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {customerGrowthPercentage >= 0 ? "+" : ""}
              {customerGrowthPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.customerGrowth >= 0
              ? "Growing customer base"
              : "Customer acquisition down"}
            {stats.customerGrowth >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            New users registered this month
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" style={card3Animation.style}>
        <CardHeader>
          <CardDescription>Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalVisitorsCount.count.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge
              variant={stats.visitorGrowth >= 0 ? "outline" : "destructive"}
            >
              {stats.visitorGrowth >= 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {visitorGrowthPercentage >= 0 ? "+" : ""}
              {visitorGrowthPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.visitorGrowth >= 0
              ? "Strong traffic growth"
              : "Traffic declining"}
            {stats.visitorGrowth >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Page visits this month</div>
        </CardFooter>
      </Card>
      <Card className="@container/card" style={card4Animation.style}>
        <CardHeader>
          <CardDescription>Unique Visitors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {uniqueVisitorsCount.count.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />+{uniqueVisitorRatio.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unique visitor engagement <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Distinct visitors this month
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
