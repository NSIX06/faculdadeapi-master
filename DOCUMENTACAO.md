# Atestado Escolar — Documentação Completa

Sistema fullstack de gestão de atestados acadêmicos. Backend REST em **Next.js App Router**, banco de dados **PostgreSQL** via Neon (serverless), frontend integrado na mesma aplicação.

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

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env.local   # ou criar manualmente (ver seção 4)

# 3. Aplicar migrações no banco
npx prisma db push

# 4. (Opcional) Popular dados de exemplo
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 4. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexão PostgreSQL (ex: `postgresql://user:pass@host/db`) |
| `JWT_SECRET` | Sim | Segredo para assinar tokens JWT (mínimo 32 caracteres) |
| `NEXT_PUBLIC_API_BASE_URL` | Sim | URL base para chamadas da API no frontend (ex: `/proxy` ou `http://localhost:3000`) |
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

---

### Auth

#### `POST /api/auth/login`

Autentica um usuário e retorna JWT.

**Não requer autenticação.**

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

**Erros:**
| Status | Motivo |
|---|---|
| 400 | Email ou senha ausentes |
| 401 | Credenciais inválidas |

---

### Usuários

#### `GET /api/usuarios`

Lista todos os usuários.

**Escopo:** `usuarios:read`

**Resposta 200:** Array de `Usuario` (senha nunca incluída).

---

#### `POST /api/usuarios`

Cria um novo usuário.

**Escopo:** `usuarios:write`

**Body:**
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

| Campo | Obrigatório | Tipo |
|---|---|---|
| `nome` | Sim | String |
| `email` | Sim | String (único) |
| `senha` | Sim | String |
| `perfil` | Não | Enum (default: `ALUNO`) |
| `matricula` | Não | String (único) |
| `cpf` | Não | String (único) |

**Resposta 201:** Objeto `Usuario` criado.

**Erros:**
| Status | Motivo |
|---|---|
| 409 | Email, matrícula ou CPF já cadastrado |
| 422 | Dados inválidos |

---

#### `GET /api/usuarios/:id`

Retorna um usuário pelo ID.

**Escopo:** `usuarios:read`

**Resposta 200:** Objeto `Usuario`.  
**Resposta 404:** `{ "error": "usuário não encontrado" }`

---

#### `PUT /api/usuarios/:id`

Atualiza dados de um usuário.

**Escopo:** `usuarios:write`

**Body (todos opcionais):**
```json
{
  "nome": "João da Silva",
  "email": "joao.novo@escola.com"
}
```

**Resposta 200:** Objeto `Usuario` atualizado.

---

#### `DELETE /api/usuarios/:id`

Remove um usuário.

**Escopo:** `usuarios:delete`

**Resposta 204:** Sem corpo.  
**Resposta 404:** Usuário não encontrado.

---

### Atestados

#### `GET /api/atestados`

Lista atestados com filtros opcionais.

**Escopo:** `atestados:read`

**Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | Enum | `RECEBIDO`, `EM_ANALISE`, `APROVADO`, `RECUSADO` |
| `usuarioId` | Number | Filtra pelo aluno |

**Resposta 200:** Array com dados do atestado + `usuario` (id, nome, email, perfil) + `cronograma`.

---

#### `POST /api/atestados`

Cria um novo atestado.

**Escopo:** `atestados:write`

**Body:**
```json
{
  "usuarioId": 5,
  "periodo": "10/03/2025 a 14/03/2025",
  "motivo": "Consulta médica",
  "arquivoAnexo": "data:application/pdf;base64,JVBERi0x...",
  "cronogramaId": 1
}
```

| Campo | Obrigatório | Tipo |
|---|---|---|
| `usuarioId` | Sim | Int |
| `periodo` | Sim | String |
| `motivo` | Sim | String |
| `arquivoAnexo` | Não | String (URL ou base64) |
| `cronogramaId` | Não | Int |

**Resposta 201:** Atestado criado (status inicial: `RECEBIDO`).

