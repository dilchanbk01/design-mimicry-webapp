
interface Analytics {
  total_events: number;
  pending_events: number;
  total_tickets: number;
  total_revenue: number;
}

export function AnalyticsOverview({ analytics }: { analytics: Analytics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800">Total Events</h3>
        <p className="text-3xl font-bold text-blue-900">{analytics.total_events}</p>
      </div>
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800">Pending Approvals</h3>
        <p className="text-3xl font-bold text-yellow-900">{analytics.pending_events}</p>
      </div>
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800">Tickets Sold</h3>
        <p className="text-3xl font-bold text-green-900">{analytics.total_tickets}</p>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800">Total Revenue</h3>
        <p className="text-3xl font-bold text-purple-900">${analytics.total_revenue}</p>
      </div>
    </div>
  );
}
