import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancelled = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-6">Your payment process was cancelled. No charges were made.</p>
        
        <div className="flex flex-col space-y-3">
          <Link to="/user/marketplace" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300">
            Return to Marketplace
          </Link>
          <Link to="/user/dashboard" className="text-blue-500 hover:text-blue-700 font-medium transition duration-300">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;