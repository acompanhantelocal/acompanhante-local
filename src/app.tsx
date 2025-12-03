import React, { useState, useEffect, createContext, useContext } from 'react';
import { Layout } from './components/Layout';
import { AdCard } from './components/AdCard';
import { User, Ad, PaymentPlan, WpPageContent } from './types';
import { generateSeoData, optimizeAdDescription } from './services/geminiService';
import { fetchAdsFromWP, createAdInWP, loginToWordPress, uploadImageToWP, fetchPageFromWP, checkConnection } from './services/wpApi';
import { Edit3, Trash2, PlusCircle, Search, Check, Wand2, User as UserIcon, X, Image as ImageIcon, Plus, ShieldAlert, FileText, Camera, Smartphone, Car, Home, Link, Link2Off } from 'lucide-react';

// --- WORDPRESS CONFIG ---
// ⚠️ PASSO 1: QUANDO ESTIVER PRONTO, COLOQUE A URL DO SEU SITE AQUI
const SITE_URL = 'https://seu-site-wordpress.com.br'; 

const WP_CONFIG = {
  baseUrl: SITE_URL, 
  apiUrl: `${SITE_URL}/wp-json/wp/v2`,
  wooCheckoutUrl: `${SITE_URL}/checkout`
};

// ⚠️ PASSO 2: MUDE PARA 'true' APENAS QUANDO A URL ACIMA ESTIVER CORRETA
const USE_WORDPRESS_INTEGRATION = false;

// --- MOCK DATA (ADULT NICHE - FALLBACK) ---
const MOCK_USER: User = {
  id: 'u1',
  name: 'Anunciante Demo',
  email: 'demo@example.com',
  whatsapp: '5521999999999',
  role: 'user',
  isVerified: false, 
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200',
  bio: 'Conta de demonstração. Conecte ao WordPress para usar usuários reais.'
};

const INITIAL_ADS: Ad[] = [
  {
    id: '1',
    userId: 'u2',
    title: 'Duda Modelo - Loira Universitária',
    description: 'Sou a Duda, tenho 22 anos, loira, olhos azuis. Atendo em Copacabana e Ipanema. Faço massagem relaxante e acompanhamento em jantares.',
    price: 350,
    category: 'Acompanhantes',
    images: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=800'],
    plan: 'TOP',
    views: 3420,
    slug: 'duda-modelo-rj',
    createdAt: new Date().toISOString(),
    location: 'Copacabana, RJ',
    seoTitle: 'Acompanhante Loira Copacabana - Duda Modelo',
    seoDescription: 'Encontre Duda, acompanhante universitária em Copacabana. Fotos reais, atendimento de luxo.'
  },
  {
    id: '2',
    userId: 'u1',
    title: 'Massagem Tântrica com Finalização',
    description: 'Terapeuta corporal certificada. Massagem relaxante, tântrica e nuru. Ambiente climatizado e discreto no Centro do Rio.',
    price: 200,
    category: 'Massagistas',
    images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db48c?auto=format&fit=crop&w=600&h=800'],
    plan: 'PREMIUM',
    views: 1250,
    slug: 'massagem-tantrica-rj',
    createdAt: new Date().toISOString(),
    location: 'Centro, RJ'
  },
  {
    id: '3',
    userId: 'u3',
    title: 'Morena Bronzeada - Encontros Casuais',
    description: 'Morena, 1.70m, corpo atlético. Gosto de homens educados e cheirosos. Atendo hotel e motel.',
    price: 300,
    category: 'Encontros Casuais',
    images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&h=800'],
    plan: 'BASIC',
    views: 890,
    slug: 'morena-bronzeada-rj',
    createdAt: new Date().toISOString(),
    location: 'Barra da Tijuca, RJ'
  }
];

// --- CONTEXT ---
interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  verifyUser: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

// --- DYNAMIC CONTENT LOADER ---
// Helper component to display HTML content from WordPress safely
const WpHtmlContent = ({ html }: { html: string }) => (
  <div className="prose text-gray-600 space-y-4" dangerouslySetInnerHTML={{ __html: html }} />
);

