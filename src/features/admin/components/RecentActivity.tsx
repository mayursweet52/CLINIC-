import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Activity {
  id: string;
  action: string;
  user: string;
  timeAgo: string;
}

export const RecentActivity = ({ activities }: { activities: Activity[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4 relative">
              {/* Timeline line */}
              {index !== activities.length - 1 && (
                <div className="absolute left-[7px] top-6 bottom-[-16px] w-[2px] bg-slate-100 dark:bg-slate-800" />
              )}
              {/* Dot */}
              <div className="mt-1.5 h-4 w-4 rounded-full border-2 border-primary-500 bg-white dark:bg-slate-950 z-10 shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.action}</p>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-2">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
