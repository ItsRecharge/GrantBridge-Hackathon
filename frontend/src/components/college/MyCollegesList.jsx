export const MyCollegesList = ({ userColleges, onRemove, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Colleges</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📋 My Colleges ({userColleges.length})
      </h3>

      {userColleges.length === 0 ? (
        <p className="text-sm text-gray-600">
          No colleges added yet. Search and add colleges to your list!
        </p>
      ) : (
        <div className="space-y-3">
          {userColleges.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.College?.name}
                </p>
                {item.College?.state && (
                  <p className="text-xs text-gray-600">{item.College.state}</p>
                )}
              </div>
              <button
                onClick={() => onRemove(item.college_id)}
                className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded transition"
                title="Remove from list"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {userColleges.length > 0 && (
        <button className="w-full mt-4 btn btn-outline btn-sm">
          📊 View Aid Estimates
        </button>
      )}
    </div>
  );
};
