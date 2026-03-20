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

export const StudentSpouseSection = ({ data, onChange }) => (
  <div>
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-sm text-blue-800">
      This section is required because you indicated your marital status is <strong>{data.marital_status}</strong>.
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-1">Student Spouse</h2>
    <p className="text-sm text-gray-500 mb-4">Questions 25–29 of the FAFSA form</p>

    <FieldGroup title="Q25 — Spouse Identity">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Spouse First Name</Label>
          <TextInput value={data.spouse_first_name} onChange={(v) => onChange('spouse_first_name', v)} placeholder="John" />
        </div>
        <div>
          <Label>Spouse Last Name</Label>
          <TextInput value={data.spouse_last_name} onChange={(v) => onChange('spouse_last_name', v)} placeholder="Doe" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Spouse Date of Birth (MM/DD/YYYY)</Label>
          <TextInput value={data.spouse_date_of_birth} onChange={(v) => onChange('spouse_date_of_birth', v)} placeholder="06/20/2002" />
        </div>
        <div>
          <Label>Spouse Social Security Number</Label>
          <TextInput
            value={data.spouse_ssn}
            onChange={(v) => onChange('spouse_ssn', v.replace(/\D/g, '').slice(0, 9))}
            placeholder="123456789"
            type="password"
            inputMode="numeric"
            maxLength={9}
          />
          <p className="text-xs text-gray-400 mt-1">PDF will show last 4 digits only.</p>
        </div>
      </div>
    </FieldGroup>

    <FieldGroup title="Q27-28 — Spouse Tax Information">
      <div>
        <Label>Spouse Tax Filing Status (Q27)</Label>
        <SelectInput value={data.spouse_tax_filing} onChange={(v) => onChange('spouse_tax_filing', v)} options={TAX_FILING_STATUSES} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Spouse Adjusted Gross Income (Q28)</Label>
          <MoneyInput value={data.spouse_agi} onChange={(v) => onChange('spouse_agi', v)} />
        </div>
        <div>
          <Label>Spouse Income Tax Paid (Q28)</Label>
          <MoneyInput value={data.spouse_income_tax_paid} onChange={(v) => onChange('spouse_income_tax_paid', v)} />
        </div>
      </div>
    </FieldGroup>
  </div>
);
