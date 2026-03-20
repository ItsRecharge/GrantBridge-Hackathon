import { useState } from 'react';

export const ScholarshipFilters = ({
  tags,
  selectedTags,
  minAmount,
  maxAmount,
  onTagToggle,
  onMinAmountChange,
  onMaxAmountChange,
  onApplyFilters,
  onClearFilters,
  onResetDislikes,
  loading,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = Object.keys(tags || {});

  const filterContent = (
    <div className="space-y-6">
      {/* Tag Filters */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                {category}
              </p>
              <div className="space-y-2">
                {tags[category]?.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => onTagToggle(tag.name)}
                      className="checkbox checkbox-sm border-2 border-gray-400"
                    />
                    <span className="text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amount Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Amount</h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Min"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onApplyFilters}
          disabled={loading}
          className="btn btn-primary btn-sm w-full"
        >
          Apply Filters
        </button>
        <button
          onClick={onClearFilters}
          disabled={loading}
          className="btn btn-outline btn-sm w-full"
        >
          Clear All
        </button>
        <button
          onClick={onResetDislikes}
          disabled={loading}
          className="btn btn-outline btn-sm w-full text-amber-600 border-amber-300 hover:bg-amber-50"
          title="Reset scholarships you've passed on"
        >
          Reset Passed
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
          {filterContent}
        </div>
      </div>

      {/* Mobile Filters Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="btn btn-outline btn-sm w-full"
        >
          {showMobileFilters ? '✕ Hide Filters' : '⚙️ Show Filters'}
        </button>

        {showMobileFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            {filterContent}
          </div>
        )}
      </div>
    </>
  );
};
