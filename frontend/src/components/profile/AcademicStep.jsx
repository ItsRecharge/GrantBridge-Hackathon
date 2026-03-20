export const AcademicStep = ({ data, onChange, errors }) => {
  const educationLevels = [
    'High School Student',
    'High School Graduate',
    'Some College',
    'Associate Degree',
    'Bachelor Degree',
    'Graduate Student',
  ];

  const majors = [
    'Engineering',
    'Computer Science',
    'Business',
    'Healthcare',
    'STEM',
    'Humanities',
    'Arts',
    'Social Sciences',
    'Other',
  ];

  const testType = data.test_type || 'sat';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Academic Information</h2>

      <div>
        <label className="form-label">Current Education Level</label>
        <select
          className={`form-input ${errors.current_education_level ? 'border-red-500' : ''}`}
          value={data.current_education_level || ''}
          onChange={(e) => onChange('current_education_level', e.target.value)}
        >
          <option value="">Select education level</option>
          {educationLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.current_education_level && <p className="error-message">{errors.current_education_level}</p>}
      </div>

      <div>
        <label className="form-label">High School Name</label>
        <input
          type="text"
          className={`form-input ${errors.high_school ? 'border-red-500' : ''}`}
          placeholder="e.g., Lincoln High School"
          value={data.high_school || ''}
          onChange={(e) => onChange('high_school', e.target.value)}
        />
        {errors.high_school && <p className="error-message">{errors.high_school}</p>}
      </div>

      {/* GPA — Weighted and/or Unweighted (at least one required, no upper limit) */}
      <div>
        <label className="form-label">
          GPA <span className="text-sm text-gray-500 font-normal">(enter at least one)</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Weighted GPA</label>
            <input
              type="number"
              step="0.01"
              className={`form-input ${errors.gpa_weighted ? 'border-red-500' : ''}`}
              placeholder="e.g., 4.3"
              min="0"
              value={data.gpa_weighted ?? ''}
              onChange={(e) => onChange('gpa_weighted', e.target.value ? parseFloat(e.target.value) : '')}
            />
            {errors.gpa_weighted && <p className="error-message text-xs">{errors.gpa_weighted}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Unweighted GPA</label>
            <input
              type="number"
              step="0.01"
              className={`form-input ${errors.gpa_unweighted ? 'border-red-500' : ''}`}
              placeholder="e.g., 3.8"
              min="0"
              value={data.gpa_unweighted ?? ''}
              onChange={(e) => onChange('gpa_unweighted', e.target.value ? parseFloat(e.target.value) : '')}
            />
            {errors.gpa_unweighted && <p className="error-message text-xs">{errors.gpa_unweighted}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Weighted GPAs above 4.0 are accepted (e.g., 4.3 for AP/Honors classes).</p>
      </div>

      {/* SAT or ACT — toggle between them */}
      <div>
        <label className="form-label">Standardized Test Score</label>
        <div className="flex gap-4 mb-3">
          <button
            type="button"
            onClick={() => {
              onChange('test_type', 'sat');
              onChange('act_score', '');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              testType === 'sat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            SAT
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('test_type', 'act');
              onChange('sat_score', '');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              testType === 'act'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ACT
          </button>
        </div>

        {testType === 'sat' ? (
          <div>
            <input
              type="number"
              className={`form-input ${errors.sat_score ? 'border-red-500' : ''}`}
              placeholder="SAT score (400–1600)"
              min="400"
              max="1600"
              value={data.sat_score || ''}
              onChange={(e) => onChange('sat_score', e.target.value ? parseInt(e.target.value) : '')}
            />
            {errors.sat_score && <p className="error-message text-xs">{errors.sat_score}</p>}
            <p className="text-xs text-gray-400 mt-1">Score range: 400–1600</p>
          </div>
        ) : (
          <div>
            <input
              type="number"
              className={`form-input ${errors.act_score ? 'border-red-500' : ''}`}
              placeholder="ACT score (1–36)"
              min="1"
              max="36"
              value={data.act_score || ''}
              onChange={(e) => onChange('act_score', e.target.value ? parseInt(e.target.value) : '')}
            />
            {errors.act_score && <p className="error-message text-xs">{errors.act_score}</p>}
            <p className="text-xs text-gray-400 mt-1">Score range: 1–36</p>
          </div>
        )}
      </div>

      <div>
        <label className="form-label">Intended Major</label>
        <select
          className={`form-input ${errors.major ? 'border-red-500' : ''}`}
          value={data.major || ''}
          onChange={(e) => onChange('major', e.target.value)}
        >
          <option value="">Select major</option>
          {majors.map(major => (
            <option key={major} value={major}>{major}</option>
          ))}
        </select>
        {errors.major && <p className="error-message">{errors.major}</p>}
      </div>

      <div>
        <label className="form-label">Expected Graduation Year</label>
        <input
          type="number"
          className={`form-input ${errors.graduation_year ? 'border-red-500' : ''}`}
          placeholder="2026"
          min="2024"
          max="2035"
          value={data.graduation_year || ''}
          onChange={(e) => onChange('graduation_year', e.target.value ? parseInt(e.target.value) : '')}
        />
        {errors.graduation_year && <p className="error-message">{errors.graduation_year}</p>}
      </div>
    </div>
  );
};
