export const CollegeCard = ({
  college,
  isInList,
  onAddToList,
  onRemoveFromList,
  onEstimate,
  estimating,
}) => {
  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddToList(college.id);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveFromList(college.id);
  };

  const handleEstimateClick = (e) => {
    e.stopPropagation();
    onEstimate(college.name);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{college.name}</h3>
          <div className="flex gap-3 text-sm text-gray-600 mt-1">
            {college.state && <span>📍 {college.state}</span>}
            {college.type && <span>🏫 {college.type}</span>}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {college.url && (
          <a
            href={college.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Visit Website →
          </a>
        )}
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleAddClick}
          disabled={isInList}
          className={`flex-1 btn btn-sm ${
            isInList ? 'btn-disabled' : 'btn-primary'
          }`}
        >
          {isInList ? '✓ In My List' : '❤️ Add to My List'}
        </button>

        <button
          onClick={handleEstimateClick}
          disabled={estimating}
          className="flex-1 btn btn-sm btn-outline"
        >
          {estimating ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Estimating...
            </>
          ) : (
            '💰 Estimate Aid'
          )}
        </button>
      </div>
    </div>
  );
};
