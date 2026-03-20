import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import profileService from '../../services/profileService.js';
import toast from 'react-hot-toast';
import { DemographicsStep } from './DemographicsStep.jsx';
import { AcademicStep } from './AcademicStep.jsx';
import { FinancialStep } from './FinancialStep.jsx';
import { ExtracurricularsStep } from './ExtracurricularsStep.jsx';
import { SelfDescriptionStep } from './SelfDescriptionStep.jsx';

const STEPS = [
  { id: 0, name: 'Demographics', label: 'Demographics' },
  { id: 1, name: 'Academic', label: 'Academic' },
  { id: 2, name: 'Financial', label: 'Financial' },
  { id: 3, name: 'Extracurriculars', label: 'Activities' },
  { id: 4, name: 'AboutYou', label: 'About You' },
];

const STORAGE_KEY = 'divergent_profile_draft';
const STEP_KEY = 'divergent_profile_step';

const getInitialData = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore parse errors */ }
  return {
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
    self_description: '',
  };
};

const getInitialStep = () => {
  try {
    const saved = sessionStorage.getItem(STEP_KEY);
    if (saved) return parseInt(saved, 10) || 0;
  } catch (e) { /* ignore */ }
  return 0;
};

export const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileData, setProfileData] = useState(getInitialData);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Persist form data to sessionStorage so idle/refresh doesn't lose progress
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    sessionStorage.setItem(STEP_KEY, String(currentStep));
  }, [currentStep]);

  const handleFieldChange = useCallback((field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts editing
    setErrors(prev => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0: // Demographics
        if (!profileData.age) {
          newErrors.age = 'Age is required';
        } else if (profileData.age < 13) {
          newErrors.age = `You entered ${profileData.age} — age must be at least 13`;
        } else if (profileData.age > 100) {
          newErrors.age = `You entered ${profileData.age} — age must be 100 or less`;
        }
        if (!profileData.gender) {
          newErrors.gender = 'Please select your gender';
        }
        if (!profileData.citizenship_status) {
          newErrors.citizenship_status = 'Please select your citizenship status';
        }
        break;

      case 1: { // Academic
        const hasWeighted = profileData.gpa_weighted !== '' && profileData.gpa_weighted !== undefined;
        const hasUnweighted = profileData.gpa_unweighted !== '' && profileData.gpa_unweighted !== undefined;
        if (!hasWeighted && !hasUnweighted) {
          newErrors.gpa_weighted = 'Please enter at least one GPA (weighted or unweighted)';
          newErrors.gpa_unweighted = 'Please enter at least one GPA (weighted or unweighted)';
        }
        if (hasWeighted && profileData.gpa_weighted < 0) {
          newErrors.gpa_weighted = `GPA cannot be negative (you entered ${profileData.gpa_weighted})`;
        }
        if (hasUnweighted && profileData.gpa_unweighted < 0) {
          newErrors.gpa_unweighted = `GPA cannot be negative (you entered ${profileData.gpa_unweighted})`;
        }

        if (profileData.test_type === 'sat') {
          if (profileData.sat_score && (profileData.sat_score < 400 || profileData.sat_score > 1600)) {
            newErrors.sat_score = `SAT score must be between 400 and 1600 (you entered ${profileData.sat_score})`;
          }
        } else if (profileData.test_type === 'act') {
          if (profileData.act_score && (profileData.act_score < 1 || profileData.act_score > 36)) {
            newErrors.act_score = `ACT score must be between 1 and 36 (you entered ${profileData.act_score})`;
          }
        }

        if (profileData.graduation_year) {
          if (profileData.graduation_year < 2024) {
            newErrors.graduation_year = `Graduation year must be 2024 or later (you entered ${profileData.graduation_year})`;
          } else if (profileData.graduation_year > 2040) {
            newErrors.graduation_year = `Graduation year seems too far in the future (you entered ${profileData.graduation_year})`;
          }
        }
        break;
      }

      case 2: // Financial
        if (profileData.household_size && profileData.household_size < 1) {
          newErrors.household_size = `Household size must be at least 1 (you entered ${profileData.household_size})`;
        }
        if (profileData.num_dependents !== '' && profileData.num_dependents < 0) {
          newErrors.num_dependents = `Number of dependents cannot be negative (you entered ${profileData.num_dependents})`;
        }
        if (profileData.zip_code && !/^\d{5}(-\d{4})?$/.test(profileData.zip_code)) {
          newErrors.zip_code = `Please enter a valid ZIP code (e.g., 10001 or 10001-1234). You entered "${profileData.zip_code}"`;
        }
        break;

      case 3: // Extracurriculars — no required fields
        break;

      case 4: // About You — all optional
        break;
    }

    return newErrors;
  };

  const handleNext = async () => {
    const stepErrors = validateCurrentStep();

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      const errorCount = Object.keys(stepErrors).length;
      toast.error(
        `${errorCount} ${errorCount === 1 ? 'error' : 'errors'} found — please fix ${errorCount === 1 ? 'it' : 'them'} before continuing`,
        { duration: 4000 }
      );
      return;
    }

    setErrors({});

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrev = () => {
    setErrors({});
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Build the payload, mapping GPA fields for the backend
      const payload = { ...profileData };
      // Send whichever GPA(s) we have
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
      // Only send the selected test score
      if (payload.test_type === 'sat') {
        delete payload.act_score;
      } else {
        delete payload.sat_score;
      }
      // Remove empty string numeric fields
      ['age', 'sat_score', 'act_score', 'graduation_year', 'household_size', 'num_dependents'].forEach(f => {
        if (payload[f] === '' || payload[f] === undefined) delete payload[f];
      });
      // Remove empty string fields
      ['gender', 'citizenship_status', 'major', 'current_education_level', 'high_school',
       'family_income', 'state', 'city', 'zip_code'].forEach(f => {
        if (!payload[f]) delete payload[f];
      });
      // Remove empty self_description
      if (!payload.self_description) delete payload.self_description;
      // Clean up UI-only fields
      delete payload.test_type;
      // Remove legacy gpa field
      delete payload.gpa;

      const result = await profileService.createProfile(payload);
      // Clear saved draft on success
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STEP_KEY);
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const errorData = error.response?.data;

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errorMap = {};
        const errorMessages = [];
        errorData.errors.forEach(e => {
          errorMap[e.field] = e.message;
          errorMessages.push(`${e.field}: ${e.message}`);
        });
        setErrors(errorMap);

        // Navigate to the step that contains the first error
        const firstErrorField = errorData.errors[0]?.field;
        const stepForField = getStepForField(firstErrorField);
        if (stepForField !== currentStep) {
          setCurrentStep(stepForField);
        }

        toast.error(
          `${errorData.errors.length} validation ${errorData.errors.length === 1 ? 'error' : 'errors'}:\n${errorMessages.join('\n')}`,
          { duration: 6000 }
        );
      } else if (!error.response) {
        toast.error(
          'Could not connect to the server. Please check your connection and try again.',
          { duration: 5000 }
        );
      } else if (error.response?.status === 409) {
        toast.error(
          'A profile already exists for this account. Redirecting to dashboard...',
          { duration: 4000 }
        );
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        toast.error(
          errorData?.message || error.friendlyMessage || 'Failed to save profile. Please try again.',
          { duration: 5000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepForField = (field) => {
    const stepFields = {
      0: ['age', 'gender', 'ethnicity', 'citizenship_status'],
      1: ['gpa_weighted', 'gpa_unweighted', 'sat_score', 'act_score', 'major', 'graduation_year', 'current_education_level', 'high_school'],
      2: ['family_income', 'household_size', 'num_dependents', 'state', 'city', 'zip_code'],
      3: ['extracurriculars', 'awards', 'special_circumstances'],
      4: ['self_description'],
    };
    for (const [step, fields] of Object.entries(stepFields)) {
      if (fields.includes(field)) return parseInt(step, 10);
    }
    return currentStep;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DemographicsStep data={profileData} onChange={handleFieldChange} errors={errors} />;
      case 1:
        return <AcademicStep data={profileData} onChange={handleFieldChange} errors={errors} />;
      case 2:
        return <FinancialStep data={profileData} onChange={handleFieldChange} errors={errors} />;
      case 3:
        return <ExtracurricularsStep data={profileData} onChange={handleFieldChange} errors={errors} />;
      case 4:
        return <SelfDescriptionStep data={profileData} onChange={handleFieldChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-black-600">GrantBridge</h1>
          <span className="text-gray-600">{user?.email}</span>
        </div>
      </nav>

      <main className="container py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {STEPS.map(step => (
              <span key={step.id}>{step.label}</span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          {/* Error Summary — shown inline on the current step */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg" role="alert">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-sm font-semibold text-red-800">
                  {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'error' : 'errors'} on this step
                </h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1 ml-7">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="flex items-start gap-1">
                    <span className="text-red-400 mt-0.5">→</span>
                    <span><strong className="capitalize">{field.replace(/_/g, ' ')}:</strong> {message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {renderStep()}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0 || loading}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>

          {/* Step Counter */}
          <div className="text-center mt-4 text-gray-600 text-sm">
            Step {currentStep + 1} of {STEPS.length}
          </div>
        </div>
      </main>
    </div>
  );
};
