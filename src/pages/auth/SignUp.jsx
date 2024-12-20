import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import globeImage from '../../assets/images/signup.png';

const SignUp = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    countryCode: '91',
    governmentID: null,
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('File must be JPG, PNG, or PDF');
        return;
      }

      setFormData(prev => ({
        ...prev,
        governmentID: file
      }));
      setSelectedFileName(file.name);
      setError(''); // Clear any existing errors
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

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

      await authService.signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        phone_number: formData.phoneNumber,
        country_code: formData.countryCode,
        governmentID: formData.governmentID
      });

      // Redirect to OTP verification page
      navigate('/verify-otp', { 
        state: { email: formData.email }
      });
    } catch (err) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
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

      {/* Right Section - Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">Create Account</h1>
            <p className="text-gray-600 text-sm">
              Please fill in the details to create your account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {/* Name Field */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] text-sm"
                    placeholder="Username123@gmail.com"
                    required
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Phone number</label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] text-sm"
                  >
                    <option value="91">+91</option>
                  </select>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] text-sm"
                    placeholder="12345 67890"
                    required
                  />
                </div>
              </div>

              {/* Government ID Upload */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Government ID</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleBrowseClick}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Browse Files
                  </button>
                  <span className="text-sm text-gray-500 truncate">
                    {selectedFileName || 'No file selected'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supported formats: PDF, JPG, PNG (Max size: 5MB)
                </p>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] text-sm"
                      placeholder="Enter your password"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] text-sm"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-[#0D344C] border-gray-300 rounded focus:ring-[#0D344C]"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#0D344C] hover:underline">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already a user?{' '}
                  <Link to="/login" className="text-[#0D344C] hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 