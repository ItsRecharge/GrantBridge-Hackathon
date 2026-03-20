import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { ScholarshipFilters } from '../components/scholarship/ScholarshipFilters.jsx';
import { ScholarshipSwipeCard } from '../components/scholarship/ScholarshipSwipeCard.jsx';
import { SwipeControls } from '../components/scholarship/SwipeControls.jsx';
import { LikedScholarshipsModal } from '../components/scholarship/LikedScholarshipsModal.jsx';
import scholarshipService from '../services/scholarshipService.js';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const ScholarshipSwipePage = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tags, setTags] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedScholarships, setLikedScholarships] = useState([]);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);

  useEffect(() => {
    loadTags();
    loadFeed();
  }, []);

  const loadTags = async () => {
    try {
      const response = await api.get('/scholarships/tags');
      setTags(response.data.tags || {});
    } catch (error) {
      console.log('Failed to load tags');
    }
  };

  const loadFeed = async (newSelectedTags = selectedTags, min = minAmount, max = maxAmount) => {
    setLoading(true);
    try {
      const result = await scholarshipService.getScholarshipFeed(
        newSelectedTags,
        min || undefined,
        max || undefined,
        undefined,
        1,
        20
      );
      setScholarships(result.scholarships || []);
      setCurrentIndex(0);
    } catch (error) {
      toast.error('Failed to load scholarships');
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedScholarships = async () => {
    setLoadingLiked(true);
    try {
      const liked = await scholarshipService.getLikedScholarships();
      setLikedScholarships(liked);
    } catch (error) {
      toast.error('Failed to load liked scholarships');
    } finally {
      setLoadingLiked(false);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleApplyFilters = () => {
    loadFeed(selectedTags, minAmount, maxAmount);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setMinAmount('');
    setMaxAmount('');
    loadFeed([], '', '');
  };

  const handleLike = async () => {
    const scholarship = scholarships[currentIndex];
    if (!scholarship) return;

    setSwipeDirection('right');
    try {
      await scholarshipService.swipeScholarship(scholarship.id, 'like');
      setSwipeHistory([{ id: scholarship.id, direction: 'like' }, ...swipeHistory.slice(0, 4)]);
      setLikedScholarships((prev) => [...prev, scholarship]);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
      }, 300);
      toast.success('Saved!');
    } catch (error) {
      setSwipeDirection(null);
      if (error.response?.status === 409) {
        toast('Already swiped this scholarship');
        setCurrentIndex((prev) => prev + 1);
      } else {
        toast.error('Failed to save scholarship');
      }
    }
  };

  const handleDislike = async () => {
    const scholarship = scholarships[currentIndex];
    if (!scholarship) return;

    setSwipeDirection('left');
    try {
      await scholarshipService.swipeScholarship(scholarship.id, 'dislike');
      setSwipeHistory([{ id: scholarship.id, direction: 'dislike' }, ...swipeHistory.slice(0, 4)]);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
      }, 300);
    } catch (error) {
      setSwipeDirection(null);
      if (error.response?.status === 409) {
        toast('Already swiped this scholarship');
        setCurrentIndex((prev) => prev + 1);
      } else {
        toast.error('Failed to record swipe');
      }
    }
  };

  const handleUndo = async () => {
    if (swipeHistory.length === 0) {
      toast('Nothing to undo!');
      return;
    }

    const lastSwipe = swipeHistory[0];
    try {
      await scholarshipService.undoSwipe(lastSwipe.id);
      setSwipeHistory(swipeHistory.slice(1));
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      // Reload feed to include the unswipped scholarship
      loadFeed(selectedTags, minAmount, maxAmount);
      toast.success('Swipe undone! You can swipe this scholarship again.');
    } catch (error) {
      toast.error('Failed to undo swipe');
    }
  };

  const handleViewLiked = async () => {
    setShowLikedModal(true);
    if (likedScholarships.length === 0) {
      await loadLikedScholarships();
    }
  };

  const handleRemoveLiked = async (scholarshipId) => {
    try {
      await scholarshipService.undoSwipe(scholarshipId);
      setLikedScholarships((prev) =>
        prev.filter((s) => s.id !== scholarshipId)
      );
      toast.success('Removed from saved. You can swipe it again!');
    } catch (error) {
      toast.error('Failed to remove scholarship');
    }
  };

  const handleResetDislikes = async () => {
    try {
      const result = await scholarshipService.resetDislikes();
      toast.success(result.message);
      // Reload the feed to include previously disliked scholarships
      await loadFeed(selectedTags, minAmount, maxAmount);
    } catch (error) {
      toast.error('Failed to reset scholarships');
    }
  };

  const currentScholarship = scholarships[currentIndex];
  const isFinished = currentIndex >= scholarships.length && scholarships.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Discover Scholarships
            </h1>
            <p className="text-gray-600">
              Swipe through scholarships and save the ones you like!
            </p>
          </div>
          <button
            onClick={() => navigate('/saved-scholarships')}
            className="btn btn-outline flex items-center gap-2 whitespace-nowrap"
          >
            📅 View Calendar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div>
            <ScholarshipFilters
              tags={tags}
              selectedTags={selectedTags}
              minAmount={minAmount}
              maxAmount={maxAmount}
              onTagToggle={handleTagToggle}
              onMinAmountChange={setMinAmount}
              onMaxAmountChange={setMaxAmount}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              onResetDislikes={handleResetDislikes}
              loading={loading}
            />
          </div>

          {/* Main Swipe Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading scholarships...</p>
                </div>
              </div>
            ) : isFinished ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-2xl font-bold text-gray-900 mb-4">
                  You've swiped through all scholarships!
                </p>
                <p className="text-gray-600 mb-6">
                  Check your saved scholarships or try different filters.
                </p>
                <button
                  onClick={handleViewLiked}
                  className="btn btn-primary"
                >
                  View Saved Scholarships
                </button>
              </div>
            ) : currentScholarship ? (
              <div className="space-y-6">
                {/* Card Display with Overlay Animation */}
                <div className="relative h-96 overflow-hidden rounded-2xl">
                  {/* Current/Exiting Card */}
                  <div
                    key={`current-${currentScholarship?.id}`}
                    className={`absolute inset-0 bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-2xl transition-all duration-300 ${
                      swipeDirection === 'right'
                        ? 'translate-x-full opacity-0'
                        : swipeDirection === 'left'
                        ? '-translate-x-full opacity-0'
                        : 'translate-x-0 opacity-100'
                    }`}
                  >
                    <ScholarshipSwipeCard scholarship={currentScholarship} />
                  </div>

                  {/* Next/Incoming Card - slides in from opposite direction */}
                  {swipeDirection && scholarships[currentIndex + 1] && (
                    <div
                      key={`next-${scholarships[currentIndex + 1]?.id}`}
                      className={`absolute inset-0 bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-2xl transition-all duration-300 ${
                        swipeDirection === 'right'
                          ? '-translate-x-full opacity-0 to-translate-x-0'
                          : '-translate-x-full to-translate-x-0'
                      }`}
                      style={{
                        transform:
                          swipeDirection === 'right'
                            ? 'translateX(-100%)'
                            : 'translateX(100%)',
                        opacity: 0,
                        animation:
                          swipeDirection === 'right'
                            ? 'slideInFromLeft 300ms ease-out forwards'
                            : 'slideInFromRight 300ms ease-out forwards',
                      }}
                    >
                      <ScholarshipSwipeCard
                        scholarship={scholarships[currentIndex + 1]}
                      />
                    </div>
                  )}

                  <style>{`
                    @keyframes slideInFromLeft {
                      to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideInFromRight {
                      to { transform: translateX(0); opacity: 1; }
                    }
                  `}</style>
                </div>

                {/* Controls */}
                <SwipeControls
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onUndo={handleUndo}
                  onViewLiked={handleViewLiked}
                  likedCount={likedScholarships.length}
                  disabledLike={false}
                  disabledDislike={false}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-lg text-gray-600 mb-4">
                  No scholarships to swipe.
                </p>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or come back later!
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Liked Scholarships Modal */}
      <LikedScholarshipsModal
        isOpen={showLikedModal}
        scholarships={likedScholarships}
        onClose={() => setShowLikedModal(false)}
        onRemove={handleRemoveLiked}
        loading={loadingLiked}
      />
    </div>
  );
};
