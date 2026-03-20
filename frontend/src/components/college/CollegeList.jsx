import { CollegeCard } from './CollegeCard.jsx';

export const CollegeList = ({
  colleges,
  loading,
  collegesInList,
  onAddToList,
  onRemoveFromList,
  onEstimate,
  estimatingCollege,
  totalResults,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching colleges...</p>
        </div>
      </div>
    );
  }

  if (colleges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">
          No colleges found. Try a different search or use AI search!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {colleges.length} of {totalResults} results
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {colleges.map((college) => (
          <CollegeCard
            key={college.id}
            college={college}
            isInList={collegesInList.includes(college.id)}
            onAddToList={onAddToList}
            onRemoveFromList={onRemoveFromList}
            onEstimate={onEstimate}
            estimating={estimatingCollege === college.id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-sm"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`btn btn-sm ${
                  page === currentPage ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
