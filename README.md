# 🎬 Eros Unlimited - Plataforma de Filmes

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe" alt="Stripe">
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-cyan?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS">
</div>

## 📋 Sobre o Projeto

**Eros Unlimited** é uma plataforma moderna de streaming e venda de filmes premium, desenvolvida com foco na experiência do usuário e segurança de pagamentos. A plataforma oferece uma experiência cinematográfica única com filmes independentes e conteúdo artístico exclusivo.

### 🌟 Características Principais

- **🎭 Catálogo Exclusivo**: Filmes independentes e conteúdo artístico premium
- **🌍 Multilíngue**: Suporte para Português, Inglês, Espanhol e Chinês
- **💳 Pagamentos Seguros**: Integração com Stripe e PayPal
- **📱 Responsivo**: Interface adaptável para desktop, tablet e mobile
- **🎨 Design Moderno**: UI/UX com gradientes, animações e efeitos visuais
- **🔐 Autenticação Robusta**: Sistema de login/registro com Supabase Auth
- **🎬 Player Avançado**: Controles de vídeo personalizados com recursos completos

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com SSR/SSG
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **TailwindCSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos e customizáveis

### Backend & Database
- **Supabase** - Backend-as-a-Service com PostgreSQL
- **Supabase Auth** - Autenticação e autorização
- **Supabase Storage** - Armazenamento de arquivos

### Pagamentos
- **Stripe** - Processamento de pagamentos com cartão
- **PayPal** - Pagamentos via PayPal
- **Apple Pay** - Pagamentos móveis (iOS)

### Infraestrutura
- **Nginx** - Servidor web e proxy reverso
- **SSL/TLS** - Certificados Let's Encrypt
- **VPS** - Servidor dedicado para deployment

## 📁 Estrutura do Projeto

```
site-eros-unlimited/
├── app/                          # App Router (Next.js 13+)
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página inicial
│   ├── about/                   # Página sobre
│   ├── api/                     # API Routes
│   │   ├── countries/           # Endpoint para países
│   │   ├── payments/            # Endpoints de pagamento
│   │   └── debug-log/           # Logs de debug
│   ├── login/                   # Página de login
│   ├── register/                # Página de registro
│   ├── payment/                 # Páginas de pagamento
│   ├── my-movies/              # Filmes do usuário
│   └── ...
├── components/                  # Componentes React
│   ├── film-modal.tsx          # Modal de detalhes do filme
│   ├── payment-modal.tsx       # Modal de pagamento
│   ├── hero-section.tsx        # Seção hero
│   ├── navbar.tsx              # Barra de navegação
│   └── ...
├── hooks/                       # Custom Hooks
│   ├── useAuth.ts              # Hook de autenticação
│   └── useTranslation.ts       # Hook de tradução
├── lib/                         # Utilitários e configurações
│   ├── auth.ts                 # Lógica de autenticação
│   ├── movies.ts               # Operações com filmes
│   ├── supabase.ts             # Cliente Supabase
│   ├── stripe.ts               # Configuração Stripe
│   ├── paypal.ts               # Configuração PayPal
│   └── types.ts                # Definições de tipos
├── messages/                    # Arquivos de tradução
│   ├── en.json                 # Inglês
│   ├── pt-BR.json              # Português
│   ├── es.json                 # Espanhol
│   └── zh.json                 # Chinês
└── public/                      # Arquivos estáticos
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Stripe
- Conta no PayPal (opcional)

### 1. Clone o Repositório
```bash
git clone https://github.com/Eros-hub/site-eros-unlimited.git
cd site-eros-unlimited
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configuração das Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Configuração do Banco de Dados (Supabase)

Execute os seguintes comandos SQL no seu projeto Supabase:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'ADMIN', 'STAFF')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de filmes
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_pt TEXT,
  title_es TEXT,
  title_zh TEXT,
  synopsis TEXT,
  synopsis_pt TEXT,
  synopsis_es TEXT,
  synopsis_zh TEXT,
  genre TEXT NOT NULL,
  duration INTEGER NOT NULL,
  release_year INTEGER NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0,
  price DECIMAL(10,2) NOT NULL,
  launch BOOLEAN DEFAULT false,
  main BOOLEAN DEFAULT false,
  poster_url TEXT,
  img_1 TEXT,
  img_2 TEXT,
  img_3 TEXT,
  trailer_url TEXT,
  movie_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Movies are viewable by everyone" ON movies FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Purchases are viewable by owner" ON purchases FOR SELECT USING (auth.uid() = user_id);
```

### 5. Execute o Projeto
```bash
npm run dev
# ou
yarn dev
```

O projeto estará disponível em `http://localhost:3000`

## 🎯 Funcionalidades

### 👤 Autenticação
- **Registro**: Criação de conta com nome, email e senha
- **Login**: Autenticação segura com Supabase Auth
- **Recuperação**: Sistema de recuperação de senha
- **Perfil**: Edição de dados pessoais

### 🎬 Catálogo de Filmes
- **Navegação**: Browse por gêneros e categorias
- **Busca**: Sistema de busca por título
- **Detalhes**: Modal com informações completas do filme
- **Trailer**: Reprodução de trailers com controles avançados
- **Galeria**: Múltiplas imagens promocionais

### 💰 Sistema de Pagamentos
- **Stripe**: Pagamentos com cartão de crédito/débito
- **PayPal**: Pagamentos via conta PayPal
- **Apple Pay**: Pagamentos móveis (iOS Safari)
- **Segurança**: Transações criptografadas e seguras

### 🎥 Player de Vídeo
- **Controles**: Play/pause, volume, progresso
- **Fullscreen**: Modo tela cheia
- **Mobile**: Otimizado para dispositivos móveis
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### 🌐 Internacionalização
- **Português Brasileiro**: Idioma principal
- **Inglês**: Tradução completa
- **Espanhol**: Suporte hispano
- **Chinês**: Mercado asiático

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção

# Linting
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas de lint automaticamente

# Tipos
npm run type-check   # Verifica tipos TypeScript
```

## 🚀 Deploy

### Produção (VPS)
1. **Servidor**: Ubuntu 20.04+ com Nginx
2. **SSL**: Certificados Let's Encrypt
3. **Proxy**: Nginx como proxy reverso
4. **PM2**: Gerenciamento de processos

```bash
# Build da aplicação
npm run build

# Configuração do Nginx
sudo nano /etc/nginx/sites-available/erosunlimited.com

# Ativar site
sudo ln -s /etc/nginx/sites-available/erosunlimited.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL com Certbot
sudo certbot --nginx -d erosunlimited.com -d www.erosunlimited.com
```

## 🧪 Testes

### Contas de Teste
- **Admin**: `useradmin@gmail.com` / `admin123@`
- **Cliente**: `userguest@gmail.com` / `eros2025@`

### Dados de Teste para Pagamentos
```
Cartão de Teste Stripe:
- Número: 4242424242424242
- Validade: Qualquer data futura
- CVC: Qualquer 3 dígitos
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e propriedade da **Eros Unlimited Productions**. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto:

- **Email**: erosunlimitedart@gmail.com
- **Documentação**: Consulte este README
- **Issues**: Use o sistema de issues do GitHub para reportar bugs

---

<div align="center">
  <strong>🎬 Eros Unlimited - Where Art Meets Desire 🎭</strong>
  <br>
  <em>Desenvolvido com ❤️ para a comunidade artística</em>
</div>

