import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

const Onboarding = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No active session, redirect to login
          navigate('/login');
          return;
        }
        
        setUserId(session.user.id);
      } catch (error) {
        console.error('Error checking auth status:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9F2D]"></div>
      </div>
    );
  }

  if (!userId) {
    return null; // Should never reach here due to redirect in useEffect
  }

  return <OnboardingFlow userId={userId} />;
};

export default Onboarding; 