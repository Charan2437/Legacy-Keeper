import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import globeImage from '../../assets/images/signup.png';
import { supabase } from '../../lib/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    const checkResetToken = async () => {
      // Check for error in URL hash
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const error = hashParams.get('error');
      const accessToken = hashParams.get('access_token');
      
      if (error === 'access_denied') {
        setInvalidLink(true);
        setError('This password reset link is invalid or has expired. Please request a new one.');
      } else if (!accessToken) {
        setInvalidLink(true);
        setError('No reset token found. Please request a new password reset link.');
      } else {
        try {
          // Try to set the session with the token
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: null
          });
          
          if (error) {
            setInvalidLink(true);
            setError('Invalid reset token. Please request a new password reset link.');
          }
        } catch (err) {
          setInvalidLink(true);
          setError('Failed to validate reset token. Please request a new password reset link.');
        }
      }
    };

    checkResetToken();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await authService.updatePassword(formData.password);
      navigate('/login', { 
        state: { message: 'Password has been successfully reset. Please login with your new password.' }
      });
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (invalidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              to="/forgot-password"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D344C] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D344C]"
            >
              Request New Reset Link
            </Link>
            <div>
              <Link
                to="/login"
                className="text-[#0D344C] hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D344C] flex-col justify-center items-center p-8 relative">
        <img 
          src={globeImage} 
          alt="Globe" 
          className="w-full max-w-md opacity-20 absolute"
        />
        <div className="relative z-10 text-white text-center">
          <h1 className="text-4xl font-bold">"Explore Positive Change"</h1>
        </div>
      </div>

      {/* Right Section - Reset Password Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-1">Set New Password</h1>
          <p className="text-gray-600 text-sm mb-8">
            Please enter your new password below.
          </p>

          {error && (
            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 