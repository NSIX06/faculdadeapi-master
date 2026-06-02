# Atestado Escolar — Documentação Completa

Sistema fullstack de gestão de atestados acadêmicos. Backend REST em **Next.js App Router**, banco de dados **PostgreSQL** via Neon (serverless), frontend integrado na mesma aplicação.

**Produção:** https://faculdadeapi.vercel.app

| Recurso | URL |
|---|---|
| Painel administrativo | `/admin/login` |
| Documentação interativa (Scalar) | `/api/docs` |
| Spec OpenAPI (JSON) | `/api/openapi.json` |

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Pré-requisitos e Instalação](#3-pré-requisitos-e-instalação)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [Scripts Disponíveis](#5-scripts-disponíveis)
6. [Arquitetura do Projeto](#6-arquitetura-do-projeto)
7. [Banco de Dados](#7-banco-de-dados)
8. [Autenticação e Autorização](#8-autenticação-e-autorização)
9. [Escopos de API Key](#9-escopos-de-api-key)
10. [Rotas da API (Backend)](#10-rotas-da-api-backend)
    - [Auth](#auth)
    - [Usuários](#usuários)
    - [Atestados](#atestados)
    - [Turmas](#turmas)
    - [Notificações](#notificações)
    - [Cronograma](#cronograma)
    - [Cursos](#cursos)
    - [Disciplinas](#disciplinas)
    - [Relatórios](#relatórios)
    - [API Keys (Admin)](#api-keys-admin)
    - [Documentação OpenAPI](#documentação-openapi)
11. [Rotas do Frontend](#11-rotas-do-frontend)
12. [Componentes de UI](#12-componentes-de-ui)
13. [Serviços e Hooks](#13-serviços-e-hooks)
14. [Contexto de Autenticação](#14-contexto-de-autenticação)
15. [Painel Administrativo](#15-painel-administrativo)
16. [Deploy no Vercel](#16-deploy-no-vercel)
17. [Testando com Postman](#17-testando-com-postman)

---

## 1. Visão Geral

O sistema permite que instituições de ensino gerenciem todo o ciclo de vida de atestados acadêmicos:

- Alunos submetem atestados (com arquivo anexado em base64)
- Secretaria/Coordenação analisa e atualiza o status
- Notificações automáticas são geradas a cada mudança de status
- Relatórios consolidados são gerados sob demanda
- Controle de acesso por perfil de usuário e por escopos de API key

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.7 |
| Runtime | Node.js | ≥ 20 |
| Banco de dados | PostgreSQL (Neon serverless) | — |
| ORM | Prisma | 7.8.0 |
| Autenticação | JWT (jsonwebtoken) | 9.0.3 |
| Hash de senhas | bcryptjs | 3.0.3 |
| Validação | Zod | 4.4.3 |
| Estilização | Tailwind CSS | 4.3.0 |
| Ícones | Lucide React | 1.17.0 |
| Toasts | react-hot-toast | 2.6.0 |
| Documentação API | Scalar (OpenAPI 3.0) | 0.10.20 |
| Linguagem | TypeScript | 5.x |

---

## 3. Pré-requisitos e Instalação

### Requisitos

- Node.js ≥ 20
- Banco PostgreSQL acessível (recomendado: [Neon](https://neon.tech))

### Passos

```bash
# 1. Instalar dependências (também executa prisma generate via postinstall)
npm install

# 2. Criar arquivo de variáveis de ambiente (ver seção 4)
cp .env.example .env.local

# 3. Aplicar migrações no banco
#    Use migrate dev em desenvolvimento (cria histórico de migrations):
npx prisma migrate dev
#    Ou db push para sincronizar sem migrations (mais rápido, menos controle):
npx prisma db push

# 4. (Opcional) Popular dados de exemplo
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Credenciais do seed

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `admin@escola.edu.br` | `Admin@123` |
| Direção | `direcao@escola.edu.br` | `Direcao@123` |
| Coordenação | `coordenacao@escola.edu.br` | `Coord@123` |
| Secretaria | `secretaria@escola.edu.br` | `Sec@123` |
| Aluno | `joao.silva@aluno.escola.edu.br` | `Aluno@123` |

---

## 4. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexão PostgreSQL — use o **pooler** do Neon em produção (ex: `postgresql://user:pass@host-pooler.regiao.aws.neon.tech/db?sslmode=require`) |
| `DIRECT_URL` | Sim (Migrations) | Conexão **direta** ao banco, usada pelo `prisma migrate`. Use o host sem pooler (ex: `postgresql://user:pass@host.regiao.aws.neon.tech/db?sslmode=require`) |
| `JWT_SECRET` | Sim | Segredo para assinar tokens JWT (mínimo 32 caracteres). Gere com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `NEXT_PUBLIC_API_BASE_URL` | Não | URL base para chamadas da API no frontend. Se omitida, padrão é `/api` (mesmo domínio). Em dev local, use `/proxy`. |
| `NEXT_PUBLIC_API_KEY` | Sim | API key com escopo `*` usada pelo frontend |

> **Nota sobre o proxy:** O `next.config.ts` define um rewrite `/proxy/:path*` → `https://faculdadeapi.vercel.app/api/:path*`. Em desenvolvimento local usando a API embutida, defina `NEXT_PUBLIC_API_BASE_URL=` (vazio) ou o endereço direto.

---

## 5. Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Desenvolvimento | `npm run dev` | Inicia com Turbopack em modo watch |
| Build | `npm run build` | Executa `prisma generate` e compila para produção |
| Produção | `npm run start` | Inicia servidor de produção |
| Lint | `npm run lint` | Executa ESLint |
| Seed | `npm run db:seed` | Popula dados iniciais via `prisma/seed.ts` |

---

## 6. Arquitetura do Projeto

### Fluxo de uma requisição

```
Cliente (frontend / Postman / integração)
        │
        │  Authorization: Bearer <jwt>   (usuários do sistema)
        │  X-Api-Key: <chave>            (integrações externas)
        ▼
  Route Handlers  (app/api/*)
        │
        │  getAuth() → valida JWT ou API Key
        │  requireScope() / requireAdmin()
        ▼
  Prisma Client (singleton) ──► Neon PostgreSQL (serverless)
```

### Estrutura de pastas

```
faculdadeapi-master/
│
├── app/
│   ├── (auth)/              # Rotas públicas (sem sidebar)
│   │   └── login/
│   ├── (protected)/         # Rotas autenticadas (com sidebar)
│   │   ├── layout.tsx       # Guard de autenticação + sidebar
│   │   ├── dashboard/
│   │   ├── atestados/
│   │   ├── usuarios/
│   │   ├── turmas/
│   │   ├── notificacoes/
│   │   ├── cronograma/
│   │   ├── relatorios/
│   │   ├── cursos/
│   │   ├── disciplinas/
│   │   └── perfil/
│   ├── admin/               # Painel administrativo de API keys
│   │   ├── login/
│   │   └── keys/
│   ├── api/                 # Handlers REST
│   │   ├── auth/login/
│   │   ├── usuarios/[id]/
│   │   ├── atestados/[id]/status/
│   │   ├── turmas/[id]/
│   │   ├── notificacoes/[id]/
│   │   ├── cronograma/
│   │   ├── cursos/
│   │   ├── disciplinas/
│   │   ├── relatorios/
│   │   ├── api-keys/[id]/
│   │   └── docs/            # Scalar API Reference
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Redirect → /dashboard
│
├── components/
│   ├── Sidebar.tsx          # Navegação lateral
│   └── ui.tsx               # Biblioteca de componentes compartilhados
│
├── contexts/
│   └── AuthContext.tsx      # Provider de autenticação JWT
│
├── hooks/
│   └── useApi.ts            # Hook genérico de fetch com refetch
│
├── services/
│   └── api.ts               # Cliente HTTP tipado para todos os endpoints
│
├── types/
│   └── index.ts             # Interfaces e tipos TypeScript
│
├── lib/
│   ├── auth.ts              # getAuth(), signJwt(), requireScope(), requireAdmin()
│   ├── prisma.ts            # Singleton do Prisma Client
│   ├── crypto.ts            # generateApiKey(), hashKey()
│   ├── scopes.ts            # VALID_SCOPES, hasScope()
│   ├── schemas.ts           # Schemas Zod reutilizáveis
│   └── openapi.ts           # Especificação OpenAPI 3.0 completa
│
├── prisma/
│   ├── schema.prisma        # Modelos do banco de dados
│   └── seed.ts              # Script de seed
│
├── next.config.ts           # Rewrites (proxy CORS)
├── tailwind.config.js       # Temas/cores customizadas
└── .env.local               # Variáveis de ambiente locais
```

---

## 7. Banco de Dados

### Diagrama de Entidades (simplificado)

```
Usuario (1) ─────── (N) Atestado
Usuario (1) ─────── (N) Notificacao
Usuario (N) ─────── (N) Turma  [TurmaAlunos]
Usuario (1) ─────── (N) ApiKey
Turma   (N) ─────── (1) Curso
Turma   (N) ─────── (1) Disciplina
Atestado (N) ────── (1) Cronograma
Atestado (1) ────── (N) Notificacao
```

### Modelos

#### `Usuario`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | Auto-incremento |
| `nome` | String | — |
| `email` | String | Único |
| `senhaHash` | String | bcrypt (nunca exposto) |
| `perfil` | Enum | `ALUNO \| RESPONSAVEL \| SECRETARIA \| COORDENACAO \| DIRECAO \| ADMIN` |
| `matricula` | String? | Único, preenchido para ALUNO |
| `cpf` | String? | Único, preenchido para RESPONSAVEL |
| `ramal` | String? | Para SECRETARIA |
| `departamento` | String? | Para COORDENACAO |
| `codigoDiretoria` | String? | Para DIRECAO |
| `createdAt` | DateTime | — |

> Modelo de herança single-table: todos os perfis compartilham a mesma tabela com campos nullable por perfil.

#### `Atestado`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `dataEmissao` | DateTime | Default: now() |
| `periodo` | String | Ex: "01/03/2025 a 05/03/2025" |
| `motivo` | String | Descrição da ausência |
| `arquivoAnexo` | String? | URL ou base64 do documento |
| `status` | Enum | `RECEBIDO \| EM_ANALISE \| APROVADO \| RECUSADO` |
| `justificativaRecusa` | String? | Obrigatória se status = RECUSADO |
| `usuarioId` | Int FK | Referência ao aluno |
| `cronogramaId` | Int? FK | Cronograma associado (opcional) |

#### `Turma`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `codigoTurma` | String | Único, ex: "ENG2025-1A" |
| `cursoId` | Int FK | — |
| `disciplinaId` | Int FK | — |
| `alunos` | Relação N:N | Via tabela `_TurmaAlunos` |

#### `Notificacao`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `mensagem` | String | Texto da notificação |
| `dataEnvio` | DateTime | Default: now() |
| `tipoStatus` | String | Status que gerou a notificação |
| `lida` | Boolean | Default: false |
| `usuarioId` | Int FK | Destinatário |
| `atestadoId` | Int? FK | Atestado origem (opcional) |

> Notificações são criadas **automaticamente** ao atualizar o status de um atestado via `PATCH /atestados/:id/status`.

#### `Cronograma`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `anoLetivo` | Int | Ex: 2025 |
| `dataInicioSemestre` | DateTime | — |
| `dataFimSemestre` | DateTime | — |
| `periodosAvaliacao` | String | Texto livre descrevendo as avaliações |

#### `Relatorio`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `tipoRelatorio` | String | `atestados_por_periodo \| faltas_por_aluno` |
| `dataGeracao` | DateTime | Default: now() |
| `parametrosFiltro` | String? | JSON com filtros aplicados |
| `resultado` | Json? | Resultado da query agregada |

#### `ApiKey`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int PK | — |
| `name` | String | Nome descritivo |
| `prefix` | String | Primeiros caracteres da key (exibição) |
| `keyHash` | String | SHA-256 da chave (nunca a chave em texto) |
| `scopes` | String[] | Lista de escopos autorizados |
| `isActive` | Boolean | Pode ser desativada sem exclusão |
| `expiresAt` | DateTime? | Validade opcional |
| `lastUsedAt` | DateTime? | Atualizado assincronamente a cada uso |
| `createdById` | Int FK | Admin que criou |

---

## 8. Autenticação e Autorização

O sistema suporta dois mecanismos de autenticação:

### JWT (usuários do frontend)

1. O cliente faz `POST /api/auth/login` com email e senha
2. A API valida com bcrypt e retorna um JWT assinado com validade de **8 horas**
3. O frontend armazena o token em `localStorage` (chave `jwt_token`)
4. Requisições subsequentes enviam `Authorization: Bearer <token>`

**Payload do JWT:**
```json
{ "usuarioId": 1, "perfil": "SECRETARIA" }
```

**Perfis admin** (`ADMIN`, `DIRECAO`) têm acesso total a todos os endpoints, sem verificação de escopo.

### API Key (integrações externas)

1. Admin cria uma key via `POST /api/api-keys` especificando escopos
2. A chave completa é retornada **uma única vez** — não é possível recuperá-la depois
3. Requisições enviam `X-Api-Key: <chave_completa>`
4. A API faz hash SHA-256 e compara com o `keyHash` armazenado
5. O `lastUsedAt` é atualizado de forma assíncrona (fire-and-forget)

### Fluxo de verificação

```
Request recebido
    │
    ├─ Header X-Api-Key presente?
    │       └─ Sim → busca keyHash no DB → verifica isActive + expiresAt → retorna AuthContext{type:"api-key"}
    │
    └─ Header Authorization: Bearer presente?
            └─ Sim → verifica JWT → retorna AuthContext{type:"jwt", isAdmin: perfil in [ADMIN,DIRECAO]}

Se nenhum → 401 Unauthorized
```

---

## 9. Escopos de API Key

| Escopo | Permissão |
|---|---|
| `usuarios:read` | Listar e consultar usuários |
| `usuarios:write` | Criar e atualizar usuários |
| `usuarios:delete` | Excluir usuários |
| `atestados:read` | Listar e consultar atestados |
| `atestados:write` | Criar atestados e atualizar status |
| `atestados:delete` | Excluir atestados |
| `turmas:read` | Listar e consultar turmas |
| `turmas:write` | Criar, editar e gerenciar alunos em turmas |
| `turmas:delete` | Excluir turmas |
| `notificacoes:read` | Listar notificações |
| `notificacoes:write` | Marcar notificações como lidas |
| `cronograma:read` | Listar cronogramas |
| `cronograma:write` | Criar cronogramas |
| `relatorios:read` | Listar e gerar relatórios |
| `cursos:read` | Listar cursos |
| `cursos:write` | Criar cursos |
| `disciplinas:read` | Listar disciplinas |
| `disciplinas:write` | Criar disciplinas |
| `*` | Acesso total — apenas admins podem criar keys com este escopo |

---

## 10. Rotas da API (Backend)

**Base URL (produção):** `https://faculdadeapi.vercel.app/api`  
**Base URL (local):** `http://localhost:3000/api`

**Headers comuns:**
```
Content-Type: application/json
Authorization: Bearer <jwt>   OU   X-Api-Key: <api_key>
```

> Códigos de resposta: `200/201` ok · `401` sem autenticação · `403` sem permissão · `404` não encontrado · `409` conflito · `422` dados inválidos

---

### Auth

#### `POST /api/auth/login`

Autentica um usuário e retorna JWT. **Não requer autenticação.**

**Body:**
```json
{
  "email": "admin@escola.com",
  "senha": "senha123"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "usuario": {
    "id": 1,
    "nome": "Admin Sistema",
    "email": "admin@escola.com",
    "perfil": "ADMIN",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Usuários

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/usuarios` | `usuarios:read` | Lista todos |
| `POST` | `/api/usuarios` | `usuarios:write` | Cria usuário |
| `GET` | `/api/usuarios/:id` | `usuarios:read` | Busca por ID |
| `PUT` | `/api/usuarios/:id` | `usuarios:write` | Atualiza |
| `DELETE` | `/api/usuarios/:id` | `usuarios:delete` | Remove |

**Body do POST:**
```json
{
  "nome": "João Silva",
  "email": "joao@escola.com",
  "senha": "senha123",
  "perfil": "ALUNO",
  "matricula": "2025001",
  "cpf": "123.456.789-00"
}
```

---

### Atestados

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/atestados` | `atestados:read` | Lista (filtros: `?status=`, `?usuarioId=`) |
| `POST` | `/api/atestados` | `atestados:write` | Cria atestado |
| `GET` | `/api/atestados/:id` | `atestados:read` | Busca por ID |
| `PATCH` | `/api/atestados/:id/status` | `atestados:write` | Atualiza status (gera notificação) |
| `DELETE` | `/api/atestados/:id` | `atestados:delete` | Remove |

**Body do POST:**
```json
{
  "usuarioId": 5,
  "periodo": "10/03/2025 a 14/03/2025",
  "motivo": "Consulta médica",
  "arquivoAnexo": "data:application/pdf;base64,JVBERi0x...",
  "cronogramaId": 1
}
```

> O campo `arquivoAnexo` aceita base64 (`data:application/pdf;base64,...` ou `data:image/jpeg;base64,...`) para upload direto de arquivos do computador.

**Body do PATCH status:**
```json
{ "status": "APROVADO" }
```
Para recusar, a `justificativaRecusa` é **obrigatória**:
```json
{ "status": "RECUSADO", "justificativaRecusa": "Documento ilegível." }
```

---

### Turmas

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/turmas` | `turmas:read` | Lista todas |
| `POST` | `/api/turmas` | `turmas:write` | Cria turma |
| `GET` | `/api/turmas/:id` | `turmas:read` | Busca por ID |
| `PATCH` | `/api/turmas/:id` | `turmas:write` | Vincula/desvincula alunos |
| `DELETE` | `/api/turmas/:id` | `turmas:delete` | Remove |

**Body do PATCH (vincular/desvincular alunos):**
```json
{
  "conectar": [3, 7, 12],
  "desconectar": [5]
}
```

---

### Notificações

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/notificacoes` | `notificacoes:read` | Lista (filtros: `?usuarioId=`, `?naoLidas=true`) |
| `PATCH` | `/api/notificacoes/:id` | `notificacoes:write` | Marca como lida |

**Body do PATCH:** `{ "lida": true }`

---

### Cronograma

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/cronograma` | `cronograma:read` | Lista todos |
| `POST` | `/api/cronograma` | `cronograma:write` | Cria cronograma |

**Body do POST:**
```json
{
  "anoLetivo": 2025,
  "dataInicioSemestre": "2025-03-01",
  "dataFimSemestre": "2025-07-31",
  "periodosAvaliacao": "P1: 10/04, P2: 15/06, Exame: 25/07"
}
```

---

### Cursos

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/cursos` | `cursos:read` | Lista todos (ordem alfabética) |
| `POST` | `/api/cursos` | `cursos:write` | Cria curso |

**Body do POST:** `{ "nome": "Engenharia de Software" }`

---

### Disciplinas

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/disciplinas` | `disciplinas:read` | Lista todas |
| `POST` | `/api/disciplinas` | `disciplinas:write` | Cria disciplina |

**Body do POST:** `{ "nome": "Estrutura de Dados", "cargaHoraria": 80 }`

---

### Relatórios

| Método | Rota | Escopo | Descrição |
|---|---|---|---|
| `GET` | `/api/relatorios` | `relatorios:read` | Lista gerados |
| `POST` | `/api/relatorios` | `relatorios:read` | Gera novo relatório |

**Body — atestados por período:**
```json
{ "tipo": "atestados_por_periodo", "dataInicio": "2025-01-01", "dataFim": "2025-06-30" }
```

**Body — faltas por aluno:**
```json
{ "tipo": "faltas_por_aluno", "usuarioId": 5, "dataInicio": "2025-01-01", "dataFim": "2025-06-30" }
```

---

### API Keys (Admin)

> Exigem **JWT de administrador** (`ADMIN` ou `DIRECAO`). API keys não têm acesso a estes endpoints.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/api-keys` | Lista todas as keys |
| `POST` | `/api/api-keys` | Cria nova key (chave exibida uma única vez) |
| `GET` | `/api/api-keys/:id` | Detalhe da key |
| `PATCH` | `/api/api-keys/:id` | Atualiza nome/escopos/status/validade |
| `DELETE` | `/api/api-keys/:id` | Revoga (define `isActive = false`) |

**Body do POST:**
```json
{
  "name": "Sistema de Integração",
  "scopes": ["atestados:read", "notificacoes:read"],
  "expiresAt": "2026-01-01T00:00:00.000Z"
}
```

**Resposta 201:**
```json
{
  "id": 2,
  "name": "Sistema de Integração",
  "key": "sk_a1b2c3_...",
  "aviso": "Esta é a única vez que a chave completa será exibida. Guarde-a agora."
}
```

---

### Documentação OpenAPI

| Rota | Descrição |
|---|---|
| `GET /api/docs` | Interface Scalar interativa (requer JWT) |
| `GET /api/docs/key/:keyId` | Documentação filtrada pelos escopos da key |
| `GET /api/openapi.json` | Spec OpenAPI 3.0 completa em JSON |
| `GET /api/openapi.json/key/:keyId` | Spec filtrada pelos escopos da key |

---

## 11. Rotas do Frontend

| Rota | Descrição |
|---|---|
| `/` | Redireciona para `/dashboard` |
| `/login` | Tela de login com campo de senha visível/oculto |
| `/dashboard` | Painel com estatísticas, atestados recentes e gráfico de status |
| `/atestados` | Grid de atestados, filtros por status e aluno, upload de arquivo, modal de detalhes/status |
| `/usuarios` | Tabela CRUD com busca por nome/e-mail/matrícula e filtro por perfil |
| `/turmas` | Grid de turmas, gerenciar alunos vinculados |
| `/notificacoes` | Lista com toggle "somente não lidas" e marcar todas como lidas |
| `/cronograma` | Tabela de cronogramas acadêmicos |
| `/relatorios` | Grid com resultados, modal para gerar novo |
| `/cursos` | Tabela com busca |
| `/disciplinas` | Tabela com busca |
| `/perfil` | Visualizar e editar nome/e-mail do usuário logado |
| `/admin` | Painel de API keys (requer admin) |
| `/admin/login` | Login do painel admin |
| `/admin/keys` | Gerenciar API keys |

### Layout Protegido

O arquivo `app/(protected)/layout.tsx` implementa:

- **Guard de autenticação:** redireciona para `/login` se não autenticado
- **Sidebar responsiva:** visível em desktop, colapsável em mobile via overlay
- **Header mobile:** botão de menu hambúrguer

---

## 12. Componentes de UI

Todos os componentes estão em `components/ui.tsx`.

### `Modal`
```tsx
<Modal open={boolean} onClose={() => void} title="string" size="sm|md|lg">
  {children}
</Modal>
```
Modal centralizado com backdrop blur. Fecha ao clicar no fundo.

### `StatusBadge`
```tsx
<StatusBadge status="RECEBIDO | EM_ANALISE | APROVADO | RECUSADO" />
```
Badge colorida: `RECEBIDO` → azul · `EM_ANALISE` → âmbar · `APROVADO` → verde · `RECUSADO` → vermelho.

### `PerfilBadge`
```tsx
<PerfilBadge perfil="ALUNO | RESPONSAVEL | SECRETARIA | COORDENACAO | DIRECAO | ADMIN" />
```

### `DataTable<T>`
```tsx
<DataTable columns={Column<T>[]} data={T[]} keyField={keyof T} />
```
Tabela genérica tipada. Exibe `EmptyState` automaticamente quando não há dados.

### `PageHeader`
```tsx
<PageHeader title="string" subtitle="string?" action={<ReactNode>} />
```

### `Sidebar`
Navegação lateral com badge de notificações não lidas, link para perfil e botão de logout.

---

## 13. Serviços e Hooks

### `services/api.ts`

Cliente HTTP tipado. Adiciona automaticamente `X-Api-Key` e `Authorization: Bearer` em todas as requisições.

```ts
auth.login(data)
usuarios.list() / .get(id) / .create(data) / .update(id, data) / .delete(id)
atestados.list(params?) / .get(id) / .create(data) / .updateStatus(id, data) / .delete(id)
turmas.list() / .get(id) / .create(data) / .update(id, data) / .delete(id)
notificacoes.list(params?) / .markAsRead(id)
cronograma.list() / .create(data)
relatorios.list() / .generate(data)
cursos.list() / .create(data)
disciplinas.list() / .create(data)
```

Lança `ApiError(status, message)` em respostas não-ok.

### `hooks/useApi.ts`

```ts
const { data, isLoading, error, refetch } = useApi(() => svc.list())
```

Usa `fetcherRef` para sempre chamar a versão mais recente do fetcher — evita closures obsoletas ao mudar filtros. Suporta cancelamento e `refetch()` por contador de trigger.

---

## 14. Contexto de Autenticação

`contexts/AuthContext.tsx` — Provider global.

```ts
const { user, token, isLoading, isAuthenticated, login, logout } = useAuth()
```

| Valor/Função | Descrição |
|---|---|
| `user` | Usuário logado (`Usuario \| null`) |
| `token` | JWT armazenado (`string \| null`) |
| `isLoading` | Carregando estado inicial do localStorage |
| `isAuthenticated` | `true` se token + user presentes |
| `login(data)` | Chama `/api/auth/login` e persiste no localStorage |
| `logout()` | Limpa localStorage e estado |

Token e usuário persistem em `localStorage` (chaves `jwt_token` e `jwt_user`). Protegido contra SSR com `typeof window !== 'undefined'`.

---

## 15. Painel Administrativo

Rota: `/admin` — acessível apenas com JWT de `ADMIN` ou `DIRECAO`.

- Listar API keys com prefix, escopos, status e data do último uso
- Criar keys com escopos granulares (chave exibida uma única vez)
- Ativar/desativar sem excluir do banco
- Revogar permanentemente
- Abrir documentação Scalar filtrada por key: `/api/docs/key/:keyId`

---

## 16. Deploy no Vercel

1. Conecte o repositório ao Vercel
2. Em **Settings → Environment Variables**, adicione:
   - `DATABASE_URL` — connection string do Neon (pooler)
   - `DIRECT_URL` — connection string direta (sem pooler)
   - `JWT_SECRET` — segredo JWT
   - `NEXT_PUBLIC_API_KEY` — API key com escopo `*`
   - `NEXT_PUBLIC_API_BASE_URL` **não precisa ser definida** — o padrão `/api` funciona no mesmo domínio
3. O build já executa `prisma generate` automaticamente (script `postinstall`)
4. Faça o deploy 🚀

> Em mudanças de schema, rode `npx prisma migrate deploy` antes do deploy.

---

## 17. Testando com Postman

Há uma coleção pronta em `postman/Atestado-Escolar.postman_collection.json`.

1. No Postman: **Import** → selecione o arquivo
2. Rode na ordem: **Login** → **Criar API Key** → demais pastas
3. As variáveis (`{{jwt}}`, `{{apiKey}}`, ids) são salvas automaticamente entre as requisições

A coleção inclui testes de segurança (`401` sem auth, `403` com escopo insuficiente).

---

## Apêndice — Fluxo Completo de um Atestado

```
1. Aluno envia o atestado
   POST /api/atestados  →  status: RECEBIDO
   (arquivo PDF/imagem convertido para base64 no campo arquivoAnexo)

2. Secretaria lista os atestados pendentes
   GET /api/atestados?status=RECEBIDO

3. Secretaria inicia a análise
   PATCH /api/atestados/:id/status  { "status": "EM_ANALISE" }
   → notificação criada automaticamente para o aluno

4a. Secretaria aprova
    PATCH /api/atestados/:id/status  { "status": "APROVADO" }
    → notificação criada para o aluno

4b. Secretaria recusa
    PATCH /api/atestados/:id/status  { "status": "RECUSADO", "justificativaRecusa": "..." }
    → notificação criada para o aluno

5. Aluno consulta notificações
   GET /api/notificacoes?usuarioId=5&naoLidas=true

6. Aluno marca como lida
   PATCH /api/notificacoes/:id  { "lida": true }

7. Coordenação gera relatório mensal
   POST /api/relatorios  { "tipo": "atestados_por_periodo", "dataInicio": "...", "dataFim": "..." }
```
