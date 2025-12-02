# Acompanhante Local - Frontend React

Este é o frontend moderno (React + Vite) para o site de classificados "Acompanhante Local", integrado via API REST ao WordPress.

## 🚀 Como Começar

### 1. Instalação Local
1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Abra o terminal na pasta do projeto.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### 2. Integração com WordPress
Para que o site funcione com seu WordPress, edite o arquivo `src/App.tsx`:
1. Mude `const USE_WORDPRESS_INTEGRATION = true;`
2. Mude `const SITE_URL = 'https://seu-site-wordpress.com.br';`

**Plugins Obrigatórios no WordPress:**
* JWT Authentication for WP-REST-API
* CPT UI (Custom Post Type UI) -> Criar slug `anuncio`
* ACF (Advanced Custom Fields) -> Criar campos `preco`, `whatsapp`, `destaque`
* ACF to REST API

### 3. Deploy Automático (HostGator via GitHub)

Este projeto já vem configurado com **GitHub Actions**.

1. Crie um repositório no GitHub e suba este código.
2. O arquivo `.github/workflows/deploy.yml` já está criado.
3. Vá em **Settings > Secrets and variables > Actions** no seu repositório.
4. Adicione os seguintes segredos (Repository Secrets):
   * `FTP_SERVER`: ex: `ftp.seusite.com.br`
   * `FTP_USERNAME`: Seu usuário de FTP
   * `FTP_PASSWORD`: Sua senha de FTP

Toda vez que você der um `git push` para a branch `main`, o site será atualizado automaticamente na HostGator.

---

## 📁 Estrutura de Pastas Importante

* `.github/workflows/deploy.yml`: Configuração do Deploy Automático.
* `src/App.tsx`: Lógica principal e rotas.
* `src/services/wpApi.ts`: Todas as chamadas para o WordPress.
* `src/types.ts`: Definições dos dados.
