import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PixelTrail } from "@/components/ui/pixel-trail";
import { useScreenSize } from "@/components/hooks/use-screen-size";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const screenSize = useScreenSize();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login attempt
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // If we successfully logged in
      if (data.user) {
        console.log('Login successful, checking profile...');
        
        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', data.user.id)
          .maybeSingle();
        
        // If no profile exists, create one with basic info
        if (!profileData && !profileError) {
          console.log('No profile found, creating one...');
          
          // Generate username from email
          const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + 
                          Math.floor(Math.random() * 10000);
          
          // Create profile
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username,
              display_name: username,
              total_donations: 0,
              available_balance: 0
            });
          
          if (createError) {
            console.error('Error creating profile during login:', createError);
          }
        }
      }

      // Navigate to dashboard regardless of profile status (the ProfileContext will handle missing profiles)
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  // Array of quotes for the right side
  const quotes = [
    { text: "Razem możemy przyczynić się do pozytywnych zmian na świecie.", author: "Impact Market" },
    { text: "Twój wkład ma znaczenie. Działajmy wspólnie dla dobra innych.", author: "Zespół IM" },
    { text: "Sprawdź, jak Twoje wsparcie zmienia życie potrzebujących.", author: "Fundacja IM" },
  ];

  // Randomly select a quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      <div className="relative flex-grow flex flex-col md:flex-row">
        <div className="absolute inset-0 z-0">
          <PixelTrail
            pixelSize={screenSize.lessThan("md") ? 36 : 60}
            fadeDuration={0}
            delay={1000}
            pixelClassName="rounded-full bg-[#ffa04f]/20"
          />
        </div>
        
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-6 z-10">
          <div className="w-full max-w-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                  Zaloguj się
                </h2>
                <p className="text-sm text-gray-300">
                  Lub{' '}
                  <Link to="/register" className="font-medium text-[#FF9F2D] hover:text-[#f39729]">
                    zarejestruj się
                  </Link>
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300/20 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm"
                        placeholder="Adres email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
                      Hasło
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300/20 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm"
                        placeholder="Hasło"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                      loading 
                        ? 'bg-[#FF9F2D]/50 cursor-not-allowed' 
                        : 'bg-[#FF9F2D] hover:bg-[#f39729] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9F2D]'
                    }`}
                  >
                    {loading ? 'Logowanie...' : 'Zaloguj się'}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <Link 
                  to="/" 
                  className="font-medium text-[#FF9F2D] hover:text-[#f39729] transition-colors duration-200"
                >
                  Wróć do strony głównej
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Right side - Quotes */}
        <div className="hidden md:flex md:w-1/2 bg-[#101010] justify-center items-center p-10 z-10">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-md"
          >
            <motion.div
              className="w-12 h-1 bg-[#FF9F2D] mb-6"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
            <motion.blockquote 
              className="text-2xl font-light mb-6 text-white leading-relaxed"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              "{randomQuote.text}"
            </motion.blockquote>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-[#FF9F2D]"
            >
              — {randomQuote.author}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}