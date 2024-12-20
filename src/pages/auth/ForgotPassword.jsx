import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import globeImage from '../../assets/images/signup.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset password email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {success ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Check Your Email</h2>
              <p className="text-gray-600 mb-8">
                We've sent password reset instructions to your email address.
              </p>
              <Link
                to="/login"
                className="text-[#0D344C] hover:underline"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold mb-1">Reset Password</h1>
              <p className="text-gray-600 text-sm mb-8">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {error && (
                <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Reset Password'}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-[#0D344C] hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 