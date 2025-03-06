import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, Mail, Lock, User } from 'lucide-react';
import PageLayout from '../components/PageLayout';

export default function Register() {
  return (
    <PageLayout>
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl transform transition-all duration-300 hover:shadow-[#FF9F2D]/10 hover:scale-[1.01]">
          <div className="text-center">
            <div className="flex justify-center">
              <Construction className="h-16 w-16 text-[#FF9F2D] animate-bounce" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Strona w budowie
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Rejestracja będzie dostępna wkrótce!
            </p>
          </div>

          {/* Disabled form for visual representation */}
          <form className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px opacity-50">
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
                    disabled
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 pl-10 border border-gray-300/50 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm cursor-not-allowed"
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
                    disabled
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300/50 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm cursor-not-allowed"
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
                    disabled
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 pl-10 border border-gray-300/50 bg-white/5 placeholder-gray-400 text-white focus:outline-none focus:ring-[#FF9F2D] focus:border-[#FF9F2D] focus:z-10 sm:text-sm cursor-not-allowed"
                    placeholder="Hasło"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                disabled
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF9F2D]/50 cursor-not-allowed"
              >
                Rejestracja tymczasowo niedostępna
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="font-medium text-[#FF9F2D] hover:text-[#f39729] transition-colors duration-200"
            >
              Wróć do strony głównej
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-300">
              Chcesz wiedzieć kiedy uruchomimy rejestrację?
            </p>
            <a 
              href="mailto:kontakt@impactmarket.pl" 
              className="mt-2 inline-block text-sm text-[#FF9F2D] hover:text-[#f39729] transition-colors duration-200"
            >
              Napisz do nas!
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}