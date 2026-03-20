import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Login } from './components/auth/Login.jsx';
import { Signup } from './components/auth/Signup.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { CollegePage } from './pages/CollegePage.jsx';
import { ScholarshipPage } from './pages/ScholarshipPage.jsx';
import { ScholarshipSwipePage } from './pages/ScholarshipSwipePage.jsx';
import { SavedScholarshipsPage } from './pages/SavedScholarshipsPage.jsx';
import { FinancialAidReportPage } from './pages/FinancialAidReportPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { ProfileSetup } from './components/profile/ProfileSetup.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { FAFSAHelperPage } from './pages/FAFSAHelperPage.jsx';
import { ScholarshipChatbot } from './components/chat/ScholarshipChatbot.jsx';
import { EducationPage } from './pages/EducationPage.jsx';
import { EducationArticlePage } from './pages/EducationArticlePage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/education"
              element={
                <ProtectedRoute>
                  <EducationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/education/:articleId"
              element={
                <ProtectedRoute>
                  <EducationArticlePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scholarships"
              element={
                <ProtectedRoute>
                  <ScholarshipSwipePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved-scholarships"
              element={
                <ProtectedRoute>
                  <SavedScholarshipsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/scholarships/browse"
              element={
                <ProtectedRoute>
                  <ScholarshipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colleges"
              element={
                <ProtectedRoute>
                  <CollegePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/colleges/:collegeId/report"
              element={
                <ProtectedRoute>
                  <FinancialAidReportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/fafsa-helper"
              element={
                <ProtectedRoute>
                  <FAFSAHelperPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ScholarshipChatbot />
          <Toaster position="top-right" />
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
