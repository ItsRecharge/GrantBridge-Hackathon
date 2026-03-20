const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC','PR','GU','VI','AS','MP',
];

const CITIZENSHIP_OPTIONS = [
  'U.S. citizen or national',
  'Eligible noncitizen',
  'Neither U.S. citizen nor eligible noncitizen',
];

const EDUCATION_LEVELS = [
  'First year undergraduate (freshman)',
  'Second year undergraduate (sophomore)',
  'Other undergraduate (junior year and beyond)',
  "Master's, doctorate, or graduate certificate program",
];

const MARITAL_STATUSES = [
  'Single (never married)',
  'Married (not separated)',
  'Remarried',
  'Separated',
  'Divorced',
  'Widowed',
];

const GENDERS = ['Male', 'Female', 'Nonbinary', 'Prefer not to answer'];

const ETHNICITIES = [
  'White',
  'Black or African American',
  'Asian',
  'American Indian or Alaska Native',
  'Native Hawaiian or Other Pacific Islander',
  'Hispanic, Latino, or Spanish origin',
  'Prefer not to answer',
];

const FEDERAL_BENEFITS = [
  'Earned income credit (EIC)',
  'Federal housing assistance',
  'Free or reduced-price school lunch',
  'Medicaid',
  'Supplemental Nutrition Assistance Program (SNAP)',
  'Supplemental Security Income (SSI)',
  'Temporary Assistance for Needy Families (TANF)',
  'Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)',
  'Refundable credit for coverage under a qualified health plan (QHP)',
  'None of these apply',
];

const TAX_FILING_STATUSES = [
  'Filed / will file a 2023 IRS Form 1040 or 1040-NR',
  'Filed / will file a tax return with Puerto Rico or a U.S. territory',
  'Filed or will file a foreign tax return',
  'Did not file — income below the threshold',
  'Did not file — no income',
  'Will not file for another reason',
];

const PARENT_EDU_LEVELS = [
  'Neither parent attended college',
  'One or both parents attended but did not complete college',
  'One or both parents completed college',
  "Don't know",
];

// ---- Small helpers ----
const FieldGroup = ({ title, children }) => (
  <div className="mt-6">
    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3 border-b border-blue-100 pb-1">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const TextInput = ({ value, onChange, placeholder, type = 'text', maxLength, inputMode }) => (
  <input
    type={type}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    maxLength={maxLength}
    inputMode={inputMode}
    className="form-input w-full"
  />
);