> **Base64:** O campo `arquivoAnexo` aceita strings `data:application/pdf;base64,...` ou `data:image/jpeg;base64,...` para upload de arquivos do computador.

---

#### `GET /api/atestados/:id`

Retorna um atestado pelo ID com dados completos.

**Escopo:** `atestados:read`

**Resposta 200:** Atestado + usuário + cronograma + notificações.

---

#### `DELETE /api/atestados/:id`

Remove um atestado.

**Escopo:** `atestados:delete`

**Resposta 204:** Sem corpo.

---

#### `PATCH /api/atestados/:id/status`

Atualiza o status de um atestado. **Cria automaticamente uma notificação** para o aluno.

**Escopo:** `atestados:write`

**Body:**
```json
{
  "status": "APROVADO"
}
```

Para recusar, a `justificativaRecusa` é **obrigatória**:
```json
{
  "status": "RECUSADO",
  "justificativaRecusa": "Documento ilegível, favor reenviar."
}
```

**Resposta 200:** Atestado atualizado.

**Erros:**
| Status | Motivo |
|---|---|
| 404 | Atestado não encontrado |
| 422 | Status inválido ou justificativa ausente ao recusar |

---

### Turmas

#### `GET /api/turmas`

Lista todas as turmas com curso, disciplina e lista de alunos.

**Escopo:** `turmas:read`

---

#### `POST /api/turmas`

Cria uma nova turma.

**Escopo:** `turmas:write`

**Body:**
```json
{
  "codigoTurma": "ENG2025-1A",
  "cursoId": 1,
  "disciplinaId": 2
}
```

**Resposta 201:** Turma criada.  
**Resposta 409:** Código já existe.

---

#### `GET /api/turmas/:id`

Retorna uma turma com alunos vinculados.

**Escopo:** `turmas:read`

---

#### `PATCH /api/turmas/:id`

Vincula ou desvincula alunos da turma.

**Escopo:** `turmas:write`

**Body:**
```json
{
  "conectar": [3, 7, 12],
  "desconectar": [5]
}
```

Ambos os campos são opcionais e podem ser usados simultaneamente.

---

#### `DELETE /api/turmas/:id`

Remove uma turma.

**Escopo:** `turmas:delete`

**Resposta 204:** Sem corpo.

---

### Notificações

#### `GET /api/notificacoes`

Lista notificações com filtros opcionais.

**Escopo:** `notificacoes:read`

**Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `usuarioId` | Number | Filtra pelo destinatário |
| `naoLidas` | Boolean | `true` para retornar só não lidas |

---

#### `PATCH /api/notificacoes/:id`

Marca uma notificação como lida.

**Escopo:** `notificacoes:write`

**Body:**
```json
{ "lida": true }
```

**Resposta 200:** Notificação atualizada.

---

### Cronograma

#### `GET /api/cronograma`

Lista todos os cronogramas acadêmicos, ordenados por ano letivo.

**Escopo:** `cronograma:read`

---

#### `POST /api/cronograma`

Cria um novo cronograma.

**Escopo:** `cronograma:write`

**Body:**
```json
{
  "anoLetivo": 2025,
  "dataInicioSemestre": "2025-03-01",
  "dataFimSemestre": "2025-07-31",
  "periodosAvaliacao": "P1: 10/04, P2: 15/06, Exame: 25/07"
}
```

**Resposta 201:** Cronograma criado.  
**Erros 422:** Data de início após data de fim.

---

### Cursos

#### `GET /api/cursos`

Lista todos os cursos em ordem alfabética.

**Escopo:** `cursos:read`

---

#### `POST /api/cursos`

Cria um novo curso.

**Escopo:** `cursos:write`

**Body:**
```json
{ "nome": "Engenharia de Software" }
```

**Resposta 201:** Curso criado.  
**Resposta 409:** Nome já existe.

---

### Disciplinas

#### `GET /api/disciplinas`

Lista todas as disciplinas.

**Escopo:** `disciplinas:read`

---

#### `POST /api/disciplinas`

Cria uma nova disciplina.

**Escopo:** `disciplinas:write`

