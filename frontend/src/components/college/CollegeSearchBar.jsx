import { useState, useEffect } from 'react';

export const CollegeSearchBar = ({ onSearch, loading }) => {
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // Auto-focus on mount
    const input = document.querySelector('#college-search-input');
    if (input) input.focus();
  }, []);

  const handleChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleClear = () => {
    setSearchInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Colleges</h2>
      <p className="text-gray-600 mb-6">
        Find colleges and get estimated financial aid packages.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex gap-2">
          <div className="flex-1 relative">
            <input
              id="college-search-input"
              type="text"
              value={searchInput}
              onChange={handleChange}
              placeholder="Enter college name to manually pull information..."
              className="input input-bordered w-full pr-10"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Searching...
              </>
            ) : (
              <>
                🔍 Search
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
