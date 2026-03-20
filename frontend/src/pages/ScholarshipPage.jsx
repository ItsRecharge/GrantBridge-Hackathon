import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Navbar } from '../components/layout/Navbar.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const ScholarshipPage = () => {
  const [scholarships, setScholarships] = useState([]);
  const [tags, setTags] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadTags();
    loadScholarships();
  }, []);

  const loadTags = async () => {
    try {
      const response = await api.get('/scholarships/tags');
      setTags(response.data.tags);
    } catch (error) {
      console.log('No tags available yet');
    }
  };

  const loadScholarships = async (pageNum = 1, selectedTagsList = [], min = '', max = '') => {
    setSearching(true);
    try {
      const params = new URLSearchParams();

      if (selectedTagsList.length > 0) {
        params.append('tags', selectedTagsList.join(','));
      }
      if (min) params.append('minAmount', min);
      if (max) params.append('maxAmount', max);
      params.append('page', pageNum);
      params.append('limit', 10);

      const response = await api.get(`/scholarships?${params.toString()}`);

      setScholarships(response.data.scholarships);
      setTotalPages(response.data.pages);
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load scholarships');
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(updated);
    loadScholarships(1, updated, minAmount, maxAmount);
  };

  const handleAmountFilter = () => {
    loadScholarships(1, selectedTags, minAmount, maxAmount);
  };

  const handleSaveScholarship = async (scholarshipId) => {
    try {
      await api.post(`/scholarships/save/${scholarshipId}`);
      toast.success('Scholarship saved!');
    } catch (error) {
      toast.error('Failed to save scholarship');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scholarships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Find Scholarships</h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Amount Filter */}
              <div className="mb-6">
                <label className="form-label">Amount Range</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    className="form-input text-sm"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input text-sm"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                  <button
                    onClick={handleAmountFilter}
                    className="w-full btn-primary text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Tag Filters */}
              {Object.entries(tags).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">Categories</h4>
                  {Object.entries(tags).map(([category, categoryTags]) => (
                    <div key={category} className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                        {category}
                      </p>
                      <div className="space-y-2">
                        {categoryTags.map(tag => (
                          <label key={tag.id} className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag.name)}
                              onChange={() => handleTagToggle(tag.name)}
                              className="mr-2"
                            />
                            <span className="text-gray-700">{tag.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scholarships List */}
          <div className="lg:col-span-3">
            {scholarships.length > 0 ? (
              <div className="space-y-4">
                {scholarships.map(scholarship => (
                  <div
                    key={scholarship.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedScholarship(scholarship)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {scholarship.title}
                      </h3>
                      <span className="text-2xl font-bold text-blue-600 ml-4">
                        {scholarship.amount_text}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {scholarship.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {scholarship.Tags?.slice(0, 3).map(tag => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {scholarship.Tags?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{scholarship.Tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        Due {new Date(scholarship.deadline).toLocaleDateString()}
                      </div>
                    </div>

                    {selectedScholarship?.id === scholarship.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-gray-600 mb-3">{scholarship.description}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveScholarship(scholarship.id);
                          }}
                          className="btn-primary mr-2"
                        >
                          Save Scholarship
                        </button>
                        {scholarship.url && (
                          <a
                            href={scholarship.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary inline-block"
                          >
                            View Details
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 mb-4">
                  {selectedTags.length > 0 || minAmount || maxAmount
                    ? 'No scholarships match your filters'
                    : 'No scholarships available yet'}
                </p>
                <p className="text-sm text-gray-500">
                  {!selectedTags.length && !minAmount && !maxAmount && 'Check back soon!'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                  <button
                    onClick={() => loadScholarships(page - 1, selectedTags, minAmount, maxAmount)}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() =>
                      loadScholarships(p, selectedTags, minAmount, maxAmount)
                    }
                    className={`px-3 py-2 rounded ${
                      p === page ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {page < totalPages && (
                  <button
                    onClick={() => loadScholarships(page + 1, selectedTags, minAmount, maxAmount)}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