**Body:**
```json
{
  "nome": "Estrutura de Dados",
  "cargaHoraria": 80
}
```

**Resposta 201:** Disciplina criada.

---

### Relatórios

#### `GET /api/relatorios`

Lista todos os relatórios já gerados, do mais recente ao mais antigo.

**Escopo:** `relatorios:read`

---

#### `POST /api/relatorios`

Gera um novo relatório e o persiste no banco.

**Escopo:** `relatorios:read`

**Body — tipo `atestados_por_periodo`:**
```json
{
  "tipo": "atestados_por_periodo",
  "dataInicio": "2025-01-01",
  "dataFim": "2025-06-30"
}
```

Retorna contagem de atestados agrupada por status no período.

**Body — tipo `faltas_por_aluno`:**
```json
{
  "tipo": "faltas_por_aluno",
  "usuarioId": 5,
  "dataInicio": "2025-01-01",
  "dataFim": "2025-06-30"
}
```

Retorna atestados com status `APROVADO` do aluno (ou de todos, se `usuarioId` omitido).

**Resposta 201:**
```json
{
  "relatorio": { "id": 1, "tipoRelatorio": "...", "dataGeracao": "..." },
  "resultado": [ ... ]
}
```

---

### API Keys (Admin)

> Todos os endpoints abaixo exigem **JWT de administrador** (`perfil: ADMIN` ou `DIRECAO`). API keys não têm acesso.

#### `GET /api/api-keys`

Lista todas as API keys do sistema. O hash da chave nunca é exposto.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "name": "Frontend App",
    "prefix": "sk_9f31fd",
    "scopes": ["*"],
    "isActive": true,
    "expiresAt": null,
    "lastUsedAt": "2025-06-01T10:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "createdBy": { "id": 1, "nome": "Admin", "email": "admin@escola.com" }
  }
]
```

---

#### `POST /api/api-keys`

Cria uma nova API key. A chave completa é retornada **uma única vez**.

**Body:**
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
  "prefix": "sk_a1b2c3",
  "scopes": ["atestados:read", "notificacoes:read"],
  "key": "sk_a1b2c3_...",
  "aviso": "Esta é a única vez que a chave completa será exibida. Guarde-a agora."
}
```

---

#### `GET /api/api-keys/:id`

Retorna detalhes de uma API key pelo ID.

---

#### `PATCH /api/api-keys/:id`

Atualiza configurações de uma API key (nome, escopos, status, validade).

**Body (todos opcionais):**
```json
{
  "name": "Novo nome",
  "scopes": ["usuarios:read"],
  "isActive": false,
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

---

#### `DELETE /api/api-keys/:id`

Revoga (desativa) uma API key. A key não é excluída do banco — apenas `isActive` é definido como `false`.

**Resposta 200:** `{ "message": "chave revogada" }`

---

### Documentação OpenAPI

#### `GET /api/docs`

Renderiza a documentação interativa Scalar (OpenAPI 3.0) autenticada com JWT.

#### `GET /api/docs/key/:keyId`

Renderiza a documentação filtrada pelos escopos de uma API key específica — mostra apenas os endpoints que aquela key pode acessar.

#### `GET /api/openapi.json`

Retorna o JSON completo da especificação OpenAPI 3.0.

#### `GET /api/openapi.json/key/:keyId`

Retorna o JSON da especificação filtrado pelos escopos da API key.

---

## 11. Rotas do Frontend

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `app/page.tsx` | Redireciona para `/dashboard` |
| `/login` | `app/(auth)/login/page.tsx` | Tela de login com campo de senha visível/oculto |
| `/dashboard` | `app/(protected)/dashboard/page.tsx` | Painel com estatísticas, atestados recentes e gráfico de status |
| `/atestados` | `app/(protected)/atestados/page.tsx` | Grid de atestados, filtros, upload de arquivo, modal de detalhes/status |
| `/usuarios` | `app/(protected)/usuarios/page.tsx` | Tabela CRUD com busca e filtro por perfil |
| `/turmas` | `app/(protected)/turmas/page.tsx` | Grid de turmas, gerenciar alunos vinculados |
| `/notificacoes` | `app/(protected)/notificacoes/page.tsx` | Lista com toggle "somente não lidas" e marcar todas como lidas |
| `/cronograma` | `app/(protected)/cronograma/page.tsx` | Tabela de cronogramas acadêmicos |
| `/relatorios` | `app/(protected)/relatorios/page.tsx` | Grid com resultados, modal para gerar novo |
| `/cursos` | `app/(protected)/cursos/page.tsx` | Tabela com busca |
| `/disciplinas` | `app/(protected)/disciplinas/page.tsx` | Tabela com busca |
| `/perfil` | `app/(protected)/perfil/page.tsx` | Visualizar e editar nome/e-mail do usuário logado |
| `/admin` | `app/admin/page.tsx` | Painel de API keys (requer admin) |
| `/admin/login` | `app/admin/login/page.tsx` | Login do painel admin |
| `/admin/keys` | `app/admin/keys/page.tsx` | Gerenciar API keys |

### Layout Protegido

O arquivo `app/(protected)/layout.tsx` implementa:

- **Guard de autenticação:** redireciona para `/login` se não autenticado
- **Sidebar responsiva:** visível em desktop, colapsável em mobile via overlay
- **Header mobile:** botão de menu hambúrguer

---

## 12. Componentes de UI

Todos os componentes estão em `components/ui.tsx` e são marcados com `'use client'`.

### `Modal`

```tsx
<Modal open={boolean} onClose={() => void} title="string" size="sm|md|lg">
  {children}
