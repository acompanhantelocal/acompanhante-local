import React from 'react';
import { MapPin, Heart, Zap, Crown, Star } from 'lucide-react';
import { Ad, PaymentPlan } from '../types';

interface AdCardProps {
  ad: Ad;
  onClick: (id: string) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  // Configuração visual baseada no plano
  const getPlanStyles = () => {
    switch (ad.plan) {
      case PaymentPlan.TOP:
        return 'border-pink-500 ring-2 ring-pink-500 shadow-pink-200 shadow-lg scale-[1.02]';
      case PaymentPlan.PREMIUM:
        return 'border-blue-500 ring-1 ring-blue-500 shadow-blue-100 shadow-md';
      default:
        return 'border-gray-200 hover:border-pink-300';
    }
  };

  return (
    <div 
      className={`group bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer border relative ${getPlanStyles()}`}
      onClick={() => onClick(ad.id)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img 
          src={ad.images[0]} 
          alt={ad.title} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Badges de Plano */}
        {ad.plan === PaymentPlan.TOP && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg animate-pulse">
            <Crown className="w-3 h-3 mr-1 fill-white" /> TOP
          </div>
        )}
        {ad.plan === PaymentPlan.PREMIUM && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md">
            <Star className="w-3 h-3 mr-1 fill-white" /> PREMIUM
          </div>
        )}

        <button className="absolute top-2 right-2 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:text-pink-500 hover:bg-white transition">
          <Heart className="w-4 h-4" />
        </button>
        
        {/* Gradiente Overlay na parte inferior da foto */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
           <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
            {ad.title}
          </h3>
          <div className="flex items-center text-xs text-gray-200 mt-1">
            <MapPin className="w-3 h-3 mr-1 text-pink-400" /> {ad.location || 'Rio de Janeiro, RJ'}
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-white">
        <div className="flex justify-between items-center">
             <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">{ad.category}</span>
             <p className="text-lg font-bold text-gray-900">
                R$ {ad.price.toLocaleString('pt-BR')}
             </p>
        </div>
      </div>
    </div>
  );
};
