import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First check if the username is available
      const { data: isAvailable, error: checkError } = await supabase.rpc(
        'check_username_available',
        { username: username.toLowerCase() }
      );

      if (checkError) throw checkError;

      if (!isAvailable) {
        throw new Error('Ta nazwa użytkownika jest już zajęta');
      }

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Nie udało się utworzyć konta');

      // Create a profile for the user
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: username,
      });

      if (profileError) throw profileError;

      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl transform transition-all duration-300 hover:shadow-[#FF9F2D]/10 hover:scale-[1.01]">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Zarejestruj się
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Lub{' '}
              <Link to="/login" className="font-medium text-[#FF9F2D] hover:text-[#f39729]">
                zaloguj się
              </Link>
            </p>
          </div>

          <form onSubmit={handleRegister} className="mt-8 space-y-6">
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
                {error}
              </div>
            )}
            
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Nazwa użytkownika
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300/50 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm"
                    placeholder="Nazwa użytkownika"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
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
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300/50 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm"
                    placeholder="Adres email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
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
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300/50 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm"
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
                {loading ? 'Rejestracja...' : 'Zarejestruj się'}
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
        </div>
      </div>
    </PageLayout>
  );
}