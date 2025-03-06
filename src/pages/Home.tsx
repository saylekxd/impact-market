import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl transform transition-all duration-300 hover:shadow-[#FF9F2D]/10">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Nowa era dobroczynności cyfrowej
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Tworzymy innowacyjny marketplace, gdzie każda transakcja zamienia się w realną pomoc. Kupując wirtualne dobra, wspierasz ludzi i organizacje, które zmieniają świat na lepsze.
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
            <Link to="/about" className="hover:text-[#FF9F2D] transition-colors duration-200">O nas</Link>
            <Link to="/privacy" className="hover:text-[#FF9F2D] transition-colors duration-200">Polityka prywatności</Link>
            <Link to="/terms" className="hover:text-[#FF9F2D] transition-colors duration-200">Regulamin</Link>
          </div>

          <p>© {new Date().getFullYear()} Impact Market. Wszystkie prawa zastrzeżone.</p>
          
          {/* Added developer info */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-[0.9rem] h-[1.5rem] flex items-center">Developed by</span>
            <a 
              href="https://swtlabs.pl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-200"
            >
              <img 
                src="/swtlabs-logo.png" 
                alt="SWTLabs Logo" 
                className="max-w-[2rem] sm:max-w-[3rem] md:max-w-[4rem] w-auto h-auto transition-all"
                style={{ aspectRatio: '140/45' }} // Actual logo aspect ratio (replace with your logo's ratio)
              />
            </a>
          </div>

      
        </footer>
      </div>
    </PageLayout>
  );
}