import React from 'react';
import { 
  Droplets, Coffee, Waves, Sandwich, UtensilsCrossed, Soup, 
  Pill, Stethoscope, Ambulance, Leaf, TreePine, Mountain, Wind, 
  Sprout, TreeDeciduous, Bird, Users, Globe, PenTool, BookOpen, 
  Backpack, Monitor, Laptop, GraduationCap, Utensils, Bone, Home, 
  Palette, Brush, Building, LucideIcon, Heart, Shirt, School,
  Apple, Pizza, Activity, 
  HeartHandshake, CloudRain, Sunset, Footprints, Dog, Cat,
  BrainCircuit, PencilRuler, BookMarked, Microscope, Gamepad2, Code,
  Smartphone, Trophy, Medal, Music, Piano, Drum, Film, Camera,
  PaintBucket, ShoppingBag, Gift, Phone, Mail, Send
} from 'lucide-react';

// Define alternative icons for those not available in lucide-react
const MedicalCross = Activity; // Using Activity icon as alternative
const FirstAid = Pill; // Using Pill icon as alternative
const Plant = Sprout; // Using Sprout icon as alternative
const Paw = Footprints; // Using Footprints icon as alternative
const Garden = Leaf; // Using Leaf icon as alternative
const Lungs = Activity; // Using Activity icon as alternative
const Flamingo = Bird; // Using Bird icon as alternative
const Beef = Pizza; // Using Pizza icon as alternative
const HandHeart = HeartHandshake; // Using HeartHandshake as alternative
const Trees = TreeDeciduous; // Using TreeDeciduous as alternative
const Library = BookMarked; // Using BookMarked as alternative

export interface IconItem {
  id: string;
  icon: LucideIcon;
  label: string;
  tier: 'small' | 'medium' | 'large';
  categoryId: string;
  categoryName: string;
  categoryIcon: LucideIcon;
}

export interface IconCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  icons: {
    id: string;
    icon: LucideIcon;
    label: string;
    tier: 'small' | 'medium' | 'large';
  }[];
}