// --- LEGAL PAGES COMPONENTS (DYNAMIC) ---
const TermsPage = ({ content }: { content?: WpPageContent }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
    <h1 className="text-3xl font-bold mb-6 text-slate-900">{content?.title || "Termos de Uso"}</h1>
    {content ? (
      <WpHtmlContent html={content.content} />
    ) : (
      <div className="prose text-gray-600 space-y-4">
        <p>Bem-vindo ao Acompanhante Local. Ao acessar este site, você concorda com os seguintes termos:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Você declara ter mais de 18 anos de idade.</li>
          <li>O Acompanhante Local é apenas um provedor de espaço para anúncios classificados. Não participamos, intermediamos ou temos qualquer vínculo com os serviços ofertados.</li>
          <li>É proibido anunciar atos ilegais ou compartilhar conteúdo que viole as leis brasileiras.</li>
          <li>A responsabilidade pela veracidade das informações e fotos é inteiramente do anunciante.</li>
        </ul>
        <p className="text-sm text-gray-400 italic mt-4">* Conteúdo padrão. Conecte ao WordPress para editar este texto na página 'Termos'.</p>
      </div>
    )}
  </div>
);

const PrivacyPage = ({ content }: { content?: WpPageContent }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
    <h1 className="text-3xl font-bold mb-6 text-slate-900">{content?.title || "Política de Privacidade"}</h1>
    {content ? (
       <WpHtmlContent html={content.content} />
    ) : (
      <div className="prose text-gray-600 space-y-4">
        <p>Sua privacidade é nossa prioridade. Esta política descreve como tratamos seus dados:</p>
        <h3 className="font-bold text-lg mt-4">1. Coleta de Dados</h3>
        <p>Coletamos dados básicos para cadastro e, no caso de anunciantes, documentos para verificação de identidade e segurança da plataforma.</p>
        <h3 className="font-bold text-lg mt-4">2. Uso dos Documentos</h3>
        <p>Os documentos enviados (RG, Selfie) são utilizados <strong>exclusivamente</strong> para verificação de idade e identidade.</p>
        <p className="text-sm text-gray-400 italic mt-4">* Conteúdo padrão. Conecte ao WordPress para editar este texto na página 'Privacidade'.</p>
      </div>
    )}
  </div>
);

const AboutPage = ({ content }: { content?: WpPageContent }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
    <h1 className="text-3xl font-bold mb-6 text-slate-900">{content?.title || "Sobre Nós & Isenção de Responsabilidade"}</h1>
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <p className="font-bold text-red-700">Importante:</p>
      <p className="text-red-600 text-sm">NÃO somos uma agência. NÃO agenciamos modelos. NÃO recebemos comissões sobre encontros.</p>
    </div>
    {content ? (
      <WpHtmlContent html={content.content} />
    ) : (
      <div className="prose text-gray-600 space-y-4">
        <p>O Acompanhante Local é um portal de classificados online focado no público adulto.</p>
        <p>Nosso objetivo é oferecer uma plataforma segura e organizada para que profissionais autônomos possam divulgar seus serviços.</p>
        <p className="text-sm text-gray-400 italic mt-4">* Conteúdo padrão. Conecte ao WordPress para editar este texto na página 'Sobre'.</p>
      </div>
    )}
  </div>
);

