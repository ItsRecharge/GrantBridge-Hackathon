export const FinancialStep = ({ data, onChange, errors }) => {
  const incomeRanges = [
    '$0 - $20,000',
    '$20,001 - $40,000',
    '$40,001 - $60,000',
    '$60,001 - $80,000',
    '$80,001 - $100,000',
    '$100,001 - $150,000',
    '$150,001 - $200,000',
    '$200,000+',
    'Prefer not to answer',
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Financial Information</h2>

      <div>
        <label className="form-label">Family Income</label>
        <select
          className={`form-input ${errors.family_income ? 'border-red-500' : ''}`}
          value={data.family_income || ''}
          onChange={(e) => onChange('family_income', e.target.value)}
        >
          <option value="">Select income range</option>
          {incomeRanges.map(range => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>
        {errors.family_income && <p className="error-message">{errors.family_income}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Household Size</label>
          <input
            type="number"
            className={`form-input ${errors.household_size ? 'border-red-500' : ''}`}
            placeholder="4"
            min="1"
            value={data.household_size || ''}
            onChange={(e) => onChange('household_size', e.target.value ? parseInt(e.target.value) : '')}
          />
          {errors.household_size && <p className="error-message text-xs">{errors.household_size}</p>}
        </div>

        <div>
          <label className="form-label">Number of Dependents</label>
          <input
            type="number"
            className={`form-input ${errors.num_dependents ? 'border-red-500' : ''}`}
            placeholder="0"
            min="0"
            value={data.num_dependents || ''}
            onChange={(e) => onChange('num_dependents', e.target.value ? parseInt(e.target.value) : '')}
          />
          {errors.num_dependents && <p className="error-message text-xs">{errors.num_dependents}</p>}
        </div>
      </div>

      <div>
        <label className="form-label">State</label>
        <select
          className={`form-input ${errors.state ? 'border-red-500' : ''}`}
          value={data.state || ''}
          onChange={(e) => onChange('state', e.target.value)}
        >
          <option value="">Select state</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errors.state && <p className="error-message">{errors.state}</p>}
      </div>

      <div>
        <label className="form-label">City</label>
        <input
          type="text"
          className={`form-input ${errors.city ? 'border-red-500' : ''}`}
          placeholder="New York"
          value={data.city || ''}
          onChange={(e) => onChange('city', e.target.value)}
        />
        {errors.city && <p className="error-message">{errors.city}</p>}
      </div>

      <div>
        <label className="form-label">ZIP Code</label>
        <input
          type="text"
          className={`form-input ${errors.zip_code ? 'border-red-500' : ''}`}
          placeholder="10001"
          value={data.zip_code || ''}
          onChange={(e) => onChange('zip_code', e.target.value)}
        />
        {errors.zip_code && <p className="error-message">{errors.zip_code}</p>}
      </div>
    </div>
  );
};
