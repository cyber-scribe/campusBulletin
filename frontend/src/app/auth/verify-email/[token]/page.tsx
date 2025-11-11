'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now sign in.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email. The link may have expired or is invalid.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              status === 'verifying' ? 'bg-blue-500/20' : 
              status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {status === 'verifying' ? (
                <svg className="w-8 h-8 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : status === 'success' ? (
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {status === 'verifying' ? 'Verifying Email...' : 
             status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h2>
          
          <p className="text-gray-300 mb-6">{message}</p>
          
          {status === 'success' ? (
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-4">Redirecting to login page...</p>
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                Go to Login
              </Link>
            </div>
          ) : status === 'error' ? (
            <div className="mt-6">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                Back to Home
              </Link>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
