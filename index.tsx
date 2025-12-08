import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";
import { 
  Search, ShieldCheck, MapPin, Leaf, Award, ArrowRight, 
  MessageCircle, Blocks, Lock, Gamepad2, Brain, Users, CheckCircle, ExternalLink,
  Sprout, Factory, Wine, Truck, Store, CheckCircle2,
  Send, Sparkles, X, Loader2, Bot, ChevronLeft, ChevronRight, Linkedin
} from 'lucide-react';

// --- TYPES ---

export enum ProductType {
  OLIVE_OIL = 'Olio Extra Vergine',
  WINE = 'Vino',
  PASTA = 'Pasta',
  CHEESE = 'Formaggio'
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  icon: 'harvest' | 'press' | 'bottle' | 'shipping' | 'store';
  verified: boolean;
  hash: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  producer: string;
  origin: string;
  harvestYear: number;
  description: string;
  imageUrl: string;
  timeline: TimelineEvent[];
  certificates: string[];
  sustainabilityScore: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: 'blockchain' | 'security' | 'gamification' | 'ai';
  duration: string;
  level: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  city: string;
  description: string;
  coordinates: { lat: number; lng: number };
  type: 'educational' | 'corporate' | 'tech';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

// --- SERVICES ---

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI;
  private model: string = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  public createProductChat(product: Product): Chat {
    const systemInstruction = `
      Sei il "Concierge di ApulianChain", un assistente IA dedicato ai prodotti agricoli d'eccellenza della Puglia, Italia.
      
      Stai assistendo un utente che visualizza un prodotto verificato su blockchain.
      
      Dettagli Prodotto:
      - Nome: ${product.name}
      - Tipo: ${product.type}
      - Produttore: ${product.producer}
      - Origine: ${product.origin}
      - Anno: ${product.harvestYear}
      - Punteggio Sostenibilità: ${product.sustainabilityScore}/100
      
      Il tuo obiettivo è:
      1. Rispondere a domande sul viaggio, l'autenticità e la qualità di questo specifico prodotto.
      2. Suggerire abbinamenti gastronomici e ricette tipiche pugliesi che si sposano bene con questo prodotto.
      3. Spiegare il significato culturale del prodotto.
      
      Tono: Elegante, competente, caloroso e affidabile. Usa la formattazione come elenchi puntati per le ricette.
      Rispondi sempre in ITALIANO.
    `;

    return this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
  }

  public createAcademyChat(): Chat {
    const systemInstruction = `
      Sei la "Guida dell'Academy ApulianChain", un assistente intelligente per il principale polo tecnologico ed educativo della Puglia.
      
      Su ApulianChain:
      - Missione: Potenziare il Sud Italia attraverso la formazione in Blockchain, Cyber Security, Gamification e AI.
      - Ecosistema: Una rete di centri di formazione, partner aziendali e laboratori tecnologici in tutta la Puglia.
      
      Corsi Offerti:
      1. Architettura Blockchain (Avanzato, 12 Settimane) - Smart Contracts, Solidity, Hyperledger.
      2. Cyber Security Ops (Intermedio, 8 Settimane) - Ethical Hacking, Difesa, GDPR.
      3. Gamification Applicata (Base, 6 Settimane) - Strategie di coinvolgimento, Tokenomics, UI/UX.
      4. Intelligenza Artificiale (Avanzato, 16 Settimane) - Machine Learning, LLMs, Data Science.
      
      Il tuo obiettivo è:
      1. Aiutare i futuri studenti a scegliere il corso giusto in base ai loro interessi o obiettivi di carriera.
      2. Spiegare le tecnologie che insegniamo (es. "Perché imparare la Blockchain?").
      3. Fornire informazioni sulla rete dei nostri partner (Bari, Foggia, Lecce, Taranto, Brindisi).
      
      Tono: Professionale, innovativo, incoraggiante e disponibile.
      Rispondi sempre in ITALIANO.
    `;

    return this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
  }

