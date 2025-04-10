import React, { useEffect, useState } from 'react';
import { testApiConnection } from '../lib/stripe';
import { API_BASE_URL } from '../config';

const ApiStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setIsLoading(true);
        const result = await testApiConnection();
        setStatus(result);
      } catch (error) {
        setStatus({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
  }, []);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Checking API connection...</div>;
  }

  return (
    <div className={`text-sm ${status?.success ? 'text-green-600' : 'text-red-600'}`}>
      API Status: {status?.success ? 'Connected' : 'Disconnected'} 
      <span className="text-xs ml-2 text-gray-500">
        ({API_BASE_URL})
      </span>
    </div>
  );
};

export default ApiStatusIndicator; 