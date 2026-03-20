import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar.jsx';
import scholarshipService from '../services/scholarshipService.js';
import toast from 'react-hot-toast';

export const SavedScholarshipsPage = () => {
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadSavedScholarships();
  }, []);

  const loadSavedScholarships = async () => {
    setLoading(true);
    try {
      const scholarships = await scholarshipService.getLikedScholarships();
      setSavedScholarships(scholarships);
    } catch (error) {
      toast.error('Failed to load saved scholarships');
      setSavedScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (scholarshipId) => {
    try {
      await scholarshipService.undoSwipe(scholarshipId);
      setSavedScholarships((prev) =>
        prev.filter((s) => s.id !== scholarshipId)
      );
      toast.success('Removed from saved');
    } catch (error) {
      toast.error('Failed to remove scholarship');
    }
  };

  // Calculate next deadline
  const getNextDeadline = () => {
    const now = new Date();
    const upcomingDeadlines = savedScholarships
      .filter((s) => s.deadline && new Date(s.deadline) > now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    return upcomingDeadlines[0]?.deadline;
  };

  // Calculate countdown
  const getCountdown = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Generate calendar days
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDeadlinesForMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const deadlineDates = new Set();

    savedScholarships.forEach((s) => {
      if (s.deadline) {
        const date = new Date(s.deadline);
        if (date.getFullYear() === year && date.getMonth() === month) {
          deadlineDates.add(date.getDate());
        }
      }
    });

    return deadlineDates;
  };

  // Filter and sort scholarships
  const filteredScholarships = savedScholarships
    .filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provider?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAmount =
        !filterAmount || s.amount >= parseInt(filterAmount);
      return matchesSearch && matchesAmount;
    })
    .sort((a, b) => {
      // Sort by deadline - soonest first
      const deadlineA = a.deadline ? new Date(a.deadline) : new Date(9999, 0, 0);
      const deadlineB = b.deadline ? new Date(b.deadline) : new Date(9999, 0, 0);
      return deadlineA - deadlineB;
    });

  const nextDeadline = getNextDeadline();
  const daysUntilDeadline = nextDeadline ? getCountdown(nextDeadline) : null;
  const deadlinesThisMonth = getDeadlinesForMonth();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Saved Scholarships
          </h1>
          <p className="text-gray-600">
            Manage your saved scholarships and track application deadlines
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading scholarships...</p>
            </div>
          </div>
        ) : savedScholarships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">
              No saved scholarships yet.
            </p>
            <p className="text-gray-600">
              Start swiping to save scholarships you're interested in!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Calendar and Countdown */}
            <div className="space-y-6">
              {/* Mini Calendar */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Deadlines
                </h2>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    className="btn btn-sm btn-ghost"
                  >
                    ←
                  </button>
                  <span className="text-sm font-semibold text-gray-900">
                    {monthName}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="btn btn-sm btn-ghost"
                  >
                    →
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-600"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasDeadline = deadlinesThisMonth.has(day);

                    return (
                      <div
                        key={day}
                        className={`aspect-square flex items-center justify-center rounded text-xs font-semibold ${
                          hasDeadline
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Countdown */}
              {nextDeadline && daysUntilDeadline !== null && (
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
                  <h3 className="text-sm font-semibold opacity-90 mb-2">
                    Next Deadline
                  </h3>
                  <div className="text-4xl font-bold mb-2">
                    {daysUntilDeadline}
                  </div>
                  <p className="text-sm opacity-90">
                    {daysUntilDeadline === 1 ? 'day' : 'days'} remaining
                  </p>
                  <p className="text-xs opacity-75 mt-3">
                    {new Date(nextDeadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Scholarships List */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Filter
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Search by name or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full"
                  />
                  <input
                    type="number"
                    placeholder="Minimum amount"
                    value={filterAmount}
                    onChange={(e) => setFilterAmount(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Scholarships List */}
              <div className="space-y-3">
                {filteredScholarships.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600">
                      No scholarships match your filters.
                    </p>
                  </div>
                ) : (
                  filteredScholarships.map((scholarship) => {
                    const daysLeft = scholarship.deadline
                      ? getCountdown(scholarship.deadline)
                      : null;
                    const isUrgent = daysLeft && daysLeft <= 7;

                    return (
                      <div
                        key={scholarship.id}
                        className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
                          isUrgent ? 'border-red-500' : 'border-blue-500'
                        }`}
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
                            <div className="mt-2 flex gap-4 text-sm flex-wrap">
                              {scholarship.amount && (
                                <span className="text-green-600 font-semibold">
                                  ${scholarship.amount.toLocaleString()}
                                </span>
                              )}
                              {scholarship.deadline && (
                                <span
                                  className={`font-medium ${
                                    isUrgent
                                      ? 'text-red-600'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {daysLeft !== null &&
                                    daysLeft > 0 &&
                                    `${daysLeft} days left`}
                                  {daysLeft === 0 && 'Due today!'}
                                  {daysLeft < 0 && 'Deadline passed'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 flex-shrink-0 items-center">
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
                              onClick={() => handleRemove(scholarship.id)}
                              className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50"
                              title="Remove from saved"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Tags */}
                        {scholarship.Tags &&
                          scholarship.Tags.length > 0 && (
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
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
