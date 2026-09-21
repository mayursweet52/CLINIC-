import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  delta?: { 
    value: string; 
    isUp: boolean 
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  delta, 
  className 
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta && (
          <p className="flex items-center text-xs mt-1 text-muted-foreground">
            {delta.isUp ? (
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
            )}
            <span 
              className={cn(
                "font-medium mr-1",
                delta.isUp ? "text-emerald-500" : "text-destructive"
              )}
            >
              {delta.value}
            </span>
            from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
