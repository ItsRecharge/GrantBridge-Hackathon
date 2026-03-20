export const LikedScholarshipsModal = ({
  isOpen,
  scholarships,
  onClose,
  onRemove,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Saved Scholarships ({scholarships.length})
          </h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : scholarships.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No saved scholarships yet. Start swiping to save scholarships!
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {scholarship.title}
                    </h3>
                    {scholarship.provider && (
                      <p className="text-sm text-gray-600 truncate">
                        {scholarship.provider}
                      </p>
                    )}
                    <div className="mt-2 flex gap-4 text-sm">
                      {scholarship.amount && (
                        <span className="text-green-600 font-semibold">
                          ${scholarship.amount.toLocaleString()}
                        </span>
                      )}
                      {scholarship.deadline && (
                        <span className="text-gray-600">
                          📅{' '}
                          {new Date(scholarship.deadline).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {scholarship.url && (
                      <a
                        href={scholarship.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-xs btn-primary h-8 flex items-center justify-center"
                      >
                        Apply
                      </a>
                    )}
                    <button
                      onClick={() => onRemove(scholarship.id)}
                      className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50"
                      title="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {scholarship.Tags && scholarship.Tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {scholarship.Tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-300"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="modal-action mt-6">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>

      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
