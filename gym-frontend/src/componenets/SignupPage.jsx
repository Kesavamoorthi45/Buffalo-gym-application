import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axiosInstance';
import '../css/LoginPage.css';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Other', value: 'O' },
  { label: 'Prefer not to say', value: 'N' },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.userId.trim()) newErrors.userId = 'User ID is required';
    else if (form.userId.trim().length < 3) newErrors.userId = 'User ID must be at least 3 characters';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.gender) newErrors.gender = 'Please select your gender';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError('');
    try {
      const response = await axiosInstance.post('register/', {
        user_id: form.userId.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
        gender: form.gender,
      });

      // Store tokens and navigate to onboarding
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      navigate('/genderselection');
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="content">
        <div className="login-form">
          <div className="form-header">
            <h2>Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div
                style={{
                  background: '#fff0f0',
                  border: '1px solid #ffcccc',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  color: '#cc0000',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                {serverError}
              </div>
            )}

            <div>
              <input
                type="text"
                name="userId"
                placeholder="Choose a User ID"
                value={form.userId}
                onChange={handleChange}
                className={errors.userId ? 'error-input' : ''}
                autoComplete="username"
                maxLength={50}
              />
              {errors.userId && <span className="error-message">{errors.userId}</span>}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'error-input' : ''}
                autoComplete="new-password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error-input' : ''}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <div style={{ textAlign: 'left', marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: 600 }}>
                Gender
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {GENDER_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      border: `2px solid ${form.gender === opt.value ? '#b30000' : '#ddd'}`,
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      background: form.gender === opt.value ? '#b3000011' : '#fff',
                      color: form.gender === opt.value ? '#b30000' : '#555',
                      fontWeight: form.gender === opt.value ? 600 : 400,
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={opt.value}
                      checked={form.gender === opt.value}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <p style={{ marginTop: '16px', fontSize: '14px', color: '#555' }}>
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                style={{ color: '#b30000', cursor: 'pointer', fontWeight: 600 }}
              >
                Log In
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
