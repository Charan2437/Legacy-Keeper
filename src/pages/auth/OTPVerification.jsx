import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();

  // Handle timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle OTP input
  const handleChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 4 && /^\d+$/.test(value)) {
        newOtp[index] = value;
      }
    });
    setOtp(newOtp);
  };

  const handleResend = () => {
    setTimer(30);
    setCanResend(false);
    // Add resend OTP logic here
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    console.log('Verifying OTP:', otpString);
    // Add verification logic here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2">OTP Verification</h1>
        <p className="text-gray-600 text-sm text-center mb-8">
          Enter your otp code we just sent to your email Id
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-14 h-14 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D344C] ${
                  digit ? 'border-[#0D344C]' : 'border-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Verify
          </button>

          {/* Resend Timer */}
          <div className="text-center text-sm text-gray-600">
            Resend otp in {timer}s?{' '}
            {canResend && (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#0D344C] font-medium hover:underline"
              >
                Resend
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification; 