// --- VERIFICATION PAGE ---
const VerificationPage = ({ onVerifySuccess, navigate }: { onVerifySuccess: () => void, navigate: (p:string) => void }) => {
  const [files, setFiles] = useState<{doc: string | null, selfie: string | null}>({ doc: null, selfie: null });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'selfie') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFiles(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      onVerifySuccess();
      alert("Documentos enviados com sucesso! Sua conta foi verificada.");
      navigate('/create-ad');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-slate-900 p-6 text-white text-center">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-pink-500" />
        <h1 className="text-2xl font-bold">Verificação Obrigatória</h1>
        <p className="text-slate-300 text-sm">Para garantir a segurança da comunidade, precisamos validar sua identidade antes de você anunciar.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start">
          <FileText className="w-5 h-5 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-bold mb-1">Seus dados estão seguros</p>
            <p>Os documentos enviados servem apenas para comprovar que você é uma pessoa real e maior de idade. Eles nunca serão exibidos no seu perfil.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition cursor-pointer relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'doc')} />
                <div className="pointer-events-none">
                    {files.doc ? (
                        <div className="text-green-600 flex flex-col items-center">
                            <Check className="w-10 h-10 mb-2" />
                            <span className="text-sm font-bold">Documento Carregado</span>
                        </div>
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <Camera className="w-10 h-10 mb-2" />
                            <span className="text-sm">Foto do Documento (Frente)</span>
                        </div>
                    )}
                </div>
            </div>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition cursor-pointer relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'selfie')} />
                <div className="pointer-events-none">
                     {files.selfie ? (
                        <div className="text-green-600 flex flex-col items-center">
                            <Check className="w-10 h-10 mb-2" />
                            <span className="text-sm font-bold">Selfie Carregada</span>
                        </div>
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <UserIcon className="w-10 h-10 mb-2" />
                            <span className="text-sm">Selfie segurando Documento</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <button 
            type="submit" 
            disabled={!files.doc || !files.selfie}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition ${(!files.doc || !files.selfie) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30'}`}
        >
            Enviar para Análise
        </button>
      </form>
    </div>
  );
};

// --- AUTH PAGE ---
const AuthPage = ({ onLogin }: { onLogin: () => void }) => {
    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-12">
            <h2 className="text-2xl font-bold text-center mb-6">Acesse sua Conta</h2>
            <div className="space-y-4">
                <button 
                    onClick={onLogin}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center"
                >
                    <UserIcon className="w-5 h-5 mr-2" />
                    Entrar (Demo User)
                </button>
                <div className="text-center text-sm text-gray-500 my-4">ou</div>
                <button className="w-full border border-pink-500 text-pink-500 py-3 rounded-lg font-bold hover:bg-pink-50 transition">
                    Criar Nova Conta
                </button>
            </div>
        </div>
    );
};

