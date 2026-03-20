import { useState } from 'react';

export const ExtracurricularsStep = ({ data, onChange, errors }) => {
  const [newActivity, setNewActivity] = useState('');
  const [newAward, setNewAward] = useState('');

  const addActivity = () => {
    if (newActivity.trim()) {
      const current = data.extracurriculars || [];
      onChange('extracurriculars', [...current, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const removeActivity = (index) => {
    const current = data.extracurriculars || [];
    onChange('extracurriculars', current.filter((_, i) => i !== index));
  };

  const addAward = () => {
    if (newAward.trim()) {
      const current = data.awards || [];
      onChange('awards', [...current, newAward.trim()]);
      setNewAward('');
    }
  };

  const removeAward = (index) => {
    const current = data.awards || [];
    onChange('awards', current.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Extracurriculars & Awards</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Optional:</strong> Add your extracurricular activities and awards to help match you with relevant scholarships. You can skip this step if you prefer.
        </p>
      </div>

      <div>
        <label className="form-label">Extracurricular Activities</label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              className="form-input flex-1"
              placeholder="e.g., Debate Team, Robotics Club"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addActivity)}
            />
            <button
              type="button"
              onClick={addActivity}
              className="btn-primary px-4"
            >
              Add
            </button>
          </div>

          {(data.extracurriculars || []).length > 0 && (
            <div className="space-y-2">
              {data.extracurriculars.map((activity, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <span>{activity}</span>
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.extracurriculars && <p className="error-message">{errors.extracurriculars}</p>}
      </div>

      <div>
        <label className="form-label">Awards & Honors</label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              className="form-input flex-1"
              placeholder="e.g., National Merit Scholar, Award Name"
              value={newAward}
              onChange={(e) => setNewAward(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addAward)}
            />
            <button
              type="button"
              onClick={addAward}
              className="btn-primary px-4"
            >
              Add
            </button>
          </div>

          {(data.awards || []).length > 0 && (
            <div className="space-y-2">
              {data.awards.map((award, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <span>{award}</span>
                  <button
                    type="button"
                    onClick={() => removeAward(index)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.awards && <p className="error-message">{errors.awards}</p>}
      </div>

      <div>
        <label className="form-label">Special Circumstances (Optional)</label>
        <textarea
          className={`form-input ${errors.special_circumstances ? 'border-red-500' : ''}`}
          placeholder="Tell us about any special circumstances or hardships..."
          rows="4"
          value={data.special_circumstances?.notes || ''}
          onChange={(e) => onChange('special_circumstances', { notes: e.target.value })}
        />
        {errors.special_circumstances && <p className="error-message">{errors.special_circumstances}</p>}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> The more information you provide, the better we can match you with relevant scholarships and financial aid opportunities.
        </p>
      </div>
    </div>
  );
};
