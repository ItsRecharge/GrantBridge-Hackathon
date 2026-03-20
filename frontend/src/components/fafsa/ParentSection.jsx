const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC','PR','GU','VI','AS','MP',
];

const PARENT_MARITAL_STATUSES = [
  'Single (never married)',
  'Unmarried and both legal parents living together',
  'Married (not separated)',
  'Remarried',
  'Separated',
  'Divorced',
  'Widowed',
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

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
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
const SelectInput = ({ value, onChange, options }) => (
  <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="form-input w-full">
    <option value="">Select...</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);
const FieldGroup = ({ title, children }) => (
  <div className="mt-6">
    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3 border-b border-blue-100 pb-1">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);
const MoneyInput = ({ value, onChange, placeholder = '0' }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode="numeric"
      className="form-input w-full pl-6"
    />
  </div>
);

export const ParentSection = ({ data, onChange }) => {
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
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-sm text-amber-800">
        This section is required because you indicated you are a <strong>dependent student</strong>.
        Answer about the parent who provided more financial support in the past 12 months.
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Parent Information</h2>
      <p className="text-sm text-gray-500 mb-4">Questions 30–41 of the FAFSA form</p>

      <FieldGroup title="Q32 — Parent Marital Status">
        <div>
          <Label>Parent's current marital status</Label>
          <SelectInput
            value={data.parent_marital_status}
            onChange={(v) => onChange('parent_marital_status', v)}
            options={PARENT_MARITAL_STATUSES}
          />
          <p className="text-xs text-gray-400 mt-1">
            If "Married", "Remarried", or "Unmarried and both living together", a Parent Spouse/Partner section will appear.
          </p>
        </div>
      </FieldGroup>

      <FieldGroup title="Q30-31 — Parent 1 Identity & Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Parent 1 First Name</Label>
            <TextInput value={data.parent1_first_name} onChange={(v) => onChange('parent1_first_name', v)} placeholder="Mary" />
          </div>
          <div>
            <Label>Parent 1 Last Name</Label>
            <TextInput value={data.parent1_last_name} onChange={(v) => onChange('parent1_last_name', v)} placeholder="Smith" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Parent 1 Date of Birth (MM/DD/YYYY)</Label>
            <TextInput value={data.parent1_date_of_birth} onChange={(v) => onChange('parent1_date_of_birth', v)} placeholder="03/14/1975" />
          </div>
          <div>
            <Label>Parent 1 Social Security Number</Label>
            <TextInput
              value={data.parent1_ssn}
              onChange={(v) => onChange('parent1_ssn', v.replace(/\D/g, '').slice(0, 9))}
              placeholder="123456789"
              type="password"
              inputMode="numeric"
              maxLength={9}
            />
            <p className="text-xs text-gray-400 mt-1">PDF will show last 4 digits only.</p>
          </div>
        </div>
      </FieldGroup>

      <FieldGroup title="Q33 — Parent State of Residence">
        <div>
          <Label>Parent's state of legal residence</Label>
          <SelectInput value={data.parent_state} onChange={(v) => onChange('parent_state', v)} options={US_STATES} />
        </div>
      </FieldGroup>

      <FieldGroup title="Q34-35 — Family Size">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Parent's family / household size (Q34)</Label>
            <TextInput value={data.parent_household_size} onChange={(v) => onChange('parent_household_size', v)} placeholder="4" inputMode="numeric" />
          </div>
          <div>
            <Label>Number in college from parent's family — do not include parents (Q35)</Label>
            <TextInput value={data.parent_num_in_college} onChange={(v) => onChange('parent_num_in_college', v)} placeholder="1" inputMode="numeric" />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup title="Q36 — Federal Benefits Received by Parent's Family (2023–2024)">
        <div className="grid grid-cols-1 gap-1">
          {FEDERAL_BENEFITS.map((item) => (
            <label key={item} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(data.parent_federal_benefits || []).includes(item)}
                onChange={() => toggleArrayItem('parent_federal_benefits', item)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title="Q37-40 — Parent Tax & Financial Information">
        <div>
          <Label>Parent Tax Filing Status (Q37)</Label>
          <SelectInput value={data.parent_tax_filing_status} onChange={(v) => onChange('parent_tax_filing_status', v)} options={TAX_FILING_STATUSES} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Parent Adjusted Gross Income (Q38)</Label>
            <MoneyInput value={data.parent_agi} onChange={(v) => onChange('parent_agi', v)} />
          </div>
          <div>
            <Label>Parent Income Tax Paid (Q38)</Label>
            <MoneyInput value={data.parent_income_tax_paid} onChange={(v) => onChange('parent_income_tax_paid', v)} />
          </div>
        </div>
        <div>
          <Label>Annual Child Support Received by Parent (Q39) — enter 0 if none</Label>
          <MoneyInput value={data.parent_child_support} onChange={(v) => onChange('parent_child_support', v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ['parent_cash_savings', 'Parent Cash / Savings / Checking (Q40)'],
            ['parent_investments', 'Parent Net Worth of Investments (Q40)'],
            ['parent_business_assets', 'Parent Net Worth of Businesses / Farms (Q40)'],
          ].map(([field, label]) => (
            <div key={field}>
              <Label>{label}</Label>
              <MoneyInput value={data[field]} onChange={(v) => onChange(field, v)} />
            </div>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
};