const SelectInput = ({ value, onChange, options, placeholder = 'Select...' }) => (
  <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="form-input w-full">
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

const ErrorMsg = ({ error }) =>
  error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null;

const PrefilledBadge = () => (
  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
    Pre-filled from profile
  </span>
);

// ---- Main Component ----
export const StudentSection = ({ data, onChange, errors }) => {
  const toggleArrayItem = (field, item) => {
    const current = data[field] || [];
    if (current.includes(item)) {
      onChange(field, current.filter((v) => v !== item));
    } else {
      onChange(field, [...current, item]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Student Information</h2>
      <p className="text-sm text-gray-500 mb-4">Questions 1–24 of the FAFSA form</p>

      {/* Q1 – Identity */}
      <FieldGroup title="Q1 — Student Identity">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label required>First Name</Label>
            <TextInput value={data.first_name} onChange={(v) => onChange('first_name', v)} placeholder="Jane" />
            <ErrorMsg error={errors.first_name} />
          </div>
          <div>
            <Label>Middle Initial</Label>
            <TextInput value={data.middle_initial} onChange={(v) => onChange('middle_initial', v)} placeholder="A" maxLength={1} />
          </div>
          <div>
            <Label required>Last Name</Label>
            <TextInput value={data.last_name} onChange={(v) => onChange('last_name', v)} placeholder="Doe" />
            <ErrorMsg error={errors.last_name} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Date of Birth (MM/DD/YYYY)</Label>
            <TextInput value={data.date_of_birth} onChange={(v) => onChange('date_of_birth', v)} placeholder="01/15/2004" />
            <ErrorMsg error={errors.date_of_birth} />
          </div>
          <div>
            <Label>Social Security Number</Label>
            <TextInput
              value={data.ssn}
              onChange={(v) => onChange('ssn', v.replace(/\D/g, '').slice(0, 9))}
              placeholder="123456789"
              type="password"
              inputMode="numeric"
              maxLength={9}
            />
            <p className="text-xs text-gray-400 mt-1">Stored locally only. PDF will show last 4 digits only.</p>
          </div>
        </div>
      </FieldGroup>

      {/* Q2 – Contact */}
      <FieldGroup title="Q2 — Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Mobile Phone</Label>
            <TextInput value={data.phone} onChange={(v) => onChange('phone', v)} placeholder="(555) 123-4567" />
          </div>
          <div>
            <Label>Email Address</Label>
            <TextInput value={data.email} onChange={(v) => onChange('email', v)} placeholder="jane@email.com" type="email" />
          </div>
        </div>
        <div>
          <Label>Permanent Mailing Address</Label>
          <TextInput value={data.address} onChange={(v) => onChange('address', v)} placeholder="123 Main St, Apt 4" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2">
            <Label>City</Label>
            <TextInput value={data.city} onChange={(v) => onChange('city', v)} placeholder="New York" />
          </div>
          <div>
            <Label>State {data.state && <PrefilledBadge />}</Label>
            <SelectInput value={data.state} onChange={(v) => onChange('state', v)} options={US_STATES} />
          </div>
          <div>
            <Label>ZIP Code</Label>
            <TextInput value={data.zip_code} onChange={(v) => onChange('zip_code', v)} placeholder="10001" maxLength={10} />
          </div>
        </div>
      </FieldGroup>

      {/* Q3-4 – Status */}
      <FieldGroup title="Q3-4 — Marital Status & School Plans">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Current Marital Status</Label>
            <SelectInput value={data.marital_status} onChange={(v) => onChange('marital_status', v)} options={MARITAL_STATUSES} />
            <p className="text-xs text-gray-400 mt-1">Your answer determines whether a spouse section appears.</p>
            <ErrorMsg error={errors.marital_status} />
          </div>
          <div>
            <Label>College Grade Level (2025–26)</Label>
            {data.education_level && <PrefilledBadge />}
            <SelectInput value={data.education_level} onChange={(v) => onChange('education_level', v)} options={EDUCATION_LEVELS} />
          </div>
        </div>
        <div>
          <Label required>Are you a dependent student? (parent info may be required)</Label>
          <div className="flex gap-6 mt-1">
            {['Yes', 'No'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={data.is_dependent === opt}
                  onChange={() => onChange('is_dependent', opt)}
                  className="accent-blue-600"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Generally: born after 2001, single, and first/second-year undergraduate = dependent.
          </p>
          <ErrorMsg error={errors.is_dependent} />
        </div>
      </FieldGroup>

      {/* Q5-8 – Circumstances */}
      <FieldGroup title="Q5-8 — Personal Circumstances">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ['is_active_duty', 'Currently serving on active duty (U.S. armed forces, not training)'],
            ['is_veteran', 'Veteran of the U.S. armed forces'],
            ['is_orphan', 'Orphan or in foster care at any time since age 13'],
            ['is_emancipated', 'Legally emancipated minor (court decision)'],
            ['has_legal_guardianship', 'In legal guardianship (not with parent/stepparent)'],
            ['is_homeless', 'Unaccompanied and homeless or at risk of homelessness (Q6)'],
            ['has_unusual_circumstances', 'Unusual circumstances preventing contact with parents (Q7)'],
            ['direct_unsub_only', "Parents refusing to provide info on FAFSA? (Q8 — limits aid to Direct Unsubsidized Loan only)"],
          ].map(([field, label]) => (
            <label key={field} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!data[field]}
                onChange={(e) => onChange(field, e.target.checked)}
                className="mt-0.5 accent-blue-600"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </FieldGroup>

      {/* Q9-10 – Family numbers */}
      <FieldGroup title="Q9-10 — Family Size">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>
              Household / Family Size {data.household_size && <PrefilledBadge />}
            </Label>
            <TextInput
              value={data.household_size}
              onChange={(v) => onChange('household_size', v)}
              placeholder="4"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label>Number in College (incl. yourself, July 2025–June 2026)</Label>
            <TextInput
              value={data.num_in_college}
              onChange={(v) => onChange('num_in_college', v)}
              placeholder="1"
              inputMode="numeric"
            />
          </div>
        </div>
      </FieldGroup>

      {/* Q11-12 – Demographics */}
      <FieldGroup title="Q11-12 — Demographics (for research only, doesn't affect eligibility)">
        <div>
          <Label>
            Gender {data.gender && <PrefilledBadge />}
          </Label>
          <SelectInput value={data.gender} onChange={(v) => onChange('gender', v)} options={GENDERS} />
        </div>
        <div>
          <Label>
            Race / Ethnicity (select all that apply) {data.ethnicity?.length > 0 && <PrefilledBadge />}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
            {ETHNICITIES.map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.ethnicity || []).includes(item)}
                  onChange={() => toggleArrayItem('ethnicity', item)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </FieldGroup>

      {/* Q13-14 – Citizenship */}
      <FieldGroup title="Q13-14 — Citizenship & Residency">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>
              Citizenship Status {data.citizenship_status && <PrefilledBadge />}
            </Label>
            <SelectInput
              value={data.citizenship_status}
              onChange={(v) => onChange('citizenship_status', v)}
              options={CITIZENSHIP_OPTIONS}
            />
          </div>
          <div>
            <Label>
              State of Legal Residence {data.state && <PrefilledBadge />}
            </Label>
            <SelectInput value={data.state} onChange={(v) => onChange('state', v)} options={US_STATES} />
          </div>
        </div>
      </FieldGroup>

      {/* Q15-16 – Parent background */}
      <FieldGroup title="Q15-16 — Parent Background">
        <div>
          <Label>Did either parent attend or complete college? (Q15)</Label>
          <SelectInput
            value={data.parent_edu_level}
            onChange={(v) => onChange('parent_edu_level', v)}
            options={PARENT_EDU_LEVELS}
          />
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.parent_killed_duty}
            onChange={(e) => onChange('parent_killed_duty', e.target.checked)}
            className="mt-0.5 accent-blue-600"
          />
          <span className="text-sm text-gray-700">
            Q16: Parent or guardian killed in line of duty (active military or public safety officer after Sept. 11, 2001)
          </span>
        </label>
      </FieldGroup>

      {/* Q17 – High School */}
      <FieldGroup title="Q17 — High School Completion">
        <div>
          <Label>
            High School Name {data.high_school && <PrefilledBadge />}
          </Label>
          <TextInput
            value={data.high_school}
            onChange={(v) => onChange('high_school', v)}
            placeholder="Lincoln High School, Springfield, IL"
          />
        </div>
      </FieldGroup>

      {/* Q18 – Federal Benefits */}
      <FieldGroup title="Q18 — Federal Benefits Received (2023 or 2024)">
        <div className="grid grid-cols-1 gap-1">
          {FEDERAL_BENEFITS.map((item) => (
            <label key={item} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(data.federal_benefits || []).includes(item)}
                onChange={() => toggleArrayItem('federal_benefits', item)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </FieldGroup>

      {/* Q19-22 – Tax / Financial */}
      <FieldGroup title="Q19-22 — Tax & Financial Information">
        <div>
          <Label>Tax Filing Status (Q19)</Label>
          <SelectInput
            value={data.tax_filing_status}
            onChange={(v) => onChange('tax_filing_status', v)}
            options={TAX_FILING_STATUSES}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Adjusted Gross Income — AGI (Q20)</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
              <input
                type="text"
                value={data.agi || ''}
                onChange={(e) => onChange('agi', e.target.value)}
                placeholder="45000"
                inputMode="numeric"
                className="form-input w-full pl-6"
              />
            </div>
            {data.family_income_hint && (
              <p className="text-xs text-gray-400 mt-1 italic">
                Profile income range: {data.family_income_hint}
              </p>
            )}
          </div>
          <div>
            <Label>Income Tax Paid (Q20)</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
              <input
                type="text"
                value={data.income_tax_paid || ''}
                onChange={(e) => onChange('income_tax_paid', e.target.value)}
                placeholder="3500"
                inputMode="numeric"
                className="form-input w-full pl-6"
              />
            </div>
          </div>
        </div>
        <div>
          <Label>Annual Child Support Received (Q21) — enter 0 if none</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
            <input
              type="text"
              value={data.child_support_received || ''}
              onChange={(e) => onChange('child_support_received', e.target.value)}
              placeholder="0"
              inputMode="numeric"
              className="form-input w-full pl-6"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ['student_cash_savings', 'Cash / Savings / Checking (Q22)'],
            ['student_investments', 'Net Worth of Investments (Q22)'],
            ['student_business_assets', 'Net Worth of Businesses / Farms (Q22)'],
          ].map(([field, label]) => (
            <div key={field}>
              <Label>{label}</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                <input
                  type="text"
                  value={data[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  placeholder="0"
                  inputMode="numeric"
                  className="form-input w-full pl-6"
                />
              </div>
            </div>
          ))}
        </div>
      </FieldGroup>

      {/* Q23 – Colleges */}
      <FieldGroup title="Q23 — Colleges to Receive FAFSA Information">
        <div>
          <Label>List colleges (one per line, up to 10)</Label>
          <textarea
            value={data.colleges_list || ''}
            onChange={(e) => onChange('colleges_list', e.target.value)}
            placeholder="University of Michigan&#10;Ohio State University"
            rows={4}
            className="form-input w-full"
          />
        </div>
      </FieldGroup>

      {/* Q24 – Signature */}
      <FieldGroup title="Q24 — Consent & Signature">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs text-gray-500 leading-relaxed">
          By checking the box below you confirm that you will use federal and/or state student financial aid only to pay
          the cost of attending an institution of higher education, that you are not in default on a federal student loan,
          and that all information provided is true and complete. You consent to the disclosure of your federal tax
          information as described on the FAFSA form.
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={!!data.agreed_to_signature}
            onChange={(e) => onChange('agreed_to_signature', e.target.checked)}
            className="accent-blue-600 w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">
            I certify that the information I provide is true and correct, and I consent to the terms above.
          </span>
        </label>
        <ErrorMsg error={errors.agreed_to_signature} />
      </FieldGroup>

      {/* Preparer toggle */}
      <FieldGroup title="Optional — Preparer">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.include_preparer}
            onChange={(e) => onChange('include_preparer', e.target.checked)}
            className="accent-blue-600"
          />
          <span className="text-sm text-gray-700">
            I am using a preparer (not paid) to assist with this FAFSA. Add a Preparer section.
          </span>
        </label>
      </FieldGroup>
    </div>
  );
};
