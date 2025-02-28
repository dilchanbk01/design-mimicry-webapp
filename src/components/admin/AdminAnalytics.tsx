
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, CircleDollarSign, TicketCheck } from "lucide-react";

interface AnalyticsData {
  total_events: number;
  pending_events: number;
  total_tickets: number;
  total_revenue: number;
}

interface AdminAnalyticsProps {
  analytics: AnalyticsData;
}

export function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CalendarDays className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{analytics.total_events}</div>
              <p className="text-xs text-gray-500">Events created</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{analytics.pending_events}</div>
              <p className="text-xs text-gray-500">Events awaiting review</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Tickets Sold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TicketCheck className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{analytics.total_tickets}</div>
              <p className="text-xs text-gray-500">Total bookings</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CircleDollarSign className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">₹{analytics.total_revenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500">From all events</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
