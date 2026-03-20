import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Navbar } from '../components/layout/Navbar.jsx';
import profileService from '../services/profileService.js';
import { UserCircle, GraduationCap, Building2, CalendarDays, AlertTriangle, BookOpen } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        setProfile(profile);
      } catch (error) {
        console.log('No profile found');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container py-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Welcome back, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
              </h2>
              {!profile ? (
                <p className="text-gray-500 text-sm">
                  Complete your profile to unlock scholarship matches and financial aid estimates.
                </p>
              ) : (
                <p className="text-green-600 text-sm font-medium">
                  Profile complete — your personalized tools are ready below.
                </p>
              )}
            </div>

            {/* FAFSA Banner */}
            <div
              onClick={() => navigate('/fafsa-helper')}
              className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md cursor-pointer hover:shadow-lg hover:brightness-105 transition-all"
            >
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1">Ready to apply for federal student aid?</h3>
                <p className="text-blue-100 text-sm">
                  Use our FAFSA Helper to walk through every question with your profile pre-filled — then download your personalized Answer Sheet.
                </p>
              </div>
              <span className="flex-shrink-0 bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-lg whitespace-nowrap">
                Fill out FAFSA →
              </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!profile ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="text-left rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none group"
                >
                  <AlertTriangle className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Enter your academic record, household finances, and personal background. Your profile powers every tool on this platform — the more complete it is, the better your matches will be.
                  </p>
                  <div className="mt-5 text-yellow-700 font-semibold text-sm group-hover:underline">
                    Set up profile →
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profile')}
                  className="text-left rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none group"
                >
                  <UserCircle className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your Profile</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Review and update your personal, academic, and financial information. Keeping your profile current ensures all scholarship matches and aid estimates stay accurate.
                  </p>
                  <div className="mt-5 text-blue-600 font-semibold text-sm group-hover:underline">
                    Edit profile →
                  </div>
                </button>
              )}

              <button
                onClick={() => navigate('/scholarships')}
                className="text-left rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none group"
              >
                <GraduationCap className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Find Scholarships</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Browse scholarships tailored to your GPA, background, and interests. Swipe through recommendations, save the ones you like, and track deadlines so you never miss an opportunity.
                </p>
                <div className="mt-5 text-blue-600 font-semibold text-sm group-hover:underline">
                  Browse scholarships →
                </div>
              </button>

              <button
                onClick={() => navigate('/colleges')}
                className="text-left rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none group"
              >
                <Building2 className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Aid Estimates</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Search any college and get a personalized estimate of the grants, loans, and work-study you may receive. Compare costs across schools to make a more informed enrollment decision.
                </p>
                <div className="mt-5 text-blue-600 font-semibold text-sm group-hover:underline">
                  Search colleges →
                </div>
              </button>

              <button
                onClick={() => navigate('/saved-scholarships')}
                className="text-left rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none group"
              >
                <CalendarDays className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Scholarship Calendar</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  See all your saved scholarships laid out on a deadline calendar. Stay organized, prioritize applications by due date, and make sure nothing slips through the cracks.
                </p>
                <div className="mt-5 text-blue-600 font-semibold text-sm group-hover:underline">
                  View calendar →
                </div>
              </button>

              <button
                onClick={() => navigate('/education')}
                className="text-left rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none group md:col-span-2"
              >
                <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Education & Planning Library</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Open a curated list of guides on FAFSA, grants, loans, ROTC, jobs, and scholarship strategy so you can stay financially ready for college.
                </p>
                <div className="mt-5 text-blue-600 font-semibold text-sm group-hover:underline">
                  Explore resources →
                </div>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
