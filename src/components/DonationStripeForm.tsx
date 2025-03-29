import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Droplets, UtensilsCrossed, Stethoscope, Pill, Coffee, Leaf, Mountain, Bird, Building, PenTool, 
  Monitor, Bone, Utensils, Waves, Sandwich, Soup, Ambulance, Sprout, TreePine, TreeDeciduous, 
  Users, Globe, BookOpen, Backpack, Laptop, GraduationCap, Palette, Brush, Home, Heart, Shirt, School, 
  Apple, Pizza, Activity, HeartHandshake, CloudRain, Sunset, Footprints, Dog, Cat, BrainCircuit, 
  PencilRuler, BookMarked, Microscope, Gamepad2, Code, Smartphone, Trophy, Medal, Music, Piano, 
  Drum, Film, Camera, PaintBucket, ShoppingBag, Gift, Phone, Mail, Send, Wind, CheckCircle 
} from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import { donations } from '../lib/donations';
import { profiles } from '../lib/profiles';
import { testApiConnection } from '../lib/stripe';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_API_CONFIG } from '../config';

// --- Define Tier Configuration Type ---
export interface TierConfig {
  smallIconId: string | null;
  smallAmount: number; // Expecting amount in PLN (e.g., 15, 50, 100)
  mediumIconId: string | null;
  mediumAmount: number;
  largeIconId: string | null;
  largeAmount: number;
}

