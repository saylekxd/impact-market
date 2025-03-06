import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Rocket, Users, Shield, Mail } from 'lucide-react';
import PageLayout from '../components/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl transform transition-all duration-300 hover:shadow-[#FF9F2D]/10">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Nowa era handlu społecznościowego
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Łączymy twórców i ich społeczności w unikalnym marketplace, 
              gdzie każda transakcja buduje silniejsze więzi.
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF9F2D] rounded-full w-3/4 animate-pulse"></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Postęp prac: 75%
              </p>
            </div>

       
            
            <p className="text-gray-300 mb-6">
              Zapisz się do newslettera, aby otrzymywać informacje o postępach prac i dacie startu platformy.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Twój adres email"
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F2D] focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#FF9F2D] text-white font-medium hover:bg-[#f39729] transition-all duration-200 transform hover:scale-105"
              >
                Zapisz się
              </button>
            </form>
        
           
          </div>
        </div>

       
    

    

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-400">
          <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="hover:text-[#FF9F2D] transition-colors duration-200">O nas</a>
            <a href="#" className="hover:text-[#FF9F2D] transition-colors duration-200">Blog</a>
            <a href="#" className="hover:text-[#FF9F2D] transition-colors duration-200">Polityka prywatności</a>
            <a href="#" className="hover:text-[#FF9F2D] transition-colors duration-200">Regulamin</a>
          </div>
          <p>© {new Date().getFullYear()} Impact Market. Wszystkie prawa zastrzeżone.</p>
        </footer>
      </div>
    </PageLayout>
  );
}