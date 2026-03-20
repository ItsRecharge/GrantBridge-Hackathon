import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { CollegeSearchBar } from '../components/college/CollegeSearchBar.jsx';
import { CollegeList } from '../components/college/CollegeList.jsx';
import { MyCollegesList } from '../components/college/MyCollegesList.jsx';
import collegeService from '../services/collegeService.js';
import toast from 'react-hot-toast';

export const CollegePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [colleges, setColleges] = useState([]);
  const [userColleges, setUserColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUserColleges, setLoadingUserColleges] = useState(true);
  const [estimating, setEstimating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Load user's college list on mount
  useEffect(() => {
    loadUserColleges();
  }, []);

  const loadUserColleges = async () => {
    try {
      const colleges = await collegeService.getUserColleges();
      setUserColleges(colleges);
    } catch (error) {
      console.log('No user colleges found');
    } finally {
      setLoadingUserColleges(false);
    }
  };

  const collegesInList = userColleges.map((item) => item.college_id);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      toast('Please enter a college name');
      return;
    }

    setSearchQuery(query);
    setLoading(true);
    setCurrentPage(1);

    try {
      const result = await collegeService.searchColleges(
        query,
        undefined,
        undefined,
        1,
        10
      );
      setColleges(result.colleges);
      setTotalResults(result.total);
      setTotalPages(result.pages);

      if (result.message) {
        toast.success(result.message);
      } else if (result.colleges.length === 0) {
        toast('No colleges found. Try a different name.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to search colleges');
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (collegeId) => {
    try {
      await collegeService.addCollegeToList(collegeId);
      await loadUserColleges();
      toast.success('College added to your list!');
    } catch (error) {
      if (error.response?.status === 409) {
        toast('College already in your list');
      } else {
        toast.error('Failed to add college');
      }
    }
  };

  const handleRemoveFromList = async (collegeId) => {
    try {
      await collegeService.removeCollegeFromList(collegeId);
      await loadUserColleges();
      toast.success('College removed from your list');
    } catch (error) {
      toast.error('Failed to remove college');
    }
  };

  const handleEstimate = async (collegeName) => {
    // Find the college ID from the colleges list
    const college = colleges.find((c) => c.name === collegeName);
    if (!college) {
      toast.error('College not found');
      return;
    }

    setEstimating(college.id);
    try {
      toast.success('Generating financial aid estimate...');
      // Navigate to report page - it will generate the AI analysis
      navigate(`/colleges/${college.id}/report`);
    } catch (error) {
      toast.error(error.message || 'Failed to estimate financial aid');
    } finally {
      setEstimating(null);
    }
  };

  const handlePageChange = async (newPage) => {
    setLoading(true);
    try {
      const result = await collegeService.searchColleges(
        searchQuery,
        undefined,
        undefined,
        newPage,
        10
      );
      setColleges(result.colleges);
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollegeSearchBar
          onSearch={handleSearch}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <CollegeList
              colleges={colleges}
              loading={loading}
              collegesInList={collegesInList}
              onAddToList={handleAddToList}
              onRemoveFromList={handleRemoveFromList}
              onEstimate={handleEstimate}
              estimatingCollege={estimating}
              totalResults={totalResults}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Sidebar */}
          <div>
            <MyCollegesList
              userColleges={userColleges}
              onRemove={handleRemoveFromList}
              loading={loadingUserColleges}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