</Modal>
```

Exibe um modal centralizado com backdrop blur. Fecha ao clicar no fundo.

---

### `StatusBadge`

```tsx
<StatusBadge status="RECEBIDO | EM_ANALISE | APROVADO | RECUSADO" />
```

Badge colorida por status:
- `RECEBIDO` → azul
- `EM_ANALISE` → âmbar
- `APROVADO` → verde
- `RECUSADO` → vermelho

---

### `PerfilBadge`

```tsx
<PerfilBadge perfil="ALUNO | RESPONSAVEL | SECRETARIA | COORDENACAO | DIRECAO | ADMIN" />
```

Badge por perfil de usuário, cada um com cor distinta.

---

### `DataTable<T>`

```tsx
<DataTable
  columns={Column<T>[]}
  data={T[]}
  keyField={keyof T}
/>
```

Tabela genérica e tipada. Exibe `EmptyState` automaticamente quando não há dados.

**Interface `Column<T>`:**
```ts
interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}
```

---

### `PageHeader`

```tsx
<PageHeader
  title="string"
  subtitle="string (opcional)"
  action={<ReactNode>} // botão de ação no canto direito
/>
```

---

### `EmptyState`

```tsx
<EmptyState message="Nenhum registro encontrado." />
```

---

### `Loading`

```tsx
<Loading text="Carregando..." />
```

Spinner animado centralizado.

---

### `Sidebar`

```tsx
<Sidebar onClose={() => void} />
```

Navegação lateral com:
- Logo e nome do sistema
- Links de navegação com ícones
- **Badge de notificações não lidas** (atualizado em tempo real)
- Link para Meu Perfil
- Botão de logout
- Exibição do nome e perfil do usuário logado

---

## 13. Serviços e Hooks

### `services/api.ts`

Cliente HTTP tipado. Todas as funções adicionam automaticamente os headers `X-Api-Key` e `Authorization: Bearer`.

```ts
// Auth
auth.login(data: LoginRequest): Promise<LoginResponse>

// Usuários
usuarios.list(): Promise<Usuario[]>
usuarios.get(id: number): Promise<Usuario>
usuarios.create(data: CreateUsuarioRequest): Promise<Usuario>
usuarios.update(id: number, data: UpdateUsuarioRequest): Promise<Usuario>
usuarios.delete(id: number): Promise<void>

