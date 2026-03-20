const Label = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);
const TextInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="form-input w-full"
  />
);
const FieldGroup = ({ title, children }) => (
  <div className="mt-6">
    <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3 border-b border-blue-100 pb-1">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

export const PreparerSection = ({ data, onChange }) => (
  <div>
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-sm text-gray-700">
      Complete this section only if someone other than the student, student spouse, parent, or parent spouse/partner filled out this form.
      <strong className="block mt-1 text-red-600">Note: Paid preparers are prohibited by federal law.</strong>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-1">Preparer</h2>
    <p className="text-sm text-gray-500 mb-4">Questions 47–49 of the FAFSA form</p>

    <FieldGroup title="Q47 — Preparer Identity">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Preparer First Name</Label>
          <TextInput value={data.preparer_first_name} onChange={(v) => onChange('preparer_first_name', v)} placeholder="Alex" />
        </div>
        <div>
          <Label>Preparer Last Name</Label>
          <TextInput value={data.preparer_last_name} onChange={(v) => onChange('preparer_last_name', v)} placeholder="Johnson" />
        </div>
      </div>
    </FieldGroup>

    <FieldGroup title="Q48 — Preparer Contact">
      <div>
        <Label>Affiliation / Organization</Label>
        <TextInput value={data.preparer_firm} onChange={(v) => onChange('preparer_firm', v)} placeholder="Lincoln High School Counseling Office" />
      </div>
      <div>
        <Label>Mailing Address</Label>
        <TextInput value={data.preparer_address} onChange={(v) => onChange('preparer_address', v)} placeholder="123 School St, Springfield, IL 62701" />
      </div>
      <div>
        <Label>Phone Number</Label>
        <TextInput value={data.preparer_phone} onChange={(v) => onChange('preparer_phone', v)} placeholder="(555) 987-6543" />
      </div>
    </FieldGroup>
  </div>
);