  public async sendMessage(chat: Chat, message: string): Promise<string> {
    try {
      const response = await chat.sendMessage({ message });
      return response.text || "Mi scuso, non riesco a generare una risposta al momento.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Ho problemi a connettermi alla knowledge base di ApulianChain al momento. Riprova più tardi.";
    }
  }
}

const geminiService = new GeminiService();

// --- COMPONENTS ---

// Timeline Component
interface TimelineProps {
  events: TimelineEvent[];
}

const getTimelineIcon = (type: string) => {
  switch (type) {
    case 'harvest': return <Sprout className="w-5 h-5" />;
    case 'press': return <Factory className="w-5 h-5" />;
    case 'bottle': return <Wine className="w-5 h-5" />; 
    case 'shipping': return <Truck className="w-5 h-5" />;
    case 'store': return <Store className="w-5 h-5" />;
    default: return <CheckCircle2 className="w-5 h-5" />;
  }
};

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="relative border-l-2 border-olive-200 ml-4 md:ml-6 space-y-12 my-8">
      {events.map((event) => (
        <div key={event.id} className="relative pl-8 md:pl-12 group">
          <div className="absolute -left-[11px] top-0 bg-stone-50 border-2 border-olive-500 rounded-full p-1.5 text-olive-700 transition-transform duration-300 group-hover:scale-110 group-hover:bg-olive-50">
            {getTimelineIcon(event.icon)}
          </div>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between bg-white p-5 rounded-lg shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-olive-600 mb-1 block">
                {event.date}
              </span>
              <h3 className="text-lg font-serif font-semibold text-stone-900 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-stone-500 mb-2 flex items-center gap-1">
                <span className="font-medium">Luogo:</span> {event.location}
              </p>
              <p className="text-stone-700 leading-relaxed text-sm">
                {event.description}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex items-center md:flex-col md:items-end gap-2 text-xs text-stone-400">
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-semibold">Verificato</span>
              </div>
              <span className="font-mono text-[10px] break-all max-w-[150px] text-right opacity-60">
                Tx: {event.hash.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Gemini Assistant Component
interface GeminiAssistantProps {
  mode: 'academy' | 'product';
  product?: Product;
  onClose: () => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ mode, product, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'product' && product) {
      chatSessionRef.current = geminiService.createProductChat(product);
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: `Buongiorno! Sono il tuo concierge ApulianChain. So tutto su questo **${product.name}**. Chiedimi pure dell'origine, delle certificazioni o come abbinarlo a tavola.`,
        timestamp: Date.now()
      }]);
    } else {
      chatSessionRef.current = geminiService.createAcademyChat();
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: `Benvenuto all'ApulianChain Academy! Posso aiutarti a trovare il corso perfetto in **Blockchain**, **IA** o **Cyber Security**, o darti informazioni sulla nostra rete di partner in Puglia. Cosa vorresti sapere?`,
        timestamp: Date.now()
      }]);
    }
  }, [mode, product]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await geminiService.sendMessage(chatSessionRef.current, userMsg.text);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
        console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-stone-200 z-[1000] overflow-hidden font-sans">
      <div className="bg-olive-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === 'academy' ? <Bot className="w-5 h-5 text-blue-300" /> : <Sparkles className="w-5 h-5 text-yellow-400" />}
          <div>
            <h3 className="font-serif font-bold text-lg leading-none">
              {mode === 'academy' ? 'Academy Guide' : 'Product Concierge'}
            </h3>
            <p className="text-xs text-olive-200">Powered by Gemini AI</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-olive-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-olive-600 text-white rounded-tr-sm' 
                  : 'bg-white text-stone-800 border border-stone-100 rounded-tl-sm'}
              `}
            >
              {msg.role === 'model' ? (
                 <div className="markdown-prose" dangerouslySetInnerHTML={{ 
                    __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^- (.*)/gm, '• $1')
                 }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-stone-100">
              <Loader2 className="w-5 h-5 animate-spin text-olive-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-white border-t border-stone-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={mode === 'academy' ? "Chiedi sui corsi..." : "Chiedi una ricetta..."}
            className="w-full pl-4 pr-12 py-3 bg-stone-100 rounded-full text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-olive-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-olive-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] text-center text-stone-400 mt-2">
            L'IA può commettere errori. Verifica le informazioni.
        </div>
      </div>
    </div>
  );
};

// --- MOCK DATA ---

const MOCK_TEAM: TeamMember[] = [
    { id: 't1', name: 'Alessandro Rossi', role: 'CEO & Founder', imageUrl: 'https://i.pravatar.cc/300?img=11' },
    { id: 't2', name: 'Giulia Bianchi', role: 'CTO', imageUrl: 'https://i.pravatar.cc/300?img=5' },
    { id: 't3', name: 'Marco Verdi', role: 'Head of AI', imageUrl: 'https://i.pravatar.cc/300?img=3' },
    { id: 't4', name: 'Sofia Esposito', role: 'Blockchain Lead', imageUrl: 'https://i.pravatar.cc/300?img=9' },
    { id: 't5', name: 'Luca Romano', role: 'Security Specialist', imageUrl: 'https://i.pravatar.cc/300?img=8' },
    { id: 't6', name: 'Chiara Ricci', role: 'Gamification Expert', imageUrl: 'https://i.pravatar.cc/300?img=1' },
    { id: 't7', name: 'Andrea Moretti', role: 'Full Stack Dev', imageUrl: 'https://i.pravatar.cc/300?img=13' },
    { id: 't8', name: 'Elena Ferrari', role: 'Marketing Director', imageUrl: 'https://i.pravatar.cc/300?img=20' },
    { id: 't9', name: 'Davide Gallo', role: 'Legal Tech', imageUrl: 'https://i.pravatar.cc/300?img=14' },
    { id: 't10', name: 'Sara Conti', role: 'HR Manager', imageUrl: 'https://i.pravatar.cc/300?img=24' },
    { id: 't11', name: 'Matteo De Luca', role: 'Lead Researcher', imageUrl: 'https://i.pravatar.cc/300?img=60' }
];

const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Architettura Blockchain',
    description: 'Padroneggia Smart Contracts, Solidity e integrazione della Supply Chain con Hyperledger ed Ethereum.',
    icon: 'blockchain',
    duration: '12 Settimane',
    level: 'Avanzato'
  },
  {
    id: 'c2',
    title: 'Cyber Security Ops',
    description: 'Strategie difensive, Ethical Hacking e conformità GDPR per le moderne infrastrutture aziendali.',
    icon: 'security',
    duration: '8 Settimane',
    level: 'Intermedio'
  },
  {
    id: 'c3',
    title: 'Gamification Applicata',
    description: 'Impara a guidare il coinvolgimento e la fidelizzazione degli utenti attraverso la tokenomics e la psicologia comportamentale.',
    icon: 'gamification',
    duration: '6 Settimane',
    level: 'Base'
  },
  {
    id: 'c4',
    title: 'Intelligenza Artificiale',
    description: 'Dalle basi del Machine Learning all\'implementazione di LLM e analisi predittiva per il business.',
    icon: 'ai',
    duration: '16 Settimane',
    level: 'Avanzato'
  }
];

const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Foggia Tech Hub',
    role: 'Centro Formazione',
    city: 'Foggia',
    description: 'Specializzato in ricerca AI e Machine Learning.',
    coordinates: { lat: 41.4626, lng: 15.5430 },
    type: 'educational'
  },
  {
    id: 'm2',
    name: 'Bari Blockchain Lab',
    role: 'Quartier Generale',
    city: 'Bari',
    description: 'Campus principale per sviluppo blockchain e audit di smart contract.',
    coordinates: { lat: 41.1171, lng: 16.8719 },
    type: 'corporate'
  },
  {
    id: 'm3',
    name: 'Salento Security',
    role: 'Partner',
    city: 'Lecce',
    description: 'Centro operativo di cybersicurezza e laboratorio forense.',
    coordinates: { lat: 40.3515, lng: 18.1750 },
    type: 'tech'
  },
  {
    id: 'm4',
    name: 'Taranto GameDevs',
    role: 'Community',
    city: 'Taranto',
    description: 'Gamification e studio di design UI/UX per app industriali.',
    coordinates: { lat: 40.4764, lng: 17.2343 },
    type: 'tech'
  },
  {
    id: 'm5',
    name: 'Brindisi Logistics',
    role: 'Partner',
    city: 'Brindisi',
    description: 'Struttura di test per l\'integrazione della supply chain e logistica portuale.',
    coordinates: { lat: 40.6327, lng: 17.9418 },
    type: 'corporate'
  },
  {
    id: 'm6',
    name: 'Barletta Code School',
    role: 'Istruzione',
    city: 'Barletta',
    description: 'Bootcamp di programmazione per sviluppatori web3.',
    coordinates: { lat: 41.3196, lng: 16.2829 },
    type: 'educational'
  }
];

const MOCK_DB: Record<string, Product> = {
  'AP-2023-8842': {
    id: 'AP-2023-8842',
    name: 'Oro di Puglia - Riserva Coratina',
    type: ProductType.OLIVE_OIL,
    producer: 'Masseria San Domenico',
    origin: 'Andria, Puglia, Italia',
    harvestYear: 2023,
    description: 'Un olio extravergine intenso e fruttato ottenuto esclusivamente da olive Coratina. Note di mandorla, carciofo e peperoncino piccante. Spremitura a freddo entro 4 ore dalla raccolta.',
    imageUrl: 'https://picsum.photos/seed/oliveoil/800/600',
    certificates: ['DOP Terra di Bari', 'Certificato Bio', 'Carbon Neutral'],
    sustainabilityScore: 94,
    timeline: [
      {
        id: 'e1',
        title: 'Raccolta',
        date: '24 Ott, 2023',
        location: 'Tenuta San Domenico (41.22N, 16.29E)',
        description: 'Olive Coratina raccolte a mano. Maturazione ottimale raggiunta.',
        icon: 'harvest',
        verified: true,
        hash: '0x7f9a...3b21'
      },
      {
        id: 'e2',
        title: 'Spremitura a Freddo',
        date: '24 Ott, 2023',
        location: 'Frantoio Ipogeo Moderno',
        description: 'Molitura a 24°C entro 3 ore dall\'arrivo. Acidità: 0.18%.',
        icon: 'press',
        verified: true,
        hash: '0x8c2d...9a12'
      },
      {
        id: 'e3',
        title: 'Analisi Qualità',
        date: '26 Ott, 2023',
        location: 'Lab Certificato Puglia',
        description: 'Conteggio Polifenoli: 680mg/kg. Perossidi: 4.2.',
        icon: 'store',
        verified: true,
        hash: '0x1d4e...5f89'
      },
      {
        id: 'e4',
        title: 'Imbottigliamento',
        date: '02 Nov, 2023',
        location: 'Linea Imbottigliamento Masseria',
        description: 'Imbottigliato in vetro resistente ai raggi UV. Tag NFC applicato.',
        icon: 'bottle',
        verified: true,
        hash: '0x3a1b...7c44'
      },
      {
        id: 'e5',
        title: 'Centro Distribuzione',
        date: '15 Nov, 2023',
        location: 'Hub Logistico Bari',
        description: 'Stoccato a temperatura controllata (16°C). Pronto per l\'export.',
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
    origin: 'Manduria, Puglia, Italia',
    harvestYear: 2022,
    description: 'Vino rosso corposo con aromi di ciliegie, prugne e tabacco. Invecchiato 12 mesi in botti di rovere francese.',
    imageUrl: 'https://picsum.photos/seed/wine/800/600',
    certificates: ['DOC Primitivo di Manduria', 'Agricoltura Sostenibile'],
    sustainabilityScore: 88,
    timeline: [
      {
        id: 'w1',
        title: 'Vendemmia',
        date: '05 Set, 2022',
        location: 'Vigneti Vecchi',
        description: 'Raccolto di notte per preservare l\'acidità.',
        icon: 'harvest',
        verified: true,
        hash: '0x4b2a...1c99'
      },
      {
        id: 'w2',
        title: 'Fermentazione',
        date: '07 Set, 2022',
        location: 'Cantine del Salento',
        description: 'Macerazione per 18 giorni a temperatura controllata.',
        icon: 'press',
        verified: true,
        hash: '0x5c3d...2e11'
      }
    ]
  }
};

// --- MAIN COMPONENTS ---

declare const L: any;

const InteractiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      const map = L.map(mapRef.current).setView([41.0, 16.9], 8);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
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
    };
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-stone-100">
      <div ref={mapRef} className="w-full h-full z-0" />
      <div className="absolute bottom-4 right-4 z-[500] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-stone-100 text-xs">
        <h5 className="font-bold text-stone-900 mb-2">Legenda Network</h5>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm"></div> 
          <span>Centro Formazione</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-olive-600 border border-white shadow-sm"></div> 
          <span>Partner Aziendale</span>
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
  const getCourseIcon = (type: string) => {
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
          {getCourseIcon(course.icon)}
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

const Header: React.FC<{ onReset: () => void, onOpenChat: () => void }> = ({ onReset, onOpenChat }) => (
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
            <span className="text-[10px] text-stone-500 uppercase tracking-widest">Formazione & Tech</span>
          </div>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-bold text-stone-600 uppercase tracking-wide">
          <a href="#courses" className="hover:text-olive-700 transition-colors">Corsi</a>
          <a href="#network" className="hover:text-olive-700 transition-colors">Network</a>
          <a href="#team" className="hover:text-olive-700 transition-colors">Team</a>
          <a href="#technology" className="hover:text-olive-700 transition-colors">Tecnologia</a>
        </nav>
        <div className="flex gap-2">
            <button onClick={onOpenChat} className="hidden md:flex bg-stone-100 text-stone-700 px-4 py-2.5 rounded-full text-sm font-bold hover:bg-stone-200 transition-colors items-center gap-2">
                <Bot className="w-4 h-4" /> Chiedi all'IA
            </button>
            <button className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-olive-700 transition-colors">
            Accedi Academy
            </button>
        </div>
      </div>
    </div>
  </header>
);

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
            Potenziare la Puglia attraverso l'educazione tecnologica avanzata, soluzioni blockchain e trasformazione digitale.
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
          <h4 className="text-white font-bold mb-6">Formazione</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-olive-400 transition-colors">Tutti i Corsi</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Formazione Aziendale</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Summer Bootcamp</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Borse di Studio</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Network</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-olive-400 transition-colors">I Nostri Partner</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Casi di Successo</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Diventa Socio</a></li>
            <li><a href="#" className="hover:text-olive-400 transition-colors">Lavora con Noi</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Contatti</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-olive-500 mt-0.5" />
              <span>Via Sparano da Bari 10,<br/>70121 Bari, Italia</span>
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
        <p>© 2024 ApulianChain Technology S.r.l. Tutti i diritti riservati.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-stone-400">Privacy Policy</a>
          <a href="#" className="hover:text-stone-400">Termini di Servizio</a>
          <a href="#" className="hover:text-stone-400">Impostazioni Cookie</a>
        </div>
      </div>
    </div>
  </footer>
);

const TeamCarousel: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300; // width of card + gap
            current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    return (
        <section id="team" className="py-24 bg-white relative border-t border-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-olive-600 font-bold tracking-widest text-xs uppercase mb-2 block">Chi Siamo</span>
                    <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Il Nostro Team</h2>
                    <p className="text-stone-500 text-lg">
                        Un gruppo multidisciplinare di esperti, visionari e innovatori dedicati alla crescita tecnologica della Puglia.
                    </p>
                </div>

                <div className="relative group">
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-12 z-20 bg-white p-3 rounded-full shadow-lg text-stone-600 hover:text-olive-600 hover:scale-110 transition-all border border-stone-100 hidden md:block"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-8 pb-12 snap-x snap-mandatory no-scrollbar px-4"
                    >
                        {MOCK_TEAM.map((member) => (
                            <div key={member.id} className="min-w-[260px] snap-center">
                                <div className="bg-stone-50 rounded-3xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-stone-100 group/card h-full">
                                    <div className="relative w-32 h-32 mx-auto mb-6">
                                        <div className="absolute inset-0 bg-olive-100 rounded-full scale-0 group-hover/card:scale-100 transition-transform duration-300"></div>
                                        <img 
                                            src={member.imageUrl} 
                                            alt={member.name} 
                                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-md relative z-10"
                                        />
                                    </div>
                                    <h3 className="font-serif font-bold text-xl text-stone-900 mb-1">{member.name}</h3>
                                    <p className="text-xs font-bold text-olive-600 uppercase tracking-wide mb-4">{member.role}</p>
                                    <div className="flex justify-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                        <Linkedin className="w-4 h-4 text-stone-400 hover:text-blue-600 cursor-pointer" />
                                        <ExternalLink className="w-4 h-4 text-stone-400 hover:text-olive-600 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-12 z-20 bg-white p-3 rounded-full shadow-lg text-stone-600 hover:text-olive-600 hover:scale-110 transition-all border border-stone-100 hidden md:block"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
};

// --- MAIN APP ---

function App() {
  const [productId, setProductId] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [chatMode, setChatMode] = useState<'academy' | 'product' | null>(null);
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
      setError('ID non trovato. Prova "AP-2023-8842"');
    }
  };

  const handleReset = () => {
    setCurrentProduct(null);
    setProductId('');
    setError('');
    setChatMode(null);
  };

  // IF PRODUCT IS SELECTED, SHOW DETAIL VIEW
  if (currentProduct) {
    return (
      <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50">
        <Header onReset={handleReset} onOpenChat={() => setChatMode('academy')} />
        
        {/* Breadcrumb / Top Bar */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <button onClick={handleReset} className="hover:text-olive-700">Home</button>
              <span>/</span>
              <span>Demo Verifica</span>
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
                        <span className="text-xs text-stone-400 uppercase tracking-wider">Produttore</span>
                        <p className="font-serif font-semibold text-stone-800">{currentProduct.producer}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 uppercase tracking-wider">Anno Raccolta</span>
                        <p className="font-serif font-semibold text-stone-800">{currentProduct.harvestYear}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Assistant Call to Action */}
              <div className="bg-gradient-to-br from-olive-800 to-olive-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-2xl mb-2">Hai domande?</h3>
                  <p className="text-olive-100 mb-6 max-w-xs">
                    Il nostro Concierge IA può suggerire ricette, abbinamenti e raccontarti la storia di questo prodotto.
                  </p>
                  <button 
                    onClick={() => setChatMode('product')}
                    className="bg-white text-olive-900 px-6 py-3 rounded-full font-bold hover:bg-olive-50 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Parla con il Concierge
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
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Viaggio nella Supply Chain</h2>
                  <p className="text-stone-500">Tracciamento immutabile in tempo reale dalla produzione alla distribuzione.</p>
                </div>
                <Timeline events={currentProduct.timeline} />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Chat Assistant */}
        {chatMode && (
          <GeminiAssistant 
            mode={chatMode}
            product={currentProduct}
            onClose={() => setChatMode(null)} 
          />
        )}
        
        <Footer />
      </div>
    );
  }

  // DEFAULT LANDING PAGE
  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800">
      <Header onReset={handleReset} onOpenChat={() => setChatMode('academy')} />

      <main className="flex-grow relative">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-stone-50">
          <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#558247_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-100 border border-olive-200 text-olive-800 text-xs font-bold uppercase tracking-wide mb-6">
                  <span className="w-2 h-2 rounded-full bg-olive-600 animate-pulse"></span>
                  Iscrizioni Aperte 2024
                </div>
                <h1 className="text-5xl lg:text-7xl font-serif font-bold text-stone-900 mb-6 leading-none">
                  Innovazione in <br />
                  <span className="text-olive-600 italic">Puglia</span>
                </h1>
                <p className="text-xl text-stone-600 mb-10 leading-relaxed max-w-lg">
                  Il principale ecosistema educativo per <strong>Blockchain</strong>, <strong>Cyber Security</strong>, <strong>Gamification</strong> e <strong>Intelligenza Artificiale</strong> nel Sud Italia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-olive-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                    Esplora i Corsi <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="bg-white text-stone-900 border border-stone-200 px-8 py-4 rounded-full font-bold hover:bg-stone-50 transition-colors">
                    I Nostri Partner
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
                   <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Percorsi Formativi</h2>
                   <p className="text-stone-500 text-lg">
                     Curriculum completo progettato da esperti del settore per lanciare la tua carriera nei settori tecnologici più richiesti.
                   </p>
                </div>
                <a href="#" className="text-olive-600 font-bold flex items-center gap-2 hover:underline">
                  Vedi Catalogo Completo <ArrowRight className="w-4 h-4" />
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
                    Il Nostro Ecosistema
                 </div>
                 <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">
                   Radicati in Puglia,<br/>Connessi col Mondo.
                 </h2>
                 <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                   ApulianChain è più di una piattaforma; è una rete viva di <strong>partner</strong>, <strong>innovatori</strong> e <strong>studenti</strong>. Esplora la nostra mappa interattiva per trovare centri di formazione e partner aziendali vicino a te.
                 </p>
                 <div className="space-y-6">
                    <div className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-stone-100">
                       <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 font-bold">12</div>
                       <div>
                          <h4 className="font-bold text-stone-900">Centri di Formazione</h4>
                          <p className="text-sm text-stone-500">Situati a Foggia, Bari, Taranto, Brindisi e Lecce.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-stone-100">
                       <div className="flex-shrink-0 w-12 h-12 bg-olive-50 rounded-full flex items-center justify-center text-olive-600 font-bold">50+</div>
                       <div>
                          <h4 className="font-bold text-stone-900">Partner Aziendali</h4>
                          <p className="text-sm text-stone-500">Offrono stage, casi d'uso reali e opportunità di assunzione.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM CAROUSEL SECTION */}
        <TeamCarousel />

        {/* TECHNOLOGY SHOWCASE (Original Search) */}
        <section id="technology" className="py-24 bg-stone-900 text-stone-300 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <div className="max-w-3xl mx-auto">
               <ShieldCheck className="w-16 h-16 text-olive-500 mx-auto mb-6" />
               <h2 className="text-4xl font-serif font-bold text-white mb-6">Vetrina Tecnologica</h2>
               <p className="text-lg text-stone-400 mb-10">
                 Guarda la nostra tecnologia in azione. Verifica un certificato studente o traccia la provenienza di un prodotto pugliese certificato utilizzando il nostro blockchain explorer.
               </p>

               {/* Search Box */}
               <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-8">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-stone-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-14 pr-32 py-5 rounded-full border-0 text-lg bg-stone-800 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-inset focus:ring-olive-600 transition-all shadow-xl"
                    placeholder="Inserisci ID (es. AP-2023-8842)"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-olive-600 text-white px-6 rounded-full font-medium hover:bg-olive-500 transition-colors flex items-center gap-2"
                  >
                    Verifica
                  </button>
                </form>
                {error && <p className="mb-6 text-red-400 font-medium">{error}</p>}

                <p className="text-sm text-stone-500">
                  ID Prodotto Demo: <button onClick={() => setProductId('AP-2023-8842')} className="text-olive-500 hover:underline">AP-2023-8842</button>
                </p>
             </div>
          </div>
        </section>
        
        {/* GLOBAL ACADEMY CHAT FLOATING BUTTON */}
        {!chatMode && (
          <button 
            onClick={() => setChatMode('academy')}
            className="fixed bottom-6 right-6 bg-olive-600 text-white p-4 rounded-full shadow-2xl hover:bg-olive-700 transition-all z-40 hover:scale-110 flex items-center gap-2 font-bold"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="hidden md:inline">Chiedi all'Academy IA</span>
          </button>
        )}

      </main>
      
      {/* GLOBAL CHAT MODAL */}
      {chatMode && (
          <GeminiAssistant 
            mode={chatMode}
            product={undefined}
            onClose={() => setChatMode(null)} 
          />
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);