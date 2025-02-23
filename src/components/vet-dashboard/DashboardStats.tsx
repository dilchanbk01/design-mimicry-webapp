
export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
        <p className="text-gray-500">No appointments scheduled</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <p className="text-gray-500">No new messages</p>
      </div>
    </div>
  );
}
