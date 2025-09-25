import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function OnboardingComplete() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const success = params.get('success');
  const refresh = params.get('refresh');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect after countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to sell product page if success, or marketplace if failed
      if (success === 'true') {
        navigate('/sellProduct');
      } else {
        navigate('/market');
      }
    }
  }, [countdown, navigate, success]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {success === 'true' ? (
          <>
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Stripe Account Connected Successfully!</h2>
            <p className="mb-6 text-gray-600">Your account has been successfully connected to Stripe. You can now sell products on our marketplace.</p>
          </>
        ) : refresh === 'true' ? (
          <>
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">Onboarding Process Refreshed</h2>
            <p className="mb-6 text-gray-600">The onboarding process has been refreshed. Please try again to connect your Stripe account.</p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Onboarding Canceled or Failed</h2>
            <p className="mb-6 text-gray-600">The Stripe account connection process was not completed. Please try again from the marketplace.</p>
          </>
        )}
        
        <div className="mt-4 p-2 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Redirecting in <span className="font-bold">{countdown}</span> seconds...</p>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          {success === 'true' ? (
            <button 
              onClick={() => navigate('/sellProduct')} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Continue to Sell Product
            </button>
          ) : (
            <button 
              onClick={() => navigate('/market')} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Return to Marketplace
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingComplete;