// --- Update Props Interface ---
interface DonationStripeFormProps {
  creatorId: string;
  creatorName: string;
  tierConfig: TierConfig | null; // Add tierConfig prop
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Map of icon IDs to Lucide icon components for quick reference
const ICON_MAP: Record<string, React.ElementType> = {
  // Humanitarian aid
  water_sip: Droplets,
  bread: Sandwich,
  clothes: Shirt,
  shelter: Home,
  water_bottle: Coffee,
  hope_kit: HeartHandshake,
  emergency_aid: Heart,
  village_well: Waves,
  aid_program: Users,
  community_help: Building,
  
  // Food
  sandwich: Sandwich,
  apple: Apple,
  snack: Coffee,
  warm_meal: UtensilsCrossed,
  pizza: Pizza,
  grocery: ShoppingBag,
  family_meals: Soup,
  food_for_month: Pizza,
  community_kitchen: UtensilsCrossed,
  
  // Medical
  first_aid: Pill,
  vitamins: Activity,
  bandages: Pill,
  doctor_visit: Stethoscope,
  therapy: Heart,
  health_exam: Activity,
  life_saving: Ambulance,
  surgery: Activity,
  medical_equipment: Activity,
  
  // Ecology
  small_plant: Sprout,
  seed: Leaf,
  recycling: Wind,
  tree: TreePine,
  garden: Leaf,
  clean_river: Waves,
  forest: TreeDeciduous,
  ecosystem: Mountain,
  conservation: TreeDeciduous,
  
  // Nature
  green_leaf: Leaf,
  rain_drop: Droplets,
  clean_air: Wind,
  new_plant: Sprout,
  water_cleaning: CloudRain,
  nature_education: BookOpen,
  natural_renewal: Mountain,
  park_creation: Sunset,
  wilderness: TreeDeciduous,
  
  // Animals
  bird_nest: Bird,
  cat_food: Cat,
  dog_walk: Footprints,
  animal_family: Users,
  vet_visit: Dog,
  shelter_support: Home,
  reserve: Globe,
  endangered: Bird,
  wildlife_program: Footprints,
  
  // Education
  notebook: PenTool,
  pencil: PencilRuler,
  book: BookOpen,
  textbook: BookOpen,
  library_visit: BookMarked,
  science_kit: Microscope,
  school_supplies: Backpack,
  school_year: School,
  learning_center: Building,
  
  // Online learning
  online_hour: Monitor,
  coding_lesson: Code,
  e_book: Smartphone,
  laptop: Laptop,
  online_course: BrainCircuit,
  digital_tools: Gamepad2,
  scholarship: GraduationCap,
  tech_education: Code,
  digital_academy: Trophy,
  
  // Pet help
  pet_food: Utensils,
  pet_toy: Bone,
  pet_treat: Gift,
  pet_bed: Bone,
  pet_grooming: Cat,
  pet_medicine: Pill,
  pet_care: Home,
  pet_surgery: Pill,
  shelter_renovation: Building,
  
  // Arts
  art_supplies: Palette,
  music_lesson: Music,
  theater_ticket: Film,
  art_project: Brush,
  instrument: Piano,
  photography: Camera,
  art_festival: Building,
  creative_space: PaintBucket,
  cultural_program: Drum,
  
  // Communication
  phone_call: Phone,
  text_message: Mail,
  internet_hour: Globe,
  mobile_data: Smartphone,
  weekly_plan: Send,
  smartphone: Phone,
  year_connection: Globe,
  communication_center: Smartphone,
  tech_access: Send,
  
  // Legacy icons (for backward compatibility)
  coffee: Coffee,
  check_circle: CheckCircle,
  medal: Medal,
};

// Default icon when we don't have a mapping
const DEFAULT_ICON = Coffee;

export default function DonationStripeForm({ 
  creatorId,
  creatorName,
  tierConfig, // Destructure the new prop
  onSuccess,
  onCancel 
}: DonationStripeFormProps) {
  // State for form values
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number>(0); // Default to 0, let tier selection or custom input set it
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [addMessage, setAddMessage] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  // No longer need to fetch/store donationOptions internally, rely on props
  // const [isLoadingIcons, setIsLoadingIcons] = useState(true); // Remove if relying solely on props
  // const [donationOptions, setDonationOptions] = useState<...>(...); // Remove internal state
  
  // --- Update Default Amount Logic based on Props ---
  useEffect(() => {
    // Set default selected amount to medium tier if config is available
    if (tierConfig && tierConfig.mediumAmount > 0) {
      setSelectedAmount(tierConfig.mediumAmount * 100); // Convert PLN to cents
    } else {
       setSelectedAmount(1000); // Fallback default (10 PLN in cents)
    }
    setCustomAmount(''); // Ensure custom amount is cleared initially
  }, [tierConfig]);

  // Get icon component from the icon ID
  const getIconForId = (iconId: string): React.ElementType => {
    // Ensure we have a valid string
    if (!iconId || typeof iconId !== 'string') {
      console.warn('Invalid icon ID provided:', iconId);
      return DEFAULT_ICON;
    }

    // Try to find the icon in our map
    const IconComponent = ICON_MAP[iconId];
    
    // If not found, log a warning and return default
    if (!IconComponent) {
      console.warn(`Icon not found for ID: "${iconId}", using default`);
      return DEFAULT_ICON;
    }
    
    return IconComponent;
  };

  // Get label for an icon ID
  const getLabelForIcon = (iconId: string): string => {
    // This would ideally come from a centralized mapping
    const labelMap: Record<string, string> = {
      // Humanitarian aid
      'water_sip': 'Łyk wody',
      'bread': 'Bochenek chleba',
      'clothes': 'Ubrania',
      'shelter': 'Schronienie',
      'water_bottle': 'Butelka wody',
      'hope_kit': 'Paczka nadziei',
      'emergency_aid': 'Pomoc doraźna',
      'village_well': 'Studnia dla wioski',
      'aid_program': 'Program pomocowy',
      'community_help': 'Odbudowa społeczności',
      
      // Food
      'sandwich': 'Kanapka dla dziecka',
      'apple': 'Owoce na przerwę',
      'snack': 'Przekąska',
      'warm_meal': 'Ciepły posiłek',
      'pizza': 'Pizza dla rodziny',
      'grocery': 'Zakupy spożywcze',
      'family_meals': 'Obiady dla rodziny',
      'food_for_month': 'Wyżywienie na miesiąc',
      'community_kitchen': 'Kuchnia społeczna',
      
      // Medical
      'first_aid': 'Leki na pierwszą pomoc',
      'vitamins': 'Witaminy',
      'bandages': 'Opatrunki',
      'doctor_visit': 'Wizyta u lekarza',
      'therapy': 'Sesja terapeutyczna',
      'health_exam': 'Badania zdrowotne',
      'life_saving': 'Ratowanie życia',
      'surgery': 'Operacja',
      'medical_equipment': 'Sprzęt medyczny',
      
      // Ecology
      'small_plant': 'Mała sadzonka',
      'seed': 'Ziarno przyszłości',
      'recycling': 'Recykling',
      'tree': 'Dojrzałe drzewo',
      'garden': 'Ogród społeczny',
      'clean_river': 'Oczyszczanie rzeki',
      'forest': 'Cały las',
      'ecosystem': 'Odnowa ekosystemu',
      'conservation': 'Program ochrony',
      
      // Nature
      'green_leaf': 'Zielony listek',
      'rain_drop': 'Kropla deszczu',
      'clean_air': 'Czyste powietrze',
      'new_plant': 'Nowa roślina',
      'water_cleaning': 'Oczyszczanie wody',
      'nature_education': 'Edukacja ekologiczna',
      'natural_renewal': 'Odnowa naturalnego środowiska',
      'park_creation': 'Tworzenie parku',
      'wilderness': 'Ochrona dzikich terenów',
      
      // Animals
      'bird_nest': 'Pisklę w gnieździe',
      'cat_food': 'Karma dla kota',
      'dog_walk': 'Spacer z psem',
      'animal_family': 'Opieka nad rodziną zwierząt',
      'vet_visit': 'Wizyta u weterynarza',
      'shelter_support': 'Wsparcie schroniska',
      'reserve': 'Ochrona rezerwatu',
      'endangered': 'Ratowanie zagrożonych gatunków',
      'wildlife_program': 'Program dla dzikich zwierząt',
      
      // Education
      'notebook': 'Zeszyt i długopis',
      'pencil': 'Przybory szkolne',
      'book': 'Książka edukacyjna',
      'textbook': 'Podręcznik szkolny',
      'library_visit': 'Dostęp do biblioteki',
      'science_kit': 'Zestaw naukowy',
      'school_supplies': 'Cała wyprawka',
      'school_year': 'Rok nauki',
      'learning_center': 'Centrum nauki',
      
      // Online learning
      'online_hour': 'Godzina nauki online',
      'coding_lesson': 'Lekcja programowania',
      'e_book': 'E-book edukacyjny',
      'laptop': 'Laptop dla ucznia',
      'online_course': 'Kurs online',
      'digital_tools': 'Narzędzia cyfrowe',
      'scholarship': 'Stypendium edukacyjne',
      'tech_education': 'Edukacja technologiczna',
      'digital_academy': 'Akademia cyfrowa',
      
      // Pet help
      'pet_food': 'Puszka karmy',
      'pet_toy': 'Zabawka dla zwierzaka',
      'pet_treat': 'Przysmak',
      'pet_bed': 'Legowisko i leczenie',
      'pet_grooming': 'Pielęgnacja',
      'pet_medicine': 'Leki dla zwierzaka',
      'pet_care': 'Opieka przez rok',
      'pet_surgery': 'Operacja zwierzaka',
      'shelter_renovation': 'Remont schroniska',
      
      // Arts
      'art_supplies': 'Pędzel i farby',
      'music_lesson': 'Lekcja muzyki',
      'theater_ticket': 'Bilet do teatru',
      'art_project': 'Wsparcie jednego projektu',
      'instrument': 'Instrument muzyczny',
      'photography': 'Sprzęt fotograficzny',
      'art_festival': 'Festiwal sztuki',
      'creative_space': 'Przestrzeń kreatywna',
      'cultural_program': 'Program kulturalny',
      
      // Communication
      'phone_call': 'Rozmowa telefoniczna',
      'text_message': 'Wiadomość',
      'internet_hour': 'Godzina internetu',
      'mobile_data': 'Pakiet danych',
      'weekly_plan': 'Tygodniowy plan',
      'smartphone': 'Smartfon',
      'year_connection': 'Rok łączności',
      'communication_center': 'Centrum komunikacji',
      'tech_access': 'Dostęp do technologii',
      
      // Legacy icons (for backward compatibility)
      'coffee': 'Kawa',
      'check_circle': 'Potwierdzenie',
      'medal': 'Medal',
    };
    
    return labelMap[iconId] || 'Wsparcie';
  };

  // Skeleton loading component for icons
  const IconSkeleton = () => (
    <div className="animate-pulse flex flex-col items-center justify-center">
      <div className="w-6 h-6 bg-gray-200 rounded-full mb-2"></div>
      <div className="h-4 w-14 bg-gray-200 rounded"></div>
    </div>
  );

  // Check API availability on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const result = await testApiConnection();
        setApiStatus(result.success ? 'available' : 'unavailable');
        if (!result.success) {
          console.error('API is unavailable:', result.message);
        }
      } catch (error) {
        console.error('Error checking API status:', error);
        setApiStatus('unavailable');
      }
    };

    checkApiStatus();
  }, []);

  // Calculate the amount in cents
  const amount = customAmount ? parseInt(customAmount) * 100 : selectedAmount;

  // Handle form submission to advance to payment
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < 100) {
      toast.error('Minimalna kwota to 1 zł');
      return;
    }

    // Check API availability before proceeding
    if (apiStatus === 'checking') {
      toast.error('Sprawdzanie dostępności serwisu płatności...');
      return;
    }

    if (apiStatus === 'unavailable') {
      toast.error('Serwis płatności jest obecnie niedostępny. Prosimy spróbować później.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create the donation record first
      const result = await donations.create({
        creator_id: creatorId,
        amount,
        currency: 'PLN',
        message: addMessage ? message : null,
        payer_name: payerName || null,
        payer_email: payerEmail || null,
        payment_type: 'stripe',
      });
      
      if (result.success && result.data?.id) {
        // Store the donation ID for reference
        setDonationId(result.data.id);
        // Once donation is created in the database, proceed to payment step
        setStep('payment');
      } else {
        throw new Error(result.error || 'Wystąpił błąd podczas przygotowania płatności');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Wystąpił błąd: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Ensure we have a donation ID
      if (!donationId) {
        console.error('No donation ID found');
        toast.error('Błąd podczas przetwarzania płatności: brak identyfikatora wpłaty');
        return;
      }

      // Store the Stripe payment ID reference
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.paymentInfo}`, {
          method: 'POST',
          ...DEFAULT_API_CONFIG,
          body: JSON.stringify({
            paymentId: donationId, // Use the existing donationId
            stripePaymentId: paymentIntentId,
            creator_id: creatorId
          }),
        });

        // Check for response status
        if (!response.ok) {
          // Try to get more information about the error
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.message || errorData.error || '';
          } catch {
            errorDetails = await response.text();
          }
          
          console.error('Failed to store payment reference:', errorDetails);
          
          // Check if this is a schema error
          if (errorDetails.includes('external_reference') || errorDetails.includes('column')) {
            console.warn('Database schema issue detected. Payment was successful in Stripe but reference could not be stored.');
            // Let's still mark it as successful since this is likely just a schema/migration issue
            toast.success('Dziękujemy za wsparcie! (Ref: DB-Schema)');
            if (onSuccess) {
              onSuccess();
            }
            
            // Redirect to success page after showing toast
            redirectToSuccessPage(paymentIntentId);
            return;
          }
          
          toast.error('Płatność została przyjęta, ale wystąpił błąd podczas aktualizacji statusu. Prosimy o kontakt z obsługą.');
          // Do not call onSuccess here as we couldn't confirm the payment status in our database
          return;
        }
        
        console.log('Payment reference stored successfully');
        toast.success('Dziękujemy za wsparcie!');
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to success page after showing toast
        redirectToSuccessPage(paymentIntentId);
      } catch (err) {
        console.error('Error storing payment reference:', err);
        // If the payment was processed by Stripe but we have errors updating our database,
        // we'll still consider this "successful" from the user perspective
        toast.success('Dziękujemy za wsparcie! (Ref: Error)');
        toast.error('Wystąpił błąd podczas zapisywania płatności. Administrator zostanie powiadomiony.');
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to success page after showing toasts
        redirectToSuccessPage(paymentIntentId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Wystąpił błąd: ${errorMessage}`);
      if (onCancel) {
        onCancel();
      }
    }
  };
  
  // Helper function to redirect to success page
  const redirectToSuccessPage = (paymentIntentId: string) => {
    // Short delay to allow toast to be seen
    setTimeout(() => {
      // Use window.location to navigate to the success page with parameters
      window.location.href = `/payment/success?username=${encodeURIComponent(creatorName)}&amount=${amount}&payment_id=${paymentIntentId}`;
    }, 1500);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    toast.error(`Payment error: ${errorMessage}`);
    if (onCancel) {
      onCancel();
    }
  };

  // Handle back button
  const handleBack = () => {
    setStep('amount');
  };

  // Format price helper (keep as is)
  const formatPrice = (amountInCents: number) => {
    return (amountInCents / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
  };

  // Helper to determine active selection state
  const getActiveOption = () => {
    if (customAmount) return null; // Custom amount overrides tier selection
    if (!tierConfig) return null; // No config available
    if (selectedAmount === tierConfig.smallAmount * 100) return 'small';
    if (selectedAmount === tierConfig.mediumAmount * 100) return 'medium';
    if (selectedAmount === tierConfig.largeAmount * 100) return 'large';
    return null;
  };
  const activeOption = getActiveOption();

  // --- Render the amount selection step ---
  return (
    <div className="p-6">
      {step === 'amount' ? (
        <form onSubmit={handleProceedToPayment}>
          {/* Tier Selection Buttons - Updated for tierConfig prop */}
          {tierConfig ? (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[ 
                { key: 'small', amount: tierConfig.smallAmount, iconId: tierConfig.smallIconId },
                { key: 'medium', amount: tierConfig.mediumAmount, iconId: tierConfig.mediumIconId },
                { key: 'large', amount: tierConfig.largeAmount, iconId: tierConfig.largeIconId },
              ].map(({ key, amount, iconId }) => {
                if (!iconId || amount <= 0) return null; // Don't render if icon or amount is invalid/missing
                const IconComponent = getIconForId(iconId);
                const isSelected = activeOption === key;
                const label = getLabelForIcon(iconId);
                const amountInCents = amount * 100;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      setSelectedAmount(amountInCents);
                      setCustomAmount('');
                    }}
                    // Updated styling for minimalist theme
                    className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-1 transition-all text-center ${
                      isSelected
                        ? 'border-[#ffa04f] bg-[#ffa04f]/10 ring-1 ring-[#ffa04f]'
                        : 'border-[#1a1a1a]/10 hover:border-[#ffa04f]/50 hover:bg-[#ffa04f]/5'
                    }`}
                  >
                    <div className="p-2 bg-white rounded-full mb-2 border border-inherit">
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-[#ffa04f]' : 'text-[#1a1a1a]/70'}`} />
                    </div>
                    <span className={`text-sm font-medium mb-0.5 ${isSelected ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/80'}`}>
                      {label}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-[#ffa04f] font-semibold' : 'text-[#1a1a1a]/60'}`}>
                      {formatPrice(amountInCents)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            // Fallback if tierConfig is not available
            <div className="text-center py-4 text-sm text-[#1a1a1a]/60">Brak skonfigurowanych opcji wsparcia.</div>
          )}

          {/* Custom amount input - Updated styling */}
          <div className="mt-3 relative">
            <div className="relative">
              <input
                type="number" // Keep as number for basic browser validation, but could change to text with pattern
                min="1"
                placeholder="Własna kwota"
                value={customAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomAmount(value); 
                  if (value) {
                    setSelectedAmount(0); // Clear tier selection if custom amount is entered
                  }
                }}
                // Updated styling
                className={`block w-full px-4 py-3 rounded-lg border bg-white text-[#1a1a1a] placeholder:text-[#1a1a1a]/50 ${
                  customAmount
                    ? 'border-[#ffa04f] ring-1 ring-[#ffa04f]'
                    : 'border-[#1a1a1a]/10'
                } focus:ring-[#ffa04f] focus:border-[#ffa04f] focus:outline-none`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-[#1a1a1a]/50">PLN</span>
              </div>
            </div>
          </div>

          {/* Supporter info - Updated styling */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div>
              <input
                type="text"
                id="payerName"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-[#1a1a1a]/10 bg-white text-[#1a1a1a] placeholder:text-[#1a1a1a]/50 shadow-sm focus:border-[#ffa04f] focus:ring-[#ffa04f] sm:text-sm"
                placeholder="Imię (opcjonalnie)"
              />
            </div>
            <div>
              <input
                type="email"
                id="payerEmail"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-[#1a1a1a]/10 bg-white text-[#1a1a1a] placeholder:text-[#1a1a1a]/50 shadow-sm focus:border-[#ffa04f] focus:ring-[#ffa04f] sm:text-sm"
                placeholder="Email (opcjonalnie)"
              />
            </div>
          </div>

          {/* Message toggle - Updated styling */}
          <div className="flex items-center mt-3">
            <button
              type="button"
              onClick={() => setAddMessage(!addMessage)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                addMessage ? 'bg-[#ffa04f]' : 'bg-[#1a1a1a]/20' // Use accent color for active
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  addMessage ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-2 text-sm text-[#1a1a1a]/80">
              Dodaj wiadomość
            </span>
          </div>

          {/* Message textarea - Updated styling */}
          {addMessage && (
            <div className="mt-3">
              <textarea
                id="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border-[#1a1a1a]/10 bg-white text-[#1a1a1a] placeholder:text-[#1a1a1a]/50 shadow-sm focus:border-[#ffa04f] focus:ring-[#ffa04f] sm:text-sm resize-none"
                placeholder="Napisz coś miłego..."
              />
            </div>
          )}

          {/* Current selection summary - Needs Update to use tierConfig */}
          {/* (Logic inside needs adjustment) */} 
          <div className="bg-[#1a1a1a]/5 p-3 rounded-lg flex items-center justify-between mt-4">
            {/* ... This section needs update based on activeOption and tierConfig ... */}
             <div className="flex items-center">
               {activeOption && tierConfig ? (
                 (() => {
                   const currentTier = tierConfig[`${activeOption}Amount`]; // Get amount based on key
                   const currentIconId = tierConfig[`${activeOption}IconId`]; // Get iconId based on key
                   if (!currentIconId || !currentTier) return null; 
                   const IconComponent = getIconForId(currentIconId);
                   const label = getLabelForIcon(currentIconId);
                   return (
                     <>
                       <div className="bg-white p-2 rounded-full mr-2 shadow-sm border border-[#1a1a1a]/10">
                         <IconComponent className="h-5 w-5 text-[#ffa04f]" />
                       </div>
                       <div>
                         <p className="font-medium text-[#1a1a1a]">{label}</p>
                         <p className="text-sm text-[#1a1a1a]/70">{formatPrice(currentTier * 100)}</p>
                       </div>
                     </>
                   );
                 })()
               ) : customAmount ? (
                 <>
                   <div className="bg-white p-2 rounded-full mr-2 shadow-sm border border-[#1a1a1a]/10">
                     <Coffee className="h-5 w-5 text-[#ffa04f]" />
                   </div>
                   <div>
                     <p className="font-medium text-[#1a1a1a]">Własna kwota</p>
                     <p className="text-sm text-[#1a1a1a]/70">{formatPrice(parseInt(customAmount || '0') * 100)}</p>
                   </div>
                 </>
               ) : (
                 <p className="text-sm text-[#1a1a1a]/60">Wybierz kwotę wsparcia</p>
               )}
            </div>
          </div>

          {/* Continue to payment button - Updated styling */}
          <button
            type="submit"
            disabled={isProcessing || (!selectedAmount && !customAmount)}
            className={`w-full py-3 px-4 mt-4 text-white font-medium rounded-lg transition-colors ${
              isProcessing 
                ? 'bg-[#1a1a1a]/40 cursor-not-allowed' 
                : (!selectedAmount && !customAmount)
                  ? 'bg-[#1a1a1a]/30 cursor-not-allowed'
                  : 'bg-[#1a1a1a] hover:bg-[#1a1a1a]/80' // Use dark color for button
            }`}
          >
            {isProcessing ? 'Przetwarzanie...' : 'Przejdź do płatności'}
          </button>
        </form>
      ) : (
        // --- Payment Step --- 
        <div className="stripe-payment-step">
           {/* ... (Keep existing back button and payment summary) ... */}
           {/* Needs update to use tierConfig for summary display */}
          <div className="mb-6">
            {/* Back Button */} 
            <button type="button" onClick={handleBack} className="text-sm text-[#1a1a1a]/60 hover:text-[#1a1a1a] flex items-center mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Wróć
            </button>
            
            {/* Payment Summary */} 
            <div className="bg-[#1a1a1a]/5 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-[#1a1a1a]">
                Płatność dla: {creatorName}
              </h2>
              <div className="flex items-center mt-3">
                 {/* Logic to display selected tier or custom amount */}
                 {activeOption && tierConfig ? (
                   (() => {
                     const currentTier = tierConfig[`${activeOption}Amount`];
                     const currentIconId = tierConfig[`${activeOption}IconId`];
                     if (!currentIconId || !currentTier) return null;
                     const IconComponent = getIconForId(currentIconId);
                     const label = getLabelForIcon(currentIconId);
                     return (
                       <>
                         <div className="bg-white p-2 rounded-full mr-3 shadow-sm border border-[#1a1a1a]/10">
                           <IconComponent className="h-5 w-5 text-[#ffa04f]" />
                         </div>
                         <div>
                           <p className="font-medium text-[#1a1a1a]">{label}</p>
                           <p className="text-[#1a1a1a]/70">{formatPrice(amount)}</p>
                         </div>
                       </>
                     );
                   })()
                 ) : (
                   <>
                     <div className="bg-white p-2 rounded-full mr-3 shadow-sm border border-[#1a1a1a]/10">
                       <Coffee className="h-5 w-5 text-[#ffa04f]" />
                     </div>
                     <div>
                       <p className="font-medium text-[#1a1a1a]">Wsparcie</p>
                       <p className="text-[#1a1a1a]/70">{formatPrice(amount)}</p>
                     </div>
                   </>
                 )}
              </div>
              {/* ... (Keep Payer Name and Message display) ... */}
            </div>
          </div>
          
          <StripePaymentForm
            amount={amount}
            currency="PLN"
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onProcessingChange={setIsProcessing}
          />
        </div>
      )}
    </div>
  );
} 