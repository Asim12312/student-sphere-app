import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        // Get the session_id from URL query parameters
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');

        if (sessionId) {
          // You could fetch session details from your backend if needed
          setSessionDetails({ id: sessionId });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session details:', error);
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been processed successfully.</p>
        
        {sessionDetails && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-500">Transaction ID: {sessionDetails.id}</p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <Link to="/user/marketplace" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300">
            Continue Shopping
          </Link>
          <Link to="/user/dashboard" className="text-blue-500 hover:text-blue-700 font-medium transition duration-300">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;