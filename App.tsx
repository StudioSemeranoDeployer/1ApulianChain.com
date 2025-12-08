import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShieldCheck, MapPin, Leaf, Award, ArrowRight, 
  MessageCircle, Blocks, Lock, Gamepad2, Brain, Users, CheckCircle, ExternalLink
} from 'lucide-react';
import { Product, ProductType, Course, Member } from './types';
import { Timeline } from './components/Timeline';
import { GeminiAssistant } from './components/GeminiAssistant';

// Declare Leaflet global type for TypeScript
declare const L: any;

// --- MOCK DATA ---

const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Blockchain Architecture',
    description: 'Master Smart Contracts, Solidity, and Supply Chain integration using Hyperledger and Ethereum.',
    icon: 'blockchain',
    duration: '12 Weeks',
    level: 'Advanced'
  },
  {
    id: 'c2',
    title: 'Cyber Security Ops',
    description: 'Defensive strategies, Ethical Hacking, and GDPR compliance for modern enterprise infrastructures.',
    icon: 'security',
    duration: '8 Weeks',
    level: 'Intermediate'
  },
  {
    id: 'c3',
    title: 'Applied Gamification',
    description: 'Learn to drive user engagement and loyalty through tokenomics and behavioral psychology.',
    icon: 'gamification',
    duration: '6 Weeks',
    level: 'Beginner'
  },
  {
    id: 'c4',
    title: 'Artificial Intelligence',
    description: 'From Machine Learning basics to deploying LLMs and predictive analytics for business.',
    icon: 'ai',
    duration: '16 Weeks',
    level: 'Advanced'
  }
];

const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Foggia Tech Hub',
    role: 'Training Center',
    city: 'Foggia',
    description: 'Specialized in AI and Machine Learning research.',
    coordinates: { lat: 41.4626, lng: 15.5430 },
    type: 'educational'
  },
  {
    id: 'm2',
    name: 'Bari Blockchain Lab',
    role: 'Headquarters',
    city: 'Bari',
    description: 'Main campus for blockchain development and smart contract audits.',
    coordinates: { lat: 41.1171, lng: 16.8719 },
    type: 'corporate'
  },
  {
    id: 'm3',
    name: 'Salento Security',
    role: 'Partner',
    city: 'Lecce',
    description: 'Cybersecurity operations center and forensic lab.',
    coordinates: { lat: 40.3515, lng: 18.1750 },
    type: 'tech'
  },
  {
    id: 'm4',
    name: 'Taranto GameDevs',
    role: 'Community',
    city: 'Taranto',
    description: 'Gamification and UI/UX design studio for industrial apps.',
    coordinates: { lat: 40.4764, lng: 17.2343 },
    type: 'tech'
  },
  {
    id: 'm5',
    name: 'Brindisi Logistics',
    role: 'Partner',
    city: 'Brindisi',
    description: 'Supply chain integration testing facility and port logistics.',
    coordinates: { lat: 40.6327, lng: 17.9418 },
    type: 'corporate'
  },
  {
    id: 'm6',
    name: 'Barletta Code School',
    role: 'Education',
    city: 'Barletta',
    description: 'Coding bootcamps for web3 developers.',
    coordinates: { lat: 41.3196, lng: 16.2829 },
    type: 'educational'
  }
];

