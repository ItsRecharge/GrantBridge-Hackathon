export const DemographicsStep = ({ data, onChange, errors }) => {
  const ethnicities = [
    'White',
    'Black or African American',
    'Hispanic or Latino',
    'Asian',
    'Native American or Alaska Native',
    'Native Hawaiian or Pacific Islander',
    'Two or more races',
    'Prefer not to answer',
  ];

  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to answer'];
  const citizenships = [
    'US Citizen',
    'Permanent Resident',
    'DACA',
    'International Student',
    'Other',
  ];

  const handleEthnicityToggle = (ethnicity) => {
    const current = data.ethnicity || [];
    const updated = current.includes(ethnicity)
      ? current.filter(e => e !== ethnicity)
      : [...current, ethnicity];
    onChange('ethnicity', updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Demographics</h2>

      <div>
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className={`form-input ${errors.full_name ? 'border-red-500' : ''}`}
          placeholder="Jane Doe"
          value={data.full_name || ''}
          onChange={(e) => onChange('full_name', e.target.value)}
        />
        {errors.full_name && <p className="error-message">{errors.full_name}</p>}
      </div>

      <div>
        <label className="form-label">Age</label>
        <input
          type="number"
          className={`form-input ${errors.age ? 'border-red-500' : ''}`}
          placeholder="18"
          min="13"
          max="100"
          value={data.age || ''}
          onChange={(e) => onChange('age', e.target.value ? parseInt(e.target.value) : '')}
        />
        {errors.age && <p className="error-message">{errors.age}</p>}
      </div>

      <div>
        <label className="form-label">Gender</label>
        <select
          className={`form-input ${errors.gender ? 'border-red-500' : ''}`}
          value={data.gender || ''}
          onChange={(e) => onChange('gender', e.target.value)}
        >
          <option value="">Select gender</option>
          {genders.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        {errors.gender && <p className="error-message">{errors.gender}</p>}
      </div>

      <div>
        <label className="form-label">Ethnicity (select all that apply)</label>
        <div className="space-y-2">
          {ethnicities.map(e => (
            <label key={e} className="flex items-center">
              <input
                type="checkbox"
                checked={(data.ethnicity || []).includes(e)}
                onChange={() => handleEthnicityToggle(e)}
                className="mr-3"
              />
              <span>{e}</span>
            </label>
          ))}
        </div>
        {errors.ethnicity && <p className="error-message">{errors.ethnicity}</p>}
      </div>

      <div>
        <label className="form-label">Citizenship Status</label>
        <select
          className={`form-input ${errors.citizenship_status ? 'border-red-500' : ''}`}
          value={data.citizenship_status || ''}
          onChange={(e) => onChange('citizenship_status', e.target.value)}
        >
          <option value="">Select citizenship status</option>
          {citizenships.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.citizenship_status && <p className="error-message">{errors.citizenship_status}</p>}
      </div>
    </div>
  );
};
