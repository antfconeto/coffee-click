# Coffee Click ☕

Uma aplicação moderna para descobrir e explorar cafés artesanais de alta qualidade.

## 🚀 Funcionalidades

- **Autenticação de usuários** com Firebase
- **Listagem de cafés** com informações detalhadas
- **Sistema de filtros** por nome, nível de torra e origem
- **Interface responsiva** com design moderno e soft
- **Integração GraphQL** com AWS AppSync
- **Componentes reutilizáveis** bem estruturados

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS
- **Autenticação**: Firebase
- **API**: GraphQL (AWS AppSync)
- **Ícones**: Componentes SVG personalizados

## 📁 Estrutura do Projeto

```
src/
├── api/
│   └── coffee/           # API para cafés
├── app/                  # Páginas da aplicação
│   ├── home/            # Página principal
│   ├── login/           # Página de login
│   └── profile/         # Página de perfil
├── components/           # Componentes reutilizáveis
│   ├── auth/            # Componentes de autenticação
│   ├── coffee/          # Componentes relacionados a cafés
│   ├── icons/           # Ícones SVG personalizados
│   ├── layout/          # Componentes de layout
│   └── user-auth/       # Componentes de usuário
├── config/               # Configurações (Firebase)
├── contexts/             # Contextos React (Auth)
├── hooks/                # Hooks personalizados
├── types/                # Definições de tipos TypeScript
└── utils/                # Utilitários
```

## 🎨 Design System

- **Cores principais**: Tons de âmbar e laranja para representar café
- **Estilo**: Design moderno, soft e minimalista
- **Responsividade**: Layout adaptável para todos os dispositivos
- **Componentes**: Cards, filtros e navegação bem estruturados

## 🔧 Configuração

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar Firebase**:
   - Criar projeto no Firebase Console
   - Adicionar configuração em `src/config/firebase.ts`

3. **Configurar API**:
   - Atualizar endpoint GraphQL em `src/api/coffee/index.ts`
   - Configurar headers de autenticação se necessário

4. **Executar aplicação**:
   ```bash
   npm run dev
   ```

## 📱 Componentes Principais

### Header
- Logo da aplicação
- Nome e foto do usuário
- Botão de logout

### CoffeeFilters
- Busca por nome
- Filtro por nível de torra
- Filtro por origem
- Botão para limpar filtros

### CoffeeCard
- Imagem do café
- Informações detalhadas
- Badges de nível de torra e estoque
- Botão de adicionar ao carrinho

## 🔐 Autenticação

A aplicação utiliza Firebase Authentication com:
- Login/Logout automático
- Persistência de sessão
- Redirecionamento para páginas protegidas

## 🌐 API GraphQL

Integração com AWS AppSync para:
- Listagem de cafés
- Filtros e busca
- Informações detalhadas de produtos

## 🎯 Próximos Passos

- [ ] Implementar carrinho de compras
- [ ] Adicionar sistema de avaliações
- [ ] Implementar favoritos
- [ ] Adicionar histórico de pedidos
- [ ] Sistema de notificações

## 📄 Licença

Este projeto é privado e desenvolvido para fins educacionais e comerciais.

---

Desenvolvido com ❤️ e ☕ para os amantes de café!
