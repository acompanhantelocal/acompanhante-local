import { User, Ad, WpPageContent } from '../types';

/**
 * UTILS: TESTAR CONEXÃO
 */
export const checkConnection = async (apiUrl: string): Promise<boolean> => {
    try {
        const response = await fetch(`${apiUrl}/posts?per_page=1`);
        return response.ok;
    } catch (e) {
        return false;
    }
};

/**
 * 1. AUTENTICAÇÃO
 * Usa o plugin 'JWT Authentication for WP-REST-API'
 */
export const loginToWordPress = async (username: string, password: string, apiUrl: string): Promise<{ user: User; token: string } | null> => {
  try {
    const response = await fetch(`${apiUrl.replace('/wp/v2', '')}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    // Mapeia o usuário do WP para o nosso tipo User
    return {
      token: data.token,
      user: {
        id: data.user_id,
        name: data.user_display_name,
        email: data.user_email,
        whatsapp: '', // Precisaria vir de um campo user_meta customizado
        role: 'user', // Pode verificar capabilities para admin
        avatar: '', // Pode buscar do Gravatar ou plugin de avatar
      },
    };
  } catch (error) {
    console.error('Erro no login WP:', error);
    return null;
  }
};

/**
 * 2. UPLOAD DE IMAGEM
 * Envia o arquivo para a biblioteca de mídia do WP
 */
export const uploadImageToWP = async (file: File, token: string, apiUrl: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${apiUrl}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Não defina Content-Type aqui, o browser define automaticamente para multipart/form-data
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    return data.source_url; // Retorna a URL da imagem enviada
  } catch (error) {
    console.error('Erro upload imagem:', error);
    return null;
  }
};

/**
 * 3. CRIAR ANÚNCIO
 * Cria um Custom Post Type 'anuncio' e salva campos ACF
 */
export const createAdInWP = async (ad: Ad, token: string, apiUrl: string): Promise<boolean> => {
  try {
    // Primeiro, cria o post básico
    const postResponse = await fetch(`${apiUrl}/anuncio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: ad.title,
        content: ad.description,
        status: 'publish', // Ou 'pending' se quiser aprovação
        // Campos ACF (requer plugin ACF to REST API)
        acf: {
          preco: ad.price,
          whatsapp: ad.userId, // Idealmente salvaria o número
          categoria: ad.category,
          imagens_galeria: ad.images.join(','), // Salva URLs como string ou array
        },
      }),
    });

    if (!postResponse.ok) return false;
    return true;
  } catch (error) {
    console.error('Erro ao criar anúncio:', error);
    return false;
  }
};

/**
 * 4. BUSCAR ANÚNCIOS
 * Lê os posts do tipo 'anuncio'
 */
export const fetchAdsFromWP = async (apiUrl: string): Promise<Ad[]> => {
  try {
    const response = await fetch(`${apiUrl}/anuncio?_embed&per_page=20`);
    if (!response.ok) return [];
    
    const posts = await response.json();

    return posts.map((post: any) => ({
      id: post.id.toString(),
      userId: post.author.toString(),
      title: post.title.rendered,
      description: post.content.rendered,
      price: Number(post.acf?.preco || 0),
      category: post.acf?.categoria || 'Geral',
      images: post.acf?.imagens_galeria ? post.acf.imagens_galeria.split(',') : [],
      plan: post.acf?.destaque ? 'TOP' : 'BASIC',
      views: 0,
      slug: post.slug,
      createdAt: post.date,
    }));
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
    return [];
  }
};

/**
 * 5. BUSCAR CONTEÚDO DE PÁGINA (SOBRE, TERMOS, HOME)
 */
export const fetchPageFromWP = async (slug: string, apiUrl: string): Promise<WpPageContent | null> => {
  try {
    // Busca páginas pelo slug
    const response = await fetch(`${apiUrl}/pages?slug=${slug}&_embed`);
    const data = await response.json();

    if (data && data.length > 0) {
      const page = data[0];
      let featuredImage = '';
      
      // Tenta pegar a imagem destacada se existir
      if (page._embedded && page._embedded['wp:featuredmedia'] && page._embedded['wp:featuredmedia'][0]) {
        featuredImage = page._embedded['wp:featuredmedia'][0].source_url;
      }

      return {
        title: page.title.rendered,
        content: page.content.rendered, // Conteúdo HTML do editor do WP
        featuredImage: featuredImage
      };
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar página ${slug}:`, error);
    return null;
  }
};