// --- CREATE AD PAGE ---
const CreateAdPage = ({ onCancel, onSubmit }: { onCancel: () => void, onSubmit: (ad: Partial<Ad>) => void }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<string>('Acompanhantes');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleOptimize = async () => {
        if (!description) return;
        setIsGenerating(true);
        const optimized = await optimizeAdDescription(description);
        setDescription(optimized || description);
        setIsGenerating(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const remainingSlots = 5 - uploadedImages.length;
            const filesToProcess = filesArray.slice(0, remainingSlots);

            filesToProcess.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setUploadedImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
      if (!title || !description || !price || uploadedImages.length === 0) {
        alert("Preencha todos os campos e adicione pelo menos uma foto.");
        return;
      }
      onSubmit({ 
        title, 
        description, 
        price: Number(price), 
        category: category as any,
        images: uploadedImages 
      });
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <PlusCircle className="w-6 h-6 mr-2 text-pink-500" /> Criar Novo Anúncio
            </h1>
            
            <div className="space-y-6">
                {/* Images */}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Fotos do Anúncio (Max 5)</label>
                   <div className="flex flex-wrap gap-4">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative w-24 h-32 rounded-lg overflow-hidden border border-gray-200 group">
                           <img src={img} alt="Upload" className="w-full h-full object-cover" />
                           <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                             <X className="w-3 h-3" />
                           </button>
                        </div>
                      ))}
                      {uploadedImages.length < 5 && (
                        <label className="w-24 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition text-gray-400 hover:text-pink-500">
                           <ImageIcon className="w-6 h-6 mb-1" />
                           <span className="text-xs font-bold">Adicionar</span>
                           <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      )}
                   </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Anúncio</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                        placeholder="Ex: Massagem relaxante no Centro"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                    >
                      <option value="Acompanhantes">Acompanhantes</option>
                      <option value="Massagistas">Massagistas</option>
                      <option value="Encontros Casuais">Encontros Casuais</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <div className="relative">
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                            placeholder="Descreva seus serviços, horário de atendimento, etc."
                        />
                        <button 
                            onClick={handleOptimize}
                            disabled={isGenerating || !description}
                            className="absolute bottom-3 right-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center hover:bg-purple-200 transition"
                        >
                            <Wand2 className="w-3 h-3 mr-1" />
                            {isGenerating ? 'Otimizando...' : 'Melhorar com IA'}
                        </button>
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                     <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none max-w-[200px]"
                        placeholder="0,00"
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button onClick={onCancel} className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900">Cancelar</button>
                    <button 
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 shadow-lg shadow-pink-600/20"
                    >
                        Publicar Anúncio
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- HOME PAGE COMPONENT (DYNAMIC BANNER) ---
const HomePage = ({ ads, onNavigate, homeContent }: { ads: Ad[], onNavigate: (path: string) => void, homeContent?: WpPageContent }) => {
  return (
    <div>
      {/* Hero Banner with Soft/Sexy Aesthetic */}
      <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl mb-12 group">
        <img 
          src={homeContent?.featuredImage || "https://images.unsplash.com/photo-1545912452-8aaea63fd5a3?q=80&w=2070&auto=format&fit=crop"} 
          alt="Banner"
          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000"
        />
        {/* Soft Gradient Overlay - Left to Right */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/60 via-transparent to-transparent flex flex-col justify-center px-8 md:px-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
             {homeContent?.title ? (
                 <div dangerouslySetInnerHTML={{ __html: homeContent.title }} />
             ) : (
                 <>Encontros <br/><span className="text-pink-300">Inesquecíveis</span></>
             )}
          </h1>
          <div className="text-lg md:text-xl text-white/90 mb-8 max-w-lg drop-shadow-md">
            {homeContent?.content ? (
                 <div dangerouslySetInnerHTML={{ __html: homeContent.content }} />
             ) : (
                "Descubra companhias exclusivas e momentos únicos com total discrição e segurança no Rio de Janeiro."
             )}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center -mt-20 relative z-10 mb-16">
        <button 
          onClick={() => onNavigate('/create-ad')}
          className="bg-pink-600 text-white text-xl font-bold py-4 px-10 rounded-full shadow-xl hover:bg-pink-700 hover:scale-105 transition transform flex items-center ring-4 ring-white"
        >
          <PlusCircle className="w-6 h-6 mr-3" />
          Publique seu Anúncio
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 px-4">
        {[
          { icon: Check, label: 'Acompanhantes', color: 'bg-pink-100 text-pink-600' },
          { icon: Wand2, label: 'Massagistas', color: 'bg-purple-100 text-purple-600' },
          { icon: Search, label: 'Encontros Casuais', color: 'bg-blue-100 text-blue-600' },
        ].map((cat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer border border-gray-100 flex flex-col items-center text-center group">
            <div className={`p-4 rounded-full mb-4 ${cat.color} group-hover:scale-110 transition`}>
              <cat.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{cat.label}</h3>
            <p className="text-gray-500 text-sm mt-2">Ver anúncios disponíveis</p>
          </div>
        ))}
      </div>

      {/* Ads Grid */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
        <Search className="w-6 h-6 mr-2 text-pink-500" /> Destaques Recentes
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ads.length > 0 ? (
          ads.map(ad => (
            <AdCard key={ad.id} ad={ad} onClick={(id) => console.log('View Ad', id)} />
          ))
        ) : (
          <div className="col-span-4 text-center py-10 bg-gray-50 rounded-xl">
             <p className="text-gray-500">Nenhum anúncio encontrado. Verifique a conexão com o WordPress.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [isConnected, setIsConnected] = useState(false);
  
  // Dynamic Content State
  const [termsContent, setTermsContent] = useState<WpPageContent | undefined>(undefined);
  const [privacyContent, setPrivacyContent] = useState<WpPageContent | undefined>(undefined);
  const [aboutContent, setAboutContent] = useState<WpPageContent | undefined>(undefined);
  const [homeContent, setHomeContent] = useState<WpPageContent | undefined>(undefined);

  const login = () => {
      setUser(MOCK_USER);
      setCurrentPath('/dashboard');
  };

  const logout = () => {
      setUser(null);
      setCurrentPath('/');
  };

  const verifyUser = () => {
      if (user) {
          setUser({ ...user, isVerified: true });
      }
  };

  const handleCreateAd = (newAdData: Partial<Ad>) => {
      const newAd: Ad = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user?.id || 'guest',
          title: newAdData.title || 'Sem Título',
          description: newAdData.description || '',
          price: newAdData.price || 0,
          category: newAdData.category as any || 'Acompanhantes',
          images: newAdData.images || [],
          plan: 'BASIC',
          views: 0,
          slug: 'novo-anuncio',
          createdAt: new Date().toISOString(),
          location: 'Rio de Janeiro, RJ'
      };
      setAds([newAd, ...ads]);
      setCurrentPath('/dashboard');
  };

  // Wordpress Fetch Effect
  useEffect(() => {
    if (USE_WORDPRESS_INTEGRATION) {
      // Test Connection
      checkConnection(WP_CONFIG.apiUrl).then(ok => {
        setIsConnected(ok);
        if(!ok) console.warn("Falha na conexão com WP. Verifique CORS e URL.");
      });

      // 1. Fetch Ads
      fetchAdsFromWP(WP_CONFIG.apiUrl).then(fetchedAds => {
        if (fetchedAds.length > 0) setAds(fetchedAds);
      });

      // 2. Fetch Pages Content (Dynamic Editing)
      fetchPageFromWP('termos', WP_CONFIG.apiUrl).then(data => data && setTermsContent(data));
      fetchPageFromWP('privacidade', WP_CONFIG.apiUrl).then(data => data && setPrivacyContent(data));
      fetchPageFromWP('sobre', WP_CONFIG.apiUrl).then(data => data && setAboutContent(data));
      fetchPageFromWP('home', WP_CONFIG.apiUrl).then(data => data && setHomeContent(data));
    }
  }, []);

  const renderContent = () => {
      switch(currentPath) {
          case '/':
          case '/rio-de-janeiro':
              return <HomePage ads={ads} onNavigate={setCurrentPath} homeContent={homeContent} />;
          case '/login':
              return <AuthPage onLogin={login} />;
          case '/create-ad':
              if (!user) return <AuthPage onLogin={login} />;
              if (!user.isVerified) return <VerificationPage onVerifySuccess={verifyUser} navigate={setCurrentPath} />;
              return <CreateAdPage onCancel={() => setCurrentPath('/dashboard')} onSubmit={handleCreateAd} />;
          case '/dashboard':
              if (!user) return <AuthPage onLogin={login} />;
              return (
                  <div className="max-w-6xl mx-auto">
                      <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Meus Anúncios</h1>
                        <button onClick={() => setCurrentPath('/create-ad')} className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-pink-700 transition">
                            <Plus className="w-4 h-4 mr-2" /> Novo Anúncio
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {ads.filter(a => a.userId === user.id).map(ad => (
                               <div key={ad.id} className="relative group">
                                   <AdCard ad={ad} onClick={() => {}} />
                                   <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                                       <button className="p-2 bg-white rounded-full shadow hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                                       <button className="p-2 bg-white rounded-full shadow hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                   </div>
                               </div>
                           ))}
                      </div>
                  </div>
              );
          case '/about': return <AboutPage content={aboutContent} />;
          case '/terms': return <TermsPage content={termsContent} />;
          case '/privacy': return <PrivacyPage content={privacyContent} />;
          default:
              return <div className="text-center py-20 text-gray-500">Página não encontrada</div>;
      }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, verifyUser }}>
       <Layout onNavigate={setCurrentPath} currentPath={currentPath} user={user} logout={logout}>
          {renderContent()}
          {/* Connection Status Indicator for Admin */}
          <div className="fixed bottom-2 right-2 text-[10px] px-2 py-1 rounded bg-white shadow opacity-70">
            {USE_WORDPRESS_INTEGRATION ? (
              isConnected ? 
                <span className="text-green-600 flex items-center"><Link className="w-3 h-3 mr-1"/> WP Conectado</span> : 
                <span className="text-red-600 flex items-center"><Link2Off className="w-3 h-3 mr-1"/> Erro WP</span>
            ) : (
              <span className="text-gray-500">Modo Demo</span>
            )}
          </div>
       </Layout>
    </AuthContext.Provider>
  );
}
