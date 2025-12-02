import React, { useEffect, useState } from 'react';
import { User, LogOut, PlusCircle, Heart, Menu, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  seoTitle?: string;
  seoDescription?: string;
  onNavigate: (path: string) => void;
  currentPath: string;
  user: UserType | null;
  logout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  seoTitle = "Acompanhante Local - Classificados Adultos", 
  seoDescription = "Encontre as melhores acompanhantes, massagistas e encontros casuais na sua região. Discrição e segurança.", 
  onNavigate,
  currentPath,
  user,
  logout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);

  // Dynamic SEO Injection
  useEffect(() => {
    document.title = seoTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoDescription);
  }, [seoTitle, seoDescription]);

  // Age Gate Check
  useEffect(() => {
    const isAdult = localStorage.getItem('isAdultVerified');
    if (!isAdult) {
      setShowAgeGate(true);
    }
  }, []);

  const handleAgeConfirm = () => {
    localStorage.setItem('isAdultVerified', 'true');
    setShowAgeGate(false);
  };

  const handleAgeReject = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* AGE GATE MODAL */}
      {showAgeGate && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-8 text-center shadow-2xl border-4 border-pink-600">
            <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-pink-600">18+</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Conteúdo para Adultos</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Este site contém material destinado exclusivamente a maiores de 18 anos. 
              Ao entrar, você declara ser maior de idade e estar ciente do teor do conteúdo.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleAgeConfirm}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl text-lg transition shadow-lg shadow-pink-600/30"
              >
                Sim, tenho mais de 18 anos
              </button>
              <button 
                onClick={handleAgeReject}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition"
              >
                Sair do site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-pink-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group" 
              onClick={() => onNavigate('/')}
            >
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg group-hover:rotate-3 transition duration-300">
                <Heart className="text-white w-6 h-6 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight leading-none text-white">ACOMPANHANTE<span className="text-pink-500">LOCAL</span></span>
                <span className="text-[10px] text-gray-400 tracking-widest uppercase">Classificados Adultos</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => onNavigate('/')} className="hover:text-pink-400 font-medium transition">Início</button>
              <button onClick={() => onNavigate('/rio-de-janeiro')} className="hover:text-pink-400 font-medium transition">Rio de Janeiro</button>
              {user ? (
                <>
                  <button onClick={() => onNavigate('/dashboard')} className="hover:text-pink-400 font-medium">Meus Anúncios</button>
                  <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
                     <button 
                      onClick={() => onNavigate('/create-ad')}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center transition shadow-lg shadow-pink-600/20"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" /> Anunciar
                    </button>
                    <button onClick={logout} className="text-gray-400 hover:text-white">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => onNavigate('/login')}
                  className="border border-pink-500 text-pink-400 px-6 py-2 rounded-full font-bold text-sm hover:bg-pink-600 hover:text-white transition"
                >
                  Entrar / Cadastrar
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 px-4 py-4 space-y-4 border-t border-slate-700">
            <button onClick={() => { onNavigate('/'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-white">Início</button>
            <button onClick={() => { onNavigate('/rio-de-janeiro'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-white">RJ - Capital</button>
            {user ? (
              <>
                <button onClick={() => { onNavigate('/dashboard'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-white">Painel</button>
                <button onClick={() => { onNavigate('/create-ad'); setIsMenuOpen(false); }} className="block w-full text-left text-pink-400 font-bold">Anunciar Agora</button>
                <button onClick={logout} className="block w-full text-left text-red-400">Sair</button>
              </>
            ) : (
              <button onClick={() => { onNavigate('/login'); setIsMenuOpen(false); }} className="block w-full bg-pink-600 text-white p-2 rounded text-center font-bold">Entrar</button>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2 pr-8">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-pink-500" /> Acompanhante Local
            </h3>
            <p className="mb-4 text-justify">
              O Acompanhante Local é um site de classificados online. Não agenciamos, não empregamos e não nos responsabilizamos pelos serviços anunciados. 
              Todas as negociações são realizadas diretamente entre os usuários e os anunciantes.
            </p>
            <div className="flex items-center space-x-2 text-xs bg-slate-800 p-2 rounded inline-block">
               <AlertTriangle className="w-4 h-4 text-yellow-500" />
               <span>Conteúdo exclusivo para maiores de 18 anos.</span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Institucional</h3>
            <ul className="space-y-2">
              <li className="hover:text-pink-400 cursor-pointer transition" onClick={() => onNavigate('/about')}>Sobre Nós</li>
              <li className="hover:text-pink-400 cursor-pointer transition" onClick={() => onNavigate('/terms')}>Termos de Uso</li>
              <li className="hover:text-pink-400 cursor-pointer transition" onClick={() => onNavigate('/privacy')}>Política de Privacidade</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li className="hover:text-pink-400 cursor-pointer transition">Acompanhantes</li>
              <li className="hover:text-pink-400 cursor-pointer transition">Massagistas</li>
              <li className="hover:text-pink-400 cursor-pointer transition">Encontros Casuais</li>
              <li className="hover:text-pink-400 cursor-pointer transition">Transex</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500">
          © 2024 Acompanhante Local. Todos os direitos reservados. É proibida a cópia total ou parcial do conteúdo.
        </div>
      </footer>
    </div>
  );
};
