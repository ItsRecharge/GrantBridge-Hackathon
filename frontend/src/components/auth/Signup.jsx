import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import authService from '../../services/authService.js';
import toast from 'react-hot-toast';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.signup(email, password, confirmPassword);
      login(result.user, result.token);
      toast.success('Account created successfully!');
      navigate('/profile-setup');
    } catch (error) {
      const errorData = error.response?.data;
      console.error('Signup error:', errorData);

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errorMap = {};
        errorData.errors.forEach(e => {
          errorMap[e.field] = e.message;
        });
        setErrors(errorMap);
        // Show each error clearly in the toast
        errorData.errors.forEach(e => {
          toast.error(`${e.message}`, { duration: 5000 });
        });
      } else if (!error.response) {
        toast.error(
          'Could not connect to the server. Please check your internet connection and try again.',
          { duration: 5000 }
        );
      } else if (error.response?.status === 409) {
        toast.error(
          'An account with this email already exists. Try logging in instead.',
          { duration: 5000 }
        );
        setErrors({ email: 'This email is already registered' });
      } else {
        const msg = errorData?.message || error.friendlyMessage || 'Signup failed';
        toast.error(msg, { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Inline error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg" role="alert">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-sm font-semibold text-red-800">Please fix the following:</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1 ml-7">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