// Atestados
atestados.list(params?: ListAtestadosParams): Promise<Atestado[]>
atestados.get(id: number): Promise<Atestado>
atestados.create(data: CreateAtestadoRequest): Promise<Atestado>
atestados.updateStatus(id: number, data: UpdateStatusRequest): Promise<Atestado>
atestados.delete(id: number): Promise<void>

// Turmas
turmas.list(): Promise<Turma[]>
turmas.get(id: number): Promise<Turma>
turmas.create(data: CreateTurmaRequest): Promise<Turma>
turmas.update(id: number, data: UpdateTurmaRequest): Promise<Turma>
turmas.delete(id: number): Promise<void>

// Notificações
notificacoes.list(params?: { usuarioId?: number; naoLidas?: boolean }): Promise<Notificacao[]>
notificacoes.markAsRead(id: number): Promise<void>

// Cronograma
cronograma.list(): Promise<Cronograma[]>
cronograma.create(data: CreateCronogramaRequest): Promise<Cronograma>

// Relatórios
relatorios.list(): Promise<Relatorio[]>
relatorios.generate(data: GenerateRelatorioRequest): Promise<Relatorio>

// Cursos
cursos.list(): Promise<Curso[]>
cursos.create(data: CreateCursoRequest): Promise<Curso>

// Disciplinas
disciplinas.list(): Promise<Disciplina[]>
disciplinas.create(data: CreateDisciplinaRequest): Promise<Disciplina>
```

**Tratamento de erros:** Lança `ApiError(status, message)` em respostas não-ok.

---

### `hooks/useApi.ts`

Hook genérico para busca de dados com estado de loading, erro e refetch.

```ts
const { data, isLoading, error, refetch } = useApi(() => svc.list())
```

**Características:**
- Usa `fetcherRef` para sempre chamar a versão mais recente do fetcher (evita closures obsoletas ao mudar filtros)
- Suporte a cancelamento via flag `cancelled` no `useEffect`
- `refetch()` incrementa um contador de trigger que dispara o `useEffect`

---

## 14. Contexto de Autenticação

`contexts/AuthContext.tsx` — Provider global que envolve toda a aplicação.

```ts
const { user, token, isLoading, isAuthenticated, login, logout } = useAuth()
```

| Valor/Função | Tipo | Descrição |
|---|---|---|
| `user` | `Usuario \| null` | Usuário logado |
| `token` | `string \| null` | JWT armazenado |
| `isLoading` | `boolean` | Carregando estado inicial do localStorage |
| `isAuthenticated` | `boolean` | `true` se token + user presentes |
| `login(data)` | `Promise<void>` | Chama `/api/auth/login` e persiste no localStorage |
| `logout()` | `void` | Limpa localStorage e estado |

**Persistência:** Token e usuário são salvos em `localStorage` (chaves `jwt_token` e `jwt_user`). Na inicialização, o context carrega esses valores. Protegido contra SSR com `typeof window !== 'undefined'`.

---

## 15. Painel Administrativo

Rota: `/admin`

Interface dedicada à gestão de API keys. Acessível apenas com credenciais de administrador (`ADMIN` ou `DIRECAO`).

### Funcionalidades

- **Listar API keys:** Exibe todas as keys com prefix, escopos, status e data do último uso
- **Criar API key:** Define nome, escopos e validade. A chave completa é exibida uma única vez no modal
- **Ativar/desativar:** Alterna `isActive` sem excluir do banco
- **Revogar:** Define `isActive = false` permanentemente

### Documentação interativa

Acesse `/api/docs` (com JWT) para explorar todos os endpoints via interface Scalar.  
Acesse `/api/docs/key/:keyId` para ver apenas os endpoints que aquela key pode acessar.

---

## Apêndice — Fluxo Completo de um Atestado

```
1. Aluno envia o atestado
   POST /api/atestados
   → status: RECEBIDO
   → arquivo em base64 no campo arquivoAnexo

2. Secretaria lista os atestados pendentes
   GET /api/atestados?status=RECEBIDO

3. Secretaria inicia a análise
   PATCH /api/atestados/:id/status  { "status": "EM_ANALISE" }
   → notificação criada para o aluno

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
