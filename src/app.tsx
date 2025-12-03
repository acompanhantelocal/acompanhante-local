import React, { useState, useEffect, createContext, useContext } from 'react';
import { Layout } from './components/Layout';
import { AdCard } from './components/AdCard';
import { User, Ad, PaymentPlan, WpPageContent } from './types';
import { generateSeoData, optimizeAdDescription } from './services/geminiService';
import { fetchAdsFromWP, createAdInWP, loginToWordPress, uploadImageToWP, fetchPageFromWP, checkConnection } from './services/wpApi';
import { Edit3, Trash2, PlusCircle, Search, Check, Wand2, User as UserIcon, X, Image as ImageIcon, Plus, ShieldAlert, FileText, Camera, Smartphone, Car, Home, Link, Link2Off } from 'lucide-react';

// --- WORDPRESS CONFIG ---
// ⚠️ PASSO 1: QUANDO ESTIVER PRONTO, COLOQUE A URL DO SEU SITE AQUI
const SITE_URL = 'https://acompanhante-local.site/wp-admin/'; 

const WP_CONFIG = {
  baseUrl: SITE_URL, 
  apiUrl: `${SITE_URL}/wp-json/wp/v2`,
  wooCheckoutUrl: `${SITE_URL}/checkout`
};
