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

## 🎯 Funcionalidades

### 👤 Autenticação
- **Registro**: Criação de conta com nome, email e senha
- **Login**: Autenticação segura com Supabase Auth
- **Recuperação**: Sistema de recuperação de senha
- **Perfil**: Edição de dados pessoais

### 🎬 Catálogo de Filmes
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


## 📄 Licença

Este projeto é privado e propriedade da **Eros Unlimited Productions**. Todos os direitos reservados.

Plataforma: https://erosunlimited.com/