// Define the categorized icons using Lucide components
export const DONATION_CATEGORIES: IconCategory[] = [
  {
    id: 'humanitarian',
    name: 'Pomoc humanitarna',
    icon: Globe,
    icons: [
      { id: 'water_sip', icon: Droplets, label: 'Łyk wody', tier: 'small' },
      { id: 'bread', icon: Sandwich, label: 'Bochenek chleba', tier: 'small' },
      { id: 'clothes', icon: Shirt, label: 'Ubrania', tier: 'small' },
      { id: 'shelter', icon: Home, label: 'Schronienie', tier: 'small' },
      
      { id: 'water_bottle', icon: Coffee, label: 'Butelka wody', tier: 'medium' },
      { id: 'hope_kit', icon: HeartHandshake, label: 'Paczka nadziei', tier: 'medium' },
      { id: 'emergency_aid', icon: Heart, label: 'Pomoc doraźna', tier: 'medium' },
      
      { id: 'village_well', icon: Waves, label: 'Studnia dla wioski', tier: 'large' },
      { id: 'aid_program', icon: Users, label: 'Program pomocowy', tier: 'large' },
      { id: 'community_help', icon: Building, label: 'Odbudowa społeczności', tier: 'large' }
    ]
  },
  {
    id: 'food',
    name: 'Nakarm kogoś',
    icon: UtensilsCrossed,
    icons: [
      { id: 'sandwich', icon: Sandwich, label: 'Kanapka dla dziecka', tier: 'small' },
      { id: 'apple', icon: Apple, label: 'Owoce na przerwę', tier: 'small' },
      { id: 'snack', icon: Coffee, label: 'Przekąska', tier: 'small' },
      
      { id: 'warm_meal', icon: UtensilsCrossed, label: 'Ciepły posiłek', tier: 'medium' },
      { id: 'pizza', icon: Pizza, label: 'Pizza dla rodziny', tier: 'medium' },
      { id: 'grocery', icon: ShoppingBag, label: 'Zakupy spożywcze', tier: 'medium' },
      
      { id: 'family_meals', icon: Soup, label: 'Obiady dla rodziny', tier: 'large' },
      { id: 'food_for_month', icon: Beef, label: 'Wyżywienie na miesiąc', tier: 'large' },
      { id: 'community_kitchen', icon: UtensilsCrossed, label: 'Kuchnia społeczna', tier: 'large' }
    ]
  },
  {
    id: 'medical',
    name: 'Pomóż w leczeniu',
    icon: Stethoscope,
    icons: [
      { id: 'first_aid', icon: FirstAid, label: 'Leki na pierwszą pomoc', tier: 'small' },
      { id: 'vitamins', icon: MedicalCross, label: 'Witaminy', tier: 'small' },
      { id: 'bandages', icon: FirstAid, label: 'Opatrunki', tier: 'small' },
      
      { id: 'doctor_visit', icon: Stethoscope, label: 'Wizyta u lekarza', tier: 'medium' },
      { id: 'therapy', icon: Heart, label: 'Sesja terapeutyczna', tier: 'medium' },
      { id: 'health_exam', icon: Activity, label: 'Badania zdrowotne', tier: 'medium' },
      
      { id: 'life_saving', icon: Ambulance, label: 'Ratowanie życia', tier: 'large' },
      { id: 'surgery', icon: Lungs, label: 'Operacja', tier: 'large' },
      { id: 'medical_equipment', icon: MedicalCross, label: 'Sprzęt medyczny', tier: 'large' }
    ]
  },
  {
    id: 'ecology',
    name: 'Ekologia i planeta',
    icon: Leaf,
    icons: [
      { id: 'small_plant', icon: Sprout, label: 'Mała sadzonka', tier: 'small' },
      { id: 'seed', icon: Leaf, label: 'Ziarno przyszłości', tier: 'small' },
      { id: 'recycling', icon: Wind, label: 'Recykling', tier: 'small' },
      
      { id: 'tree', icon: TreePine, label: 'Dojrzałe drzewo', tier: 'medium' },
      { id: 'garden', icon: Garden, label: 'Ogród społeczny', tier: 'medium' },
      { id: 'clean_river', icon: Waves, label: 'Oczyszczanie rzeki', tier: 'medium' },
      
      { id: 'forest', icon: Trees, label: 'Cały las', tier: 'large' },
      { id: 'ecosystem', icon: Mountain, label: 'Odnowa ekosystemu', tier: 'large' },
      { id: 'conservation', icon: Trees, label: 'Program ochrony', tier: 'large' }
    ]
  },
  {
    id: 'nature',
    name: 'Chroń naturę',
    icon: Wind,
    icons: [
      { id: 'green_leaf', icon: Leaf, label: 'Zielony listek', tier: 'small' },
      { id: 'rain_drop', icon: Droplets, label: 'Kropla deszczu', tier: 'small' },
      { id: 'clean_air', icon: Wind, label: 'Czyste powietrze', tier: 'small' },
      
      { id: 'new_plant', icon: Sprout, label: 'Nowa roślina', tier: 'medium' }, 
      { id: 'water_cleaning', icon: CloudRain, label: 'Oczyszczanie wody', tier: 'medium' },
      { id: 'nature_education', icon: BookOpen, label: 'Edukacja ekologiczna', tier: 'medium' },
      
      { id: 'natural_renewal', icon: Mountain, label: 'Odnowa naturalnego środowiska', tier: 'large' },
      { id: 'park_creation', icon: Sunset, label: 'Tworzenie parku', tier: 'large' },
      { id: 'wilderness', icon: Trees, label: 'Ochrona dzikich terenów', tier: 'large' }
    ]
  },
  {
    id: 'animals',
    name: 'Ratuj zwierzęta',
    icon: Bird,
    icons: [
      { id: 'bird_nest', icon: Bird, label: 'Pisklę w gnieździe', tier: 'small' },
      { id: 'cat_food', icon: Cat, label: 'Karma dla kota', tier: 'small' },
      { id: 'dog_walk', icon: Paw, label: 'Spacer z psem', tier: 'small' },
      
      { id: 'animal_family', icon: Users, label: 'Opieka nad rodziną zwierząt', tier: 'medium' },
      { id: 'vet_visit', icon: Dog, label: 'Wizyta u weterynarza', tier: 'medium' },
      { id: 'shelter_support', icon: Home, label: 'Wsparcie schroniska', tier: 'medium' },
      
      { id: 'reserve', icon: Globe, label: 'Ochrona rezerwatu', tier: 'large' },
      { id: 'endangered', icon: Flamingo, label: 'Ratowanie zagrożonych gatunków', tier: 'large' },
      { id: 'wildlife_program', icon: Paw, label: 'Program dla dzikich zwierząt', tier: 'large' }
    ]
  },
  {
    id: 'education',
    name: 'Edukacja dla każdego',
    icon: BookOpen,
    icons: [
      { id: 'notebook', icon: PenTool, label: 'Zeszyt i długopis', tier: 'small' },
      { id: 'pencil', icon: PencilRuler, label: 'Przybory szkolne', tier: 'small' },
      { id: 'book', icon: BookOpen, label: 'Książka edukacyjna', tier: 'small' },
      
      { id: 'textbook', icon: BookOpen, label: 'Podręcznik szkolny', tier: 'medium' },
      { id: 'library_visit', icon: Library, label: 'Dostęp do biblioteki', tier: 'medium' },
      { id: 'science_kit', icon: Microscope, label: 'Zestaw naukowy', tier: 'medium' },
      
      { id: 'school_supplies', icon: Backpack, label: 'Cała wyprawka', tier: 'large' },
      { id: 'school_year', icon: School, label: 'Rok nauki', tier: 'large' },
      { id: 'learning_center', icon: Building, label: 'Centrum nauki', tier: 'large' }
    ]
  },
  {
    id: 'online_learning',
    name: 'Dostęp do nauki',
    icon: Monitor,
    icons: [
      { id: 'online_hour', icon: Monitor, label: 'Godzina nauki online', tier: 'small' },
      { id: 'coding_lesson', icon: Code, label: 'Lekcja programowania', tier: 'small' },
      { id: 'e_book', icon: Smartphone, label: 'E-book edukacyjny', tier: 'small' },
      
      { id: 'laptop', icon: Laptop, label: 'Laptop dla ucznia', tier: 'medium' },
      { id: 'online_course', icon: BrainCircuit, label: 'Kurs online', tier: 'medium' },
      { id: 'digital_tools', icon: Gamepad2, label: 'Narzędzia cyfrowe', tier: 'medium' },
      
      { id: 'scholarship', icon: GraduationCap, label: 'Stypendium edukacyjne', tier: 'large' },
      { id: 'tech_education', icon: Code, label: 'Edukacja technologiczna', tier: 'large' },
      { id: 'digital_academy', icon: Trophy, label: 'Akademia cyfrowa', tier: 'large' }
    ]
  },
  {
    id: 'pet_help',
    name: 'Pomoc dla zwierząt',
    icon: Bone,
    icons: [
      { id: 'pet_food', icon: Utensils, label: 'Puszka karmy', tier: 'small' },
      { id: 'pet_toy', icon: Bone, label: 'Zabawka dla zwierzaka', tier: 'small' },
      { id: 'pet_treat', icon: Gift, label: 'Przysmak', tier: 'small' },
      
      { id: 'pet_bed', icon: Bone, label: 'Legowisko i leczenie', tier: 'medium' },
      { id: 'pet_grooming', icon: Cat, label: 'Pielęgnacja', tier: 'medium' },
      { id: 'pet_medicine', icon: Pill, label: 'Leki dla zwierzaka', tier: 'medium' },
      
      { id: 'pet_care', icon: Home, label: 'Opieka przez rok', tier: 'large' },
      { id: 'pet_surgery', icon: MedicalCross, label: 'Operacja zwierzaka', tier: 'large' },
      { id: 'shelter_renovation', icon: Building, label: 'Remont schroniska', tier: 'large' }
    ]
  },
  {
    id: 'arts',
    name: 'Kultura i sztuka',
    icon: Palette,
    icons: [
      { id: 'art_supplies', icon: Palette, label: 'Pędzel i farby', tier: 'small' },
      { id: 'music_lesson', icon: Music, label: 'Lekcja muzyki', tier: 'small' },
      { id: 'theater_ticket', icon: Film, label: 'Bilet do teatru', tier: 'small' },
      
      { id: 'art_project', icon: Brush, label: 'Wsparcie jednego projektu', tier: 'medium' },
      { id: 'instrument', icon: Piano, label: 'Instrument muzyczny', tier: 'medium' },
      { id: 'photography', icon: Camera, label: 'Sprzęt fotograficzny', tier: 'medium' },
      
      { id: 'art_festival', icon: Building, label: 'Festiwal sztuki', tier: 'large' },
      { id: 'creative_space', icon: PaintBucket, label: 'Przestrzeń kreatywna', tier: 'large' },
      { id: 'cultural_program', icon: Drum, label: 'Program kulturalny', tier: 'large' }
    ]
  },
  {
    id: 'communication',
    name: 'Komunikacja',
    icon: Send,
    icons: [
      { id: 'phone_call', icon: Phone, label: 'Rozmowa telefoniczna', tier: 'small' },
      { id: 'text_message', icon: Mail, label: 'Wiadomość', tier: 'small' },
      { id: 'internet_hour', icon: Globe, label: 'Godzina internetu', tier: 'small' },
      
      { id: 'mobile_data', icon: Smartphone, label: 'Pakiet danych', tier: 'medium' },
      { id: 'weekly_plan', icon: Send, label: 'Tygodniowy plan', tier: 'medium' },
      { id: 'smartphone', icon: Phone, label: 'Smartfon', tier: 'medium' },
      
      { id: 'year_connection', icon: Globe, label: 'Rok łączności', tier: 'large' },
      { id: 'communication_center', icon: Smartphone, label: 'Centrum komunikacji', tier: 'large' },
      { id: 'tech_access', icon: Send, label: 'Dostęp do technologii', tier: 'large' }
    ]
  }
];

// Flatten the list for easier lookup
export const ALL_ICONS: IconItem[] = DONATION_CATEGORIES.flatMap(category => 
  category.icons.map(icon => ({
    ...icon,
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon
  }))
); 