# DefesaAdmin - Sistema de Defesas Administrativas

Sistema completo para criação e gestão de defesas administrativas contra notificações da FUNAI para estudos demarcatórios de Terras Indígenas, aplicável a múltiplas propriedades.

Este projeto é uma plataforma configurável onde cada propriedade mantém seus próprios documentos, dados e argumentos de defesa personalizados. A "Fazenda Brilhante" serve apenas como um template inicial/exemplo que pode ser replicado para outras propriedades.

## Visão Geral

O sistema é composto por duas partes principais:
1. **Frontend**: Uma aplicação Next.js que fornece o site informativo personalizado para cada propriedade e o painel administrativo
2. **Backend**: Uma API RESTful desenvolvida com Node.js, Express e TypeScript para gerenciamento de usuários, propriedades, documentos e conteúdo

## Características

### Multi-Propriedade
- **Isolamento de Dados**: Cada propriedade tem seus próprios documentos e conteúdo
- **Templates Configuráveis**: O layout e conteúdo são adaptáveis para cada propriedade
- **Controle de Acesso**: Usuários só podem visualizar e gerenciar suas próprias propriedades

### Frontend (Web)
- **Design Responsivo**: Layout adaptável para todos os dispositivos
- **Autenticação Segura**: Acesso restrito ao painel administrativo
- **Gerenciamento de Conteúdo**: Interface para atualizar documentos e páginas
- **Personalização**: Cada propriedade tem seu próprio conjunto de páginas personalizáveis
- **Performance Otimizada**: Desenvolvido com Next.js para melhor desempenho e SEO

### Backend (API)
- **Sistema de Autenticação**: Gerenciamento de usuários com JWT e refresh tokens
- **Armazenamento de Documentos**: Upload e gerenciamento de arquivos organizados por propriedade
- **Segurança Avançada**: Proteção contra ataques comuns (CSRF, Rate Limiting)
- **API RESTful**: Endpoints bem definidos com validação de dados
- **Isolamento de Conteúdo**: Dados de cada propriedade são isolados por permissões de usuário

## Tecnologias Utilizadas

### Frontend
- [Next.js 14](https://nextjs.org/) - Framework React para renderização do lado do servidor
- [TypeScript](https://www.typescriptlang.org/) - JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [React](https://reactjs.org/) - Biblioteca JavaScript para interfaces de usuário

### Backend
- [Node.js](https://nodejs.org/) - Ambiente de execução JavaScript
- [Express](https://expressjs.com/) - Framework web para Node.js
- [TypeScript](https://www.typescriptlang.org/) - JavaScript com tipagem estática
- [JWT](https://jwt.io/) - JSON Web Tokens para autenticação
- [Zod](https://zod.dev/) - Validação de esquemas TypeScript

## Início Rápido

### Pré-requisitos

- Node.js 18.17 ou superior
- npm ou yarn

### Instalação e Execução do Frontend

1. Navegue até o diretório web:
```bash
cd web
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

4. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver o frontend.

### Instalação e Execução do Backend

1. Navegue até o diretório api:
```bash
cd api
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Crie um arquivo `.env` baseado no exemplo:
```
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=seu_secret_jwt_seguro_aqui
NODE_ENV=development
STORAGE_PATH=./uploads
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

5. A API estará disponível em [http://localhost:4000](http://localhost:4000).

## Estrutura do Projeto

```
defesa-admin-vv/
├── api/                    # Backend - API Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares (autenticação, etc.)
│   │   ├── models/         # Modelos de dados (usuários, propriedades, documentos)
│   │   ├── routes/         # Definição de rotas da API
│   │   └── server.ts       # Configuração do servidor
│   ├── tests/              # Testes automatizados
│   ├── uploads/            # Armazenamento de arquivos (organizados por propriedade)
│   │   ├── [propriedade1]/ # Pasta para documentos da propriedade 1
│   │   ├── [propriedade2]/ # Pasta para documentos da propriedade 2
│   │   └── ...
│   ├── package.json        # Dependências do backend
│   └── tsconfig.json       # Configuração do TypeScript
│
├── web/                    # Frontend - Next.js
│   ├── public/             # Arquivos estáticos (imagens, documentos)
│   ├── src/
│   │   ├── app/            # Rotas e páginas do Next.js
│   │   ├── components/     # Componentes React reutilizáveis
│   │   ├── contexts/       # Contextos React (autenticação, etc.)
│   │   └── utils/          # Utilitários e funções auxiliares
│   ├── package.json        # Dependências do frontend
│   └── next.config.js      # Configuração do Next.js
│
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Este arquivo
```

## Credenciais de Acesso (Ambiente de Desenvolvimento)

Para acessar o painel administrativo em ambiente de desenvolvimento:

- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email**: admin@example.com
- **Senha**: password123

**Importante**: Estas são credenciais para teste local apenas. Em produção, configure usuários reais com propriedades associadas e senhas seguras.

## Fluxo de Trabalho

1. **Cadastro de Propriedades**: O administrador cria uma nova propriedade no sistema
2. **Criação de Usuários**: Usuários são criados e associados a propriedades específicas
3. **Upload de Documentos**: Documentos relevantes são carregados para cada propriedade
4. **Personalização**: O conteúdo das páginas é editado de acordo com os detalhes específicos da propriedade
5. **Acesso do Usuário**: Cada usuário acessa apenas sua própria defesa administrativa personalizada

## Desenvolvimento

### Executando Testes

```bash
# Testes do backend
cd api
npm test

# Testes do frontend
cd web
npm test
```

### Construindo para Produção

#### Frontend
```bash
cd web
npm run build
# ou
yarn build
```

#### Backend
```bash
cd api
npm run build
# ou
yarn build
```

## Segurança

Este projeto implementa várias medidas de segurança:

- Autenticação JWT com refresh tokens
- Proteção contra CSRF (Cross-Site Request Forgery)
- Rate limiting para prevenir ataques de força bruta
- Validação rigorosa de dados com Zod
- Cookies HTTP-only para armazenamento seguro de tokens
- Isolamento de dados entre propriedades diferentes
- Verificação de permissões em todos os endpoints da API

## Exemplo: Fazenda Brilhante

A "Fazenda Brilhante" é o template inicial usado como referência, implementando uma defesa contra a notificação da FUNAI para estudos demarcatórios da Terra Indígena Dourados-Amambaipeguá II. Este exemplo serve como base para a criação de outras defesas administrativas personalizadas.

## Licença

Todos os direitos reservados.
