export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string; // Format: 5511999999999
  avatar?: string;
  bio?: string; // Descrição do perfil do vendedor
  role: 'user' | 'admin';
  isVerified?: boolean;
}

export interface Ad {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: 'Acompanhantes' | 'Massagistas' | 'Encontros Casuais';
  images: string[];
  plan: 'BASIC' | 'PREMIUM' | 'TOP'; // Novo sistema de planos
  views: number;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  location?: string; // Ex: Rio de Janeiro, SP, etc.
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
}

export enum PaymentPlan {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  TOP = 'TOP'
}

export interface VerificationRequest {
  fullName: string;
  documentId: string; // URL da imagem do documento
  selfieId: string; // URL da selfie com documento
  whatsapp: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Novos tipos para tornar o site editável via WordPress
export interface WpPageContent {
  title: string;
  content: string; // HTML content from WP
  featuredImage?: string;
}

export interface SiteSettings {
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImage: string;
}
