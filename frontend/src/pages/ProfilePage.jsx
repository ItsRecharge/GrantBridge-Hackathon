import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Navbar } from '../components/layout/Navbar.jsx';
import { ProfileSection } from '../components/profile/ProfileSection.jsx';
import { DemographicsStep } from '../components/profile/DemographicsStep.jsx';
import { AcademicStep } from '../components/profile/AcademicStep.jsx';
import { FinancialStep } from '../components/profile/FinancialStep.jsx';
import { ExtracurricularsStep } from '../components/profile/ExtracurricularsStep.jsx';
import profileService from '../services/profileService.js';
import toast from 'react-hot-toast';

const getInitialData = () => {
  return {
    full_name: '',
    age: '',
    gender: '',
    ethnicity: [],
    citizenship_status: '',
    gpa_weighted: '',
    gpa_unweighted: '',
    test_type: 'sat',
    sat_score: '',
    act_score: '',
    major: '',
    graduation_year: '',
    current_education_level: '',
    high_school: '',
    family_income: '',
    household_size: '',
    num_dependents: '',
    state: '',
    city: '',
    zip_code: '',
    extracurriculars: [],
    awards: [],
    special_circumstances: {},
  };
};

export const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileData, setProfileData] = useState(getInitialData());
  const [openSections, setOpenSections] = useState({
    demographics: true,
    academic: false,
    financial: false,
    extracurriculars: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          age: profile.age || '',
          gender: profile.gender || '',
          ethnicity: profile.ethnicity || [],
          citizenship_status: profile.citizenship_status || '',
          gpa_weighted: profile.gpa_weighted || '',
          gpa_unweighted: profile.gpa_unweighted || '',
          test_type: profile.sat_score ? 'sat' : 'act',
          sat_score: profile.sat_score || '',
          act_score: profile.act_score || '',
          major: profile.major || '',
          graduation_year: profile.graduation_year || '',
          current_education_level: profile.current_education_level || '',
          high_school: profile.high_school || '',
          family_income: profile.family_income || '',
          household_size: profile.household_size || '',
          num_dependents: profile.num_dependents || '',
          state: profile.state || '',
          city: profile.city || '',
          zip_code: profile.zip_code || '',
          extracurriculars: profile.extracurriculars || [],
          awards: profile.awards || [],
          special_circumstances: profile.special_circumstances || {},
        });
      }
    } catch (error) {
      console.log('No existing profile found');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = useCallback((field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts editing
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Demographics validation
    if (!profileData.age) {
      newErrors.age = 'Age is required';
    } else if (profileData.age < 13) {
      newErrors.age = `Age must be at least 13`;
    } else if (profileData.age > 100) {
      newErrors.age = `Age must be 100 or less`;
    }
    if (!profileData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    if (!profileData.citizenship_status) {
      newErrors.citizenship_status = 'Please select your citizenship status';
    }

    // Academic validation
    const hasWeighted =
      profileData.gpa_weighted !== '' && profileData.gpa_weighted !== undefined;
    const hasUnweighted =
      profileData.gpa_unweighted !== '' && profileData.gpa_unweighted !== undefined;
    if (!hasWeighted && !hasUnweighted) {
      newErrors.gpa_weighted = 'Please enter at least one GPA';
      newErrors.gpa_unweighted = 'Please enter at least one GPA';
    }
    if (hasWeighted && profileData.gpa_weighted < 0) {
      newErrors.gpa_weighted = `GPA cannot be negative`;
    }
    if (hasUnweighted && profileData.gpa_unweighted < 0) {
      newErrors.gpa_unweighted = `GPA cannot be negative`;
    }

    if (
      profileData.test_type === 'sat' &&
      profileData.sat_score &&
      (profileData.sat_score < 400 || profileData.sat_score > 1600)
    ) {
      newErrors.sat_score = `SAT score must be between 400 and 1600`;
    }
    if (
      profileData.test_type === 'act' &&
      profileData.act_score &&
      (profileData.act_score < 1 || profileData.act_score > 36)
    ) {
      newErrors.act_score = `ACT score must be between 1 and 36`;
    }

    if (profileData.graduation_year) {
      if (profileData.graduation_year < 2024) {
        newErrors.graduation_year = `Graduation year must be 2024 or later`;
      } else if (profileData.graduation_year > 2040) {
        newErrors.graduation_year = `Graduation year seems too far in the future`;
      }
    }

    // Financial validation
    if (profileData.household_size && profileData.household_size < 1) {
      newErrors.household_size = `Household size must be at least 1`;
    }
    if (profileData.num_dependents !== '' && profileData.num_dependents < 0) {
      newErrors.num_dependents = `Number of dependents cannot be negative`;
    }
    if (
      profileData.zip_code &&
      !/^\d{5}(-\d{4})?$/.test(profileData.zip_code)
    ) {
      newErrors.zip_code = `Please enter a valid ZIP code`;
    }

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const errorCount = Object.keys(validationErrors).length;
      toast.error(
        `${errorCount} ${errorCount === 1 ? 'error' : 'errors'} found — please fix them before saving`,
        { duration: 4000 }
      );
      return;
    }

    setSaving(true);
    try {
      // Build the payload
      const payload = { ...profileData };
      if (payload.gpa_weighted !== '' && payload.gpa_weighted !== undefined) {
        payload.gpa_weighted = parseFloat(payload.gpa_weighted);
      } else {
        delete payload.gpa_weighted;
      }
      if (payload.gpa_unweighted !== '' && payload.gpa_unweighted !== undefined) {
        payload.gpa_unweighted = parseFloat(payload.gpa_unweighted);
      } else {
        delete payload.gpa_unweighted;
      }
      if (payload.test_type === 'sat') {
        delete payload.act_score;
      } else {
        delete payload.sat_score;
      }
      [
        'age',
        'sat_score',
        'act_score',
        'graduation_year',
        'household_size',
        'num_dependents',
      ].forEach((f) => {
        if (payload[f] === '' || payload[f] === undefined) delete payload[f];
      });
      [
        'full_name',
        'gender',
        'citizenship_status',
        'major',
        'current_education_level',
        'high_school',
        'family_income',
        'state',
        'city',
        'zip_code',
      ].forEach((f) => {
        if (!payload[f]) delete payload[f];
      });
      delete payload.test_type;
      delete payload.gpa;

      await profileService.updateProfile(payload);
      setErrors({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errorMap = {};
        errorData.errors.forEach((e) => {
          errorMap[e.field] = e.message;
        });
        setErrors(errorMap);
        toast.error('Failed to save profile. Please check the errors below.');
      } else {
        toast.error(error.message || 'Failed to save profile');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Update your personal, academic, and financial information to get better
            scholarship and financial aid recommendations.
          </p>
        </div>

        {/* Save Button (Top) */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              '💾 Save Changes'
            )}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            disabled={saving}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>

        {/* Profile Sections */}
        <div className="space-y-4">
          <ProfileSection
            title="Demographics"
            isOpen={openSections.demographics}
            onToggle={() => toggleSection('demographics')}
          >
            <DemographicsStep
              data={profileData}
              errors={errors}
              onChange={handleFieldChange}
            />
          </ProfileSection>

          <ProfileSection
            title="Academic"
            isOpen={openSections.academic}
            onToggle={() => toggleSection('academic')}
          >
            <AcademicStep
              data={profileData}
              errors={errors}
              onChange={handleFieldChange}
            />
          </ProfileSection>

          <ProfileSection
            title="Financial"
            isOpen={openSections.financial}
            onToggle={() => toggleSection('financial')}
          >
            <FinancialStep
              data={profileData}
              errors={errors}
              onChange={handleFieldChange}
            />
          </ProfileSection>

          <ProfileSection
            title="Extracurriculars"
            isOpen={openSections.extracurriculars}
            onToggle={() => toggleSection('extracurriculars')}
          >
            <ExtracurricularsStep
              data={profileData}
              errors={errors}
              onChange={handleFieldChange}
            />
          </ProfileSection>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              '💾 Save Changes'
            )}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            disabled={saving}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
};
