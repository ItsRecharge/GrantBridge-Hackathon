import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import profileService from '../services/profileService.js';
import { StudentSection } from '../components/fafsa/StudentSection.jsx';
import { StudentSpouseSection } from '../components/fafsa/StudentSpouseSection.jsx';
import { ParentSection } from '../components/fafsa/ParentSection.jsx';
import { ParentSpouseSection } from '../components/fafsa/ParentSpouseSection.jsx';
import { PreparerSection } from '../components/fafsa/PreparerSection.jsx';
import { fillFAFSAPDF } from '../components/fafsa/FAFSAActualPDFFiller.js';
import toast from 'react-hot-toast';

const getInitialData = () => ({
  // Q1
  first_name: '',
  middle_initial: '',
  last_name: '',
  date_of_birth: '',
  ssn: '',
  // Q2
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  // Q3-4
  marital_status: '',
  education_level: '',
  is_dependent: '',
  // Q5-8
  is_active_duty: false,
  is_veteran: false,
  is_orphan: false,
  is_emancipated: false,
  has_legal_guardianship: false,
  is_homeless: false,
  has_unusual_circumstances: false,
  direct_unsub_only: false,
  // Q9-10
  household_size: '',
  num_in_college: '',
  // Q11-12
  gender: '',
  ethnicity: [],
  // Q13-14
  citizenship_status: '',
  // Q15-16
  parent_edu_level: '',
  parent_killed_duty: false,
  // Q17
  high_school: '',
  // Q18
  federal_benefits: [],
  // Q19-22
  tax_filing_status: '',
  agi: '',
  income_tax_paid: '',
  child_support_received: '',
  family_income_hint: '',
  student_cash_savings: '',
  student_investments: '',
  student_business_assets: '',
  // Q23-24
  colleges_list: '',
  agreed_to_signature: false,
  include_preparer: false,
  // Spouse (Q25-29)
  spouse_first_name: '',
  spouse_last_name: '',
  spouse_date_of_birth: '',
  spouse_ssn: '',
  spouse_tax_filing: '',
  spouse_agi: '',
  spouse_income_tax_paid: '',
  // Parent (Q30-41)
  parent_marital_status: '',
  parent1_first_name: '',
  parent1_last_name: '',
  parent1_date_of_birth: '',
  parent1_ssn: '',
  parent_state: '',
  parent_household_size: '',
  parent_num_in_college: '',
  parent_federal_benefits: [],
  parent_tax_filing_status: '',
  parent_agi: '',
  parent_income_tax_paid: '',
  parent_child_support: '',
  parent_cash_savings: '',
  parent_investments: '',
  parent_business_assets: '',
  // Parent Spouse (Q42-46)
  parent2_first_name: '',
  parent2_last_name: '',
  parent2_date_of_birth: '',
  parent2_ssn: '',
  parent2_tax_filing: '',
  parent2_agi: '',
  parent2_income_tax_paid: '',
  // Preparer (Q47-49)
  preparer_first_name: '',
  preparer_last_name: '',
  preparer_firm: '',
  preparer_address: '',
  preparer_phone: '',
});

const mapProfileToFAFSA = (profile) => ({
  city: profile.city || '',
  state: profile.state || '',
  zip_code: profile.zip_code || '',
  gender: profile.gender || '',
  ethnicity: Array.isArray(profile.ethnicity) ? profile.ethnicity : [],
  citizenship_status: profile.citizenship_status || '',
  household_size: profile.household_size ? String(profile.household_size) : '',
  high_school: profile.high_school || '',
  education_level: profile.current_education_level || '',
  family_income_hint: profile.family_income || '',
});

const computeActiveSteps = (data) => {
  const steps = [
    { id: 'student', label: 'Student', sublabel: 'Q1–24', component: StudentSection },
  ];
  if (['Married (not separated)', 'Remarried'].includes(data.marital_status)) {
    steps.push({ id: 'spouse', label: 'Student Spouse', sublabel: 'Q25–29', component: StudentSpouseSection });
  }
  if (data.is_dependent === 'Yes') {
    steps.push({ id: 'parent', label: 'Parent', sublabel: 'Q30–41', component: ParentSection });
    if (
      ['Married (not separated)', 'Remarried', 'Unmarried and both legal parents living together'].includes(
        data.parent_marital_status
      )
    ) {
      steps.push({
        id: 'parent_spouse',
        label: 'Parent Spouse',
        sublabel: 'Q42–46',
        component: ParentSpouseSection,
      });
    }
  }
  if (data.include_preparer) {
    steps.push({ id: 'preparer', label: 'Preparer', sublabel: 'Q47–49', component: PreparerSection });
  }
  return steps;
};

export const FAFSAHelperPage = () => {
  const [fafsaData, setFafsaData] = useState(getInitialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    profileService
      .getProfile()
      .then((profile) => {
        if (profile) {
          setFafsaData((prev) => ({ ...prev, ...mapProfileToFAFSA(profile) }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const activeSteps = computeActiveSteps(fafsaData);

  const handleFieldChange = useCallback(
    (field, value) => {
      setFafsaData((prev) => {
        const updated = { ...prev, [field]: value };
        const newSteps = computeActiveSteps(updated);
        if (currentStep >= newSteps.length) {
          setCurrentStep(newSteps.length - 1);
        }
        return updated;
      });
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [currentStep]
  );

  const validateCurrentStep = () => {
    if (activeSteps[currentStep]?.id !== 'student') return true;
    const errs = {};
    if (!fafsaData.agreed_to_signature) {
      errs.agreed_to_signature = 'You must acknowledge consent before downloading.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!validateCurrentStep()) return;
      setGenerating(true);
      try {
        await fillFAFSAPDF(fafsaData);
        toast.success('Filled FAFSA PDF downloaded!');
      } catch {
        toast.error('Failed to generate PDF. Please try again.');
      } finally {
        setGenerating(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const CurrentComponent = activeSteps[currentStep].component;
  const isLastStep = currentStep === activeSteps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        {/* Page header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-3 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">FAFSA Helper</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Complete each section below. At the end, download a personalized Answer Sheet to reference while
            filling out the real form at{' '}
            <span className="text-blue-600 font-medium">fafsa.gov</span>.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {activeSteps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span
                    className={`mt-1 text-xs font-medium ${
                      index === currentStep ? 'text-blue-700' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-400">{step.sublabel}</span>
                </div>
                {index < activeSteps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-16 mx-2 flex-shrink-0 transition-colors ${
                      index < currentStep ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 max-w-3xl mx-auto">
          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">Please fix the following:</p>
              <ul className="list-disc pl-5">
                {Object.values(errors).map((msg, i) => (
                  <li key={i} className="text-sm text-red-600">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CurrentComponent data={fafsaData} onChange={handleFieldChange} errors={errors} />

          {/* Navigation buttons */}
          <div className="mt-10 flex items-center justify-between border-t pt-6">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="btn btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {activeSteps.length}
            </span>

            <button
              onClick={handleNext}
              disabled={generating}
              className="btn btn-primary disabled:opacity-70"
            >
              {generating
                ? 'Generating...'
                : isLastStep
                ? '⬇ Download Filled FAFSA'
                : 'Next →'}
            </button>
          </div>
        </div>

        {/* Info footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Your data is stored only in your browser and never sent to our servers via this form.
          After downloading, complete the official FAFSA at fafsa.gov.
        </p>
      </main>
    </div>
  );
};