const MOCK_DB: Record<string, Product> = {
  'AP-2023-8842': {
    id: 'AP-2023-8842',
    name: 'Oro di Puglia - Coratina Reserve',
    type: ProductType.OLIVE_OIL,
    producer: 'Masseria San Domenico',
    origin: 'Andria, Puglia, Italy',
    harvestYear: 2023,
    description: 'An intense, fruity extra virgin olive oil obtained exclusively from Coratina olives. Notes of almond, artichoke, and spicy pepper. Cold pressed within 4 hours of harvest.',
    imageUrl: 'https://picsum.photos/seed/oliveoil/800/600',
    certificates: ['DOP Terra di Bari', 'Organic Certified', 'Carbon Neutral'],
    sustainabilityScore: 94,
    timeline: [
      {
        id: 'e1',
        title: 'Harvest',
        date: 'Oct 24, 2023',
        location: 'Tenuta San Domenico (41.22N, 16.29E)',
        description: 'Hand-picked Coratina olives. Optimal ripeness achieved.',
        icon: 'harvest',
        verified: true,
        hash: '0x7f9a...3b21'
      },
      {
        id: 'e2',
        title: 'Cold Pressing',
        date: 'Oct 24, 2023',
        location: 'Frantoio Ipogeo Moderno',
        description: 'Milled at 24°C within 3 hours of arrival. Acidity: 0.18%.',
        icon: 'press',
        verified: true,
        hash: '0x8c2d...9a12'
      },
      {
        id: 'e3',
        title: 'Quality Analysis',
        date: 'Oct 26, 2023',
        location: 'Lab Certified Puglia',
        description: 'Polyphenol count: 680mg/kg. Peroxides: 4.2.',
        icon: 'store',
        verified: true,
        hash: '0x1d4e...5f89'
      },
      {
        id: 'e4',
        title: 'Bottling & Sealing',
        date: 'Nov 02, 2023',
        location: 'Masseria Bottling Line',
        description: 'Bottled in UV-resistant glass. NFC tag applied.',
        icon: 'bottle',
        verified: true,
        hash: '0x3a1b...7c44'
      },
      {
        id: 'e5',
        title: 'Distribution Center',
        date: 'Nov 15, 2023',
        location: 'Bari Logistics Hub',
        description: 'Stored at controlled temperature (16°C). Ready for export.',
        icon: 'shipping',
        verified: true,
        hash: '0x9f8e...2d33'
      }
    ]
  },
  'AP-2022-1105': {
    id: 'AP-2022-1105',
    name: 'Primitivo di Manduria - "Notte Rossa"',
    type: ProductType.WINE,
    producer: 'Cantine del Salento',
    origin: 'Manduria, Puglia, Italy',
    harvestYear: 2022,
    description: 'Full-bodied red wine with aromas of cherries, plums, and tobacco. Aged 12 months in French oak barrels.',
    imageUrl: 'https://picsum.photos/seed/wine/800/600',
    certificates: ['DOC Primitivo di Manduria', 'Sustainable Agriculture'],
    sustainabilityScore: 88,
    timeline: [
      {
        id: 'w1',
        title: 'Vintage Harvest',
        date: 'Sep 05, 2022',
        location: 'Vigneti Vecchi',
        description: 'Harvested at night to preserve acidity.',
        icon: 'harvest',
        verified: true,
        hash: '0x4b2a...1c99'
      },
      {
        id: 'w2',
        title: 'Fermentation',
        date: 'Sep 07, 2022',
        location: 'Cantine del Salento',
        description: 'Maceration for 18 days at controlled temperature.',
        icon: 'press',
        verified: true,
        hash: '0x5c3d...2e11'
      }
    ]
  }
};

// --- COMPONENTS ---

const Header: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <div className="flex items-center cursor-pointer" onClick={onReset}>
          <div className="bg-olive-700 text-white p-2 rounded mr-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-2xl text-stone-900 leading-none tracking-tight">
              Apulian<span className="text-olive-600">Chain</span>
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-widest">Education & Tech</span>
          </div>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-bold text-stone-600 uppercase tracking-wide">
          <a href="#courses" className="hover:text-olive-700 transition-colors">Courses</a>
          <a href="#network" className="hover:text-olive-700 transition-colors">Network</a>
          <a href="#technology" className="hover:text-olive-700 transition-colors">Technology</a>
        </nav>
        <button className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-olive-700 transition-colors">
          Join Academy
        </button>
      </div>
    </div>
  </header>
);

const InteractiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize map
      // Coordinates for center of Puglia
      const map = L.map(mapRef.current).setView([41.0, 16.9], 8);

      // Add CartoDB Positron tiles (clean, professional look)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Custom Marker Function
      const createCustomIcon = (type: string) => {
        let colorClass = 'bg-blue-500';
        if (type === 'educational') colorClass = 'bg-amber-500';
        if (type === 'corporate') colorClass = 'bg-olive-600';

        return L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative w-6 h-6">
              <div class="absolute inset-0 ${colorClass} rounded-full animate-ping opacity-20"></div>
              <div class="relative w-6 h-6 ${colorClass} border-2 border-white rounded-full shadow-lg"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        });
      };

      // Add Markers
      MOCK_MEMBERS.forEach((member) => {
        const popupContent = `
          <div class="font-sans p-4 min-w-[200px]">
             <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mb-2 inline-block
                ${member.type === 'educational' ? 'bg-amber-100 text-amber-700' : member.type === 'corporate' ? 'bg-olive-100 text-olive-700' : 'bg-blue-100 text-blue-700'}
              ">
                ${member.role}
              </span>
            <h3 class="font-bold text-lg text-stone-900 leading-tight">${member.name}</h3>
            <div class="flex items-center gap-1 text-xs text-stone-500 mt-1 mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${member.city}
            </div>
            <p class="text-xs text-stone-600 leading-relaxed">${member.description}</p>
          </div>
        `;

        L.marker([member.coordinates.lat, member.coordinates.lng], {
          icon: createCustomIcon(member.type)
        })
        .addTo(map)
        .bindPopup(popupContent);
      });

      leafletMap.current = map;
    }

    return () => {
      // Cleanup happens naturally in SPA, but good practice
      // leafletMap.current?.remove(); 
    };
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-stone-100">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[500] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-stone-100 text-xs">
        <h5 className="font-bold text-stone-900 mb-2">Network Legend</h5>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm"></div> 
          <span>Training Center</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-olive-600 border border-white shadow-sm"></div> 
          <span>Corporate Partner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div> 
          <span>Tech Lab</span>
        </div>
      </div>
    </div>
  );
};

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const getIcon = (type: string) => {
    switch(type) {
      case 'blockchain': return <Blocks className="w-8 h-8 text-blue-600" />;
      case 'security': return <Lock className="w-8 h-8 text-red-600" />;
      case 'gamification': return <Gamepad2 className="w-8 h-8 text-purple-600" />;
      case 'ai': return <Brain className="w-8 h-8 text-emerald-600" />;
      default: return <Blocks className="w-8 h-8" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-stone-50 rounded-xl inline-block group-hover:bg-white border border-transparent group-hover:border-stone-100 transition-colors">
          {getIcon(course.icon)}
        </div>
        <div className="bg-stone-50 rounded-full p-2 group-hover:bg-olive-50 transition-colors">
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-olive-600" />
        </div>
      </div>
      
      <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-olive-700 transition-colors mb-2">
        {course.title}
      </h3>
      <p className="text-stone-500 text-sm leading-relaxed mb-6 min-h-[60px]">
        {course.description}
      </p>
      <div className="flex items-center justify-between text-xs font-medium text-stone-400 border-t border-stone-100 pt-4">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-olive-500" /> {course.level}
        </span>
        <span className="flex items-center gap-1">
           {course.duration}
        </span>
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-stone-900 text-stone-400 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-olive-500" />
            <span className="font-serif font-bold text-xl text-white">ApulianChain</span>
          </div>
          <p className="text-sm leading-relaxed mb-6 text-stone-500">
            Empowering Puglia through advanced technology education, blockchain solutions, and digital transformation.
          </p>
          <div className="flex space-x-3">
            {['Li', 'X', 'Fb', 'Ig'].map((social) => (
              <div key={social} className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center hover:bg-olive-600 transition-colors cursor-pointer text-white text-xs font-bold">
                {social}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Education</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-olive-400 transition-colors">All Courses</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Corporate Training</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Summer Bootcamps</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Scholarships</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Network</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-olive-400 transition-colors">Our Partners</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Success Stories</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Become a Member</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Job Board</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-olive-500 mt-0.5" />
              <span>Via Sparano da Bari 10,<br/>70121 Bari, Italy</span>
            </li>
            <li className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-olive-500" />
              <span>info@apulianchain.it</span>
            </li>
            <li className="text-olive-500 font-bold">+39 080 123 4567</li>
          </ul>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center text-xs text-stone-600">
        <p>© 2024 ApulianChain Technology S.r.l. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-stone-400">Privacy Policy</a>
          <a href="#" className="hover:text-stone-400">Terms of Service</a>
          <a href="#" className="hover:text-stone-400">Cookie Settings</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [productId, setProductId] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) return;

    const product = MOCK_DB[productId.trim()];
    if (product) {
      setCurrentProduct(product);
      setError('');
      window.scrollTo(0, 0);
    } else {
      setError('ID not found. Try "AP-2023-8842"');
    }
  };

  const handleReset = () => {
    setCurrentProduct(null);
    setProductId('');
    setError('');
    setIsChatOpen(false);
  };

  // IF PRODUCT IS SELECTED, SHOW DETAIL VIEW
  if (currentProduct) {
    return (
      <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50">
        <Header onReset={handleReset} />
        
        {/* Breadcrumb / Top Bar */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <button onClick={handleReset} className="hover:text-olive-700">Home</button>
              <span>/</span>
              <span>Verification Demo</span>
              <span>/</span>
              <span className="text-stone-900 font-medium">{currentProduct.id}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Column: Product Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-stone-100">
                <div className="relative h-80 overflow-hidden group">
                  <img 
                    src={currentProduct.imageUrl} 
                    alt={currentProduct.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm text-stone-900">
                    {currentProduct.type}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">{currentProduct.name}</h1>
                      <p className="text-stone-500 font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {currentProduct.origin}
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-green-50 border border-green-100 rounded-lg p-3 w-20">
                        <span className="text-2xl font-bold text-green-700">{currentProduct.sustainabilityScore}</span>
                        <span className="text-[10px] uppercase font-bold text-green-600">Eco Score</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-stone mb-6">
                    <p>{currentProduct.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {currentProduct.certificates.map(cert => (
                      <span key={cert} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold">
                        <Award className="w-3 h-3" /> {cert}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-stone-400 uppercase tracking-wider">Producer</span>
                        <p className="font-serif font-semibold text-stone-800">{currentProduct.producer}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 uppercase tracking-wider">Harvest Year</span>
                        <p className="font-serif font-semibold text-stone-800">{currentProduct.harvestYear}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Assistant Call to Action */}
              <div className="bg-gradient-to-br from-olive-800 to-olive-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-2xl mb-2">Have questions?</h3>
                  <p className="text-olive-100 mb-6 max-w-xs">
                    Our AI Concierge can suggest recipes, pairings, and tell you more about the history of this product.
                  </p>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="bg-white text-olive-900 px-6 py-3 rounded-full font-bold hover:bg-olive-50 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat with Concierge
                  </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-olive-400/20 rounded-full blur-xl"></div>
              </div>
            </div>

            {/* Right Column: Timeline */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-lg border border-stone-100 p-8 h-full">
                <div className="mb-10">
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Supply Chain Journey</h2>
                  <p className="text-stone-500">Real-time immutable tracking from production to distribution.</p>
                </div>
                <Timeline events={currentProduct.timeline} />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Chat Assistant */}
        {isChatOpen && (
          <GeminiAssistant 
            product={currentProduct} 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
        
        <Footer />
      </div>
    );
  }

  // DEFAULT LANDING PAGE
  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800">
      <Header onReset={handleReset} />

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-stone-50">
          <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#558247_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-100 border border-olive-200 text-olive-800 text-xs font-bold uppercase tracking-wide mb-6">
                  <span className="w-2 h-2 rounded-full bg-olive-600 animate-pulse"></span>
                  Enrollment Open for 2024
                </div>
                <h1 className="text-5xl lg:text-7xl font-serif font-bold text-stone-900 mb-6 leading-none">
                  Innovate in <br />
                  <span className="text-olive-600 italic">Puglia</span>
                </h1>
                <p className="text-xl text-stone-600 mb-10 leading-relaxed max-w-lg">
                  The leading educational ecosystem for <strong>Blockchain</strong>, <strong>Cyber Security</strong>, <strong>Gamification</strong>, and <strong>AI</strong> in Southern Italy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-olive-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                    Explore Courses <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="bg-white text-stone-900 border border-stone-200 px-8 py-4 rounded-full font-bold hover:bg-stone-50 transition-colors">
                    Meet Our Partners
                  </button>
                </div>
              </div>
              
              {/* Abstract decorative element */}
              <div className="relative hidden lg:block">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-olive-200/50 to-blue-200/50 rounded-full blur-3xl"></div>
                <div className="relative bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-xl rotate-3">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                         <Brain className="w-8 h-8 text-emerald-600 mb-2" />
                         <div className="h-2 w-12 bg-stone-100 rounded mb-2"></div>
                         <div className="h-2 w-20 bg-stone-100 rounded"></div>
                      </div>
                      <div className="bg-stone-900 p-6 rounded-2xl shadow-sm text-white hover:shadow-md transition-shadow">
                         <Blocks className="w-8 h-8 text-blue-400 mb-2" />
                         <div className="h-2 w-12 bg-stone-700 rounded mb-2"></div>
                         <div className="h-2 w-20 bg-stone-700 rounded"></div>
                      </div>
                      <div className="bg-olive-600 p-6 rounded-2xl shadow-sm text-white hover:shadow-md transition-shadow">
                         <Gamepad2 className="w-8 h-8 text-yellow-300 mb-2" />
                         <div className="h-2 w-12 bg-olive-500 rounded mb-2"></div>
                         <div className="h-2 w-20 bg-olive-500 rounded"></div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                         <Lock className="w-8 h-8 text-red-500 mb-2" />
                         <div className="h-2 w-12 bg-stone-100 rounded mb-2"></div>
                         <div className="h-2 w-20 bg-stone-100 rounded"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COURSES SECTION */}
        <section id="courses" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="max-w-2xl">
                   <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Educational Tracks</h2>
                   <p className="text-stone-500 text-lg">
                     Comprehensive curriculum designed by industry experts to launch your career in the most in-demand tech sectors.
                   </p>
                </div>
                <a href="#" className="text-olive-600 font-bold flex items-center gap-2 hover:underline">
                  View Full Catalog <ArrowRight className="w-4 h-4" />
                </a>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_COURSES.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
             </div>
          </div>
        </section>

        {/* MAP / NETWORK SECTION */}
        <section id="network" className="py-24 bg-stone-50 overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-olive-100 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -ml-48 -mb-48"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 h-full flex flex-col justify-center">
                 <InteractiveMap />
              </div>
              <div className="order-1 lg:order-2">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6">
                    <Users className="w-4 h-4" />
                    Our Ecosystem
                 </div>
                 <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">
                   Rooted in Puglia,<br/>Connected Globally.
                 </h2>
                 <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                   ApulianChain is more than a platform; it's a living network of <strong>partners</strong>, <strong>innovators</strong>, and <strong>students</strong>. Explore our interactive map to find training centers and corporate partners near you.
                 </p>
                 <div className="space-y-6">
                    <div className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-stone-100">
                       <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 font-bold">12</div>
                       <div>
                          <h4 className="font-bold text-stone-900">Training Centers</h4>
                          <p className="text-sm text-stone-500">Located in Foggia, Bari, Taranto, Brindisi, and Lecce.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-stone-100">
                       <div className="flex-shrink-0 w-12 h-12 bg-olive-50 rounded-full flex items-center justify-center text-olive-600 font-bold">50+</div>
                       <div>
                          <h4 className="font-bold text-stone-900">Corporate Partners</h4>
                          <p className="text-sm text-stone-500">Providing internships, real-world use cases, and hiring opportunities.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY SHOWCASE (Original Search) */}
        <section id="technology" className="py-24 bg-stone-900 text-stone-300 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <div className="max-w-3xl mx-auto">
               <ShieldCheck className="w-16 h-16 text-olive-500 mx-auto mb-6" />
               <h2 className="text-4xl font-serif font-bold text-white mb-6">Technology Showcase</h2>
               <p className="text-lg text-stone-400 mb-10">
                 See our technology in action. Verify a student certificate or track the provenance of a certified Apulian product using our blockchain explorer.
               </p>

               {/* Search Box */}
               <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-8">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-stone-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-14 pr-32 py-5 rounded-full border-0 text-lg bg-stone-800 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-inset focus:ring-olive-600 transition-all shadow-xl"
                    placeholder="Enter ID (e.g. AP-2023-8842)"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-olive-600 text-white px-6 rounded-full font-medium hover:bg-olive-500 transition-colors flex items-center gap-2"
                  >
                    Verify
                  </button>
                </form>
                {error && <p className="mb-6 text-red-400 font-medium">{error}</p>}

                <p className="text-sm text-stone-500">
                  Demo Product ID: <button onClick={() => setProductId('AP-2023-8842')} className="text-olive-500 hover:underline">AP-2023-8842</button>
                </p>
             </div>
          </div>
        </section>

      </main>
    </div>
  );
}