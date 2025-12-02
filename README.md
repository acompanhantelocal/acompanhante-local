# Acompanhante Local - Frontend React

Este é o frontend moderno (React + Vite) para o site de classificados "Acompanhante Local", integrado via API REST ao WordPress.

## 📁 Estrutura de Arquivos (GitHub)

Para o deploy funcionar corretamente, organize seus arquivos no GitHub assim:

```
/ (Raiz do Repositório)
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/                      <-- MOVA SEUS CÓDIGOS PARA CÁ
│   ├── components/
│   │   ├── AdCard.tsx
│   │   └── Layout.tsx
│   ├── services/
│   │   ├── geminiService.ts
│   │   └── wpApi.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── types.ts
├── index.html                <-- FICA NA RAIZ
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

**Arquivos para IGNORAR (Não subir):**
* `metadata.json` (Exclusivo do editor de IA)
* `node_modules/` (Pasta pesada gerada automaticamente)
* `.env` (Se tiver chaves secretas locais)

## 🚀 Instalação e Deploy

### 1. Configuração do WordPress
Antes de subir o site, certifique-se de ter os plugins instalados no seu WordPress:
* **JWT Authentication for WP-REST-API** (Configurar chave secreta no wp-config.php)
* **CPT UI** (Criar post type: `anuncio`)
* **ACF** (Criar campos: `preco`, `whatsapp`, `destaque`, `categoria`)
* **ACF to REST API**

### 2. Configurar URL
Edite o arquivo `src/App.tsx`:
1. Mude `const USE_WORDPRESS_INTEGRATION = true;`
2. Mude `const SITE_URL = 'https://seu-site-wordpress.com.br';`

### 3. Deploy Automático (HostGator)
1. Crie os "Secrets" no seu repositório GitHub (Settings > Secrets > Actions):
   * `FTP_SERVER`
   * `FTP_USERNAME`
   * `FTP_PASSWORD`
2. Faça o push para a branch `main`. O GitHub Actions fará o resto.
