# Design Spec: Atestado Escolar — Frontend

**Date:** 2026-06-02  
**Status:** Approved  
**Project location:** `C:\Users\felip\Downloads\atestado-escolar-frontend`

---

## Overview

A standalone React SPA that consumes the deployed Atestado Escolar REST API at `https://faculdadeapi.vercel.app/api`. It covers the full academic certificate workflow: students submit atestados, coordinators validate them, and all roles can view notifications, reports, and schedules.

---

## Stack

| Concern | Library |
|---|---|
| Bundler | Vite |
| UI framework | React 18 + TypeScript |
| Styling | TailwindCSS 3 (custom `brand` color palette, DM Sans + Plus Jakarta Sans fonts) |
| Routing | React Router DOM v6 |
| Toast feedback | react-hot-toast |
| Icons | lucide-react |
| Conditional classes | clsx |
| Date utilities | date-fns (optional, for display formatting) |

---

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── vite-env.d.ts
├── types/
│   └── index.ts          # All TS interfaces + enums
├── services/
│   └── api.ts            # HTTP client + all endpoint namespaces
├── contexts/
│   └── AuthContext.tsx   # login/logout, token persistence, useAuth()
├── hooks/
│   └── useApi.ts         # Generic async data-fetching hook
├── components/
│   ├── Layout.tsx        # Sidebar + header + <Outlet>
│   ├── ProtectedRoute.tsx
│   └── ui.tsx            # All shared UI primitives
└── pages/
    ├── Login.tsx
    ├── Dashboard.tsx
    ├── Usuarios.tsx
    ├── Atestados.tsx
    ├── Turmas.tsx
    ├── Notificacoes.tsx
    ├── Cronograma.tsx
    ├── Relatorios.tsx
    ├── Cursos.tsx
    └── Disciplinas.tsx
```

---

## Configuration

**`tailwind.config.js`**
- Extend with `brand` color palette (green-emerald, 50–950; brand-500 = `#24a872`, brand-950 = dark sidebar)
- Fonts: `"DM Sans"` (body) and `"Plus Jakarta Sans"` (display/headings)

**`tsconfig.json`** — path alias `@/*` → `src/*`

**`vite.config.ts`** — resolve alias `@` → `/src`

**`index.html`** — Google Fonts: DM Sans + Plus Jakarta Sans

**`.env`** (gitignored):
```
VITE_API_BASE_URL=https://faculdadeapi.vercel.app/api
VITE_API_KEY=
```

**`.env.example`** (committed):
```
VITE_API_BASE_URL=https://faculdadeapi.vercel.app/api
VITE_API_KEY=your_api_key_here
```

---

## TypeScript Types (`src/types/index.ts`)

### Enums
```ts
type Perfil = 'ALUNO' | 'RESPONSAVEL' | 'SECRETARIA' | 'COORDENACAO' | 'DIRECAO' | 'ADMIN'
type StatusAtestado = 'RECEBIDO' | 'EM_ANALISE' | 'APROVADO' | 'RECUSADO'
type TipoRelatorio = 'atestados_por_periodo' | 'faltas_por_aluno'
```

### Entities
- `Usuario`: id, nome, email, perfil, matricula?, cpf?, ramal?, departamento?, codigoDiretoria?, createdAt
- `Atestado`: id, dataEmissao, periodo, motivo, arquivoAnexo?, status, justificativaRecusa?, usuarioId, usuario?, cronogramaId?
- `Turma`: id, codigoTurma, curso (Curso), disciplina (Disciplina), alunos[]
- `Curso`: id, nome
- `Disciplina`: id, nome, cargaHoraria
- `Notificacao`: id, mensagem, dataEnvio, tipoStatus, lida, usuarioId
- `Relatorio`: id, tipoRelatorio, dataGeracao, parametrosFiltro?, resultado?
- `Cronograma`: id, anoLetivo, dataInicioSemestre, dataFimSemestre, periodosAvaliacao

### Request DTOs
- `LoginRequest`: email, senha → `LoginResponse`: token, usuario
- `CreateUsuarioRequest`: nome, email, senha, perfil?, matricula?, cpf?
- `UpdateUsuarioRequest`: nome?, email?
- `CreateAtestadoRequest`: usuarioId, periodo, motivo, arquivoAnexo?, cronogramaId?
- `UpdateStatusRequest`: status, justificativaRecusa?
- `CreateTurmaRequest`: codigoTurma, cursoId, disciplinaId
- `UpdateTurmaRequest`: conectar? (number[]), desconectar? (number[])
- `CreateCronogramaRequest`: anoLetivo, dataInicioSemestre, dataFimSemestre, periodosAvaliacao
- `GenerateRelatorioRequest`: tipo, dataInicio?, dataFim?, usuarioId?
- `CreateCursoRequest`: nome
- `CreateDisciplinaRequest`: nome, cargaHoraria

---

## API Client (`src/services/api.ts`)

### Request helper
1. Reads `VITE_API_BASE_URL` and `VITE_API_KEY` from `import.meta.env`
2. Reads JWT from `localStorage('jwt_token')`
3. Sets headers: `Content-Type: application/json`, `X-Api-Key`, `Authorization: Bearer <token>`
4. HTTP 204 → returns `null`; 2xx → parse JSON; otherwise → throws `ApiError(status, message)`

### Namespaces
```
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

---

## Auth Context (`src/contexts/AuthContext.tsx`)

- State: `user: Usuario | null`, `token: string | null`, `isLoading: boolean`
- On mount: restores `jwt_token` + `user` from `localStorage`
- `login(data)`: calls `auth.login()`, persists to localStorage + state
- `logout()`: clears localStorage + state
- `isAuthenticated`: derived `!!token`
- Exported via `useAuth()` custom hook

---

## useApi Hook (`src/hooks/useApi.ts`)

```ts
function useApi<T>(fetcher: () => Promise<T>, deps?: unknown[]): {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}
```
- `useEffect` re-runs when an internal `trigger` counter increments
- Cancelled flag prevents state updates after unmount
- `refetch()` increments the trigger

---

## Shared UI Components (`src/components/ui.tsx`)

| Component | Description |
|---|---|
| `Modal` | Backdrop blur overlay, title, close button, sizes sm/md/lg, fadeIn animation |
| `StatusBadge` | RECEBIDO=blue, EM_ANALISE=amber, APROVADO=green, RECUSADO=red with ring-inset |
| `PerfilBadge` | Color per perfil value |
| `DataTable<T>` | Typed columns array, custom cell renderers, hover rows |
| `PageHeader` | h1 (font-display bold) + subtitle + action slot |
| `EmptyState` | Inbox icon + centered message |
| `Loading` | Spinner + text |

---

## Layout (`src/components/Layout.tsx`)

- **Sidebar** (272px, `brand-950` bg): Logo "AE · Atestado Escolar", 9 nav links with lucide icons, footer with user avatar (initials), name, perfil, logout button
- **Top header**: mobile menu toggle, greeting
- **Main**: `<Outlet />` with padding
- **Mobile**: sidebar hidden by default, opens via overlay with slide transition

**Nav links (all roles):** Painel · Atestados · Usuários · Turmas · Notificações · Cronograma · Relatórios · Cursos · Disciplinas · (footer) Ajuda · Sair

---

## Pages

### Login (`/login`)
- Split: left half decorative (brand-950, radial gradient, large title), right half with form
- Fields: email + password (show/hide toggle)
- On submit: `useAuth().login()` → navigate to `/dashboard`
- Already authenticated → redirect to `/dashboard`
- Shows test credentials: `admin@escola.edu.br / Admin@123`

### Dashboard (`/dashboard`)
- Greeting: "Bom dia/tarde/noite, {nome}!"
- 4 stat cards (grid): total atestados, total usuários, total turmas, notificações não lidas (each is a Link to the relevant page)
- Atestados Recentes: 5 most recent sorted by dataEmissao desc, with StatusBadge
- Status Breakdown: 4 progress bars (RECEBIDO, EM_ANALISE, APROVADO, RECUSADO) with count + percentage

### Usuários (`/usuarios`)
- PageHeader + "Novo Usuário" button
- DataTable: ID, Nome, Email, Perfil (PerfilBadge), Matrícula, Ações (edit/delete icons)
- Create modal: nome, email, senha, perfil (select), matricula, cpf
- Edit modal: nome, email only
- Delete: native `confirm()` dialog

### Atestados (`/atestados`)
- PageHeader + "Novo Atestado" button
- Status filter select (all statuses + "Todos")
- Card grid (3 cols): StatusBadge, motivo, período, aluno name, recusa justification if applicable, "Detalhes" + "Excluir" buttons
- Create modal: select aluno (ALUNO perfil only), período text, motivo textarea, arquivoAnexo URL input
- Detail modal: full info grid + "Atualizar Status" section with select; justificativa textarea appears conditionally when RECUSADO is selected

### Turmas (`/turmas`)
- Card grid (3 cols): code badge, curso name, disciplina name, aluno count
- Create modal: código, select curso, select disciplina
- Manage modal: turma info + vincular aluno (select filtered to non-members) + list of current alunos with desvincular button

### Notificações (`/notificacoes`)
- "Somente não lidas" toggle (drives `?naoLidas=true` param)
- Vertical list: bell icon, mensagem, dataEnvio formatted, tipoStatus badge
- Unread: left border brand-500, light bg, check button to mark read
- Read: muted gray style

### Cronograma (`/cronograma`)
- PageHeader + "Novo Cronograma" button
- DataTable: ano letivo, data início, data fim, períodos de avaliação
- Create modal: anoLetivo (number), dataInicio (date), dataFim (date), periodosAvaliacao (textarea)

### Relatórios (`/relatorios`)
- PageHeader + "Gerar Relatório" button
- Card grid (3 cols): icon by tipo, tipo label, dataGeracao, parametros, resultado JSON in `<pre>` scrollable
- Generate modal: select tipo, dataInicio, dataFim, aluno select (shown only for `faltas_por_aluno`)

### Cursos (`/cursos`)
- PageHeader + "Novo Curso" button
- DataTable: ID, Nome (with GraduationCap icon)
- Create modal: nome field only

### Disciplinas (`/disciplinas`)
- PageHeader + "Nova Disciplina" button
- DataTable: ID, Nome (BookOpen icon), Carga Horária (gray badge, "Xh")
- Create modal: nome + cargaHoraria (number)

---

## Routing (`App.tsx`)

```
/login                    → Login (public)
/dashboard                → Dashboard (protected)
/usuarios                 → Usuarios (protected)
/atestados                → Atestados (protected)
/turmas                   → Turmas (protected)
/notificacoes             → Notificacoes (protected)
/cronograma               → Cronograma (protected)
/relatorios               → Relatorios (protected)
/cursos                   → Cursos (protected)
/disciplinas              → Disciplinas (protected)
* → redirect /dashboard
```

`ProtectedRoute` wraps all authenticated routes; `Layout` is the shared shell via nested route with `<Outlet>`.

---

## Global CSS (`src/index.css`)

### Component utilities (`@layer components`)
- `.btn-primary` — brand green, rounded-xl, shadow, scale(0.98) on active
- `.btn-secondary` — white + border, hover gray
- `.btn-danger` — red
- `.btn-ghost` — transparent + hover gray
- `.input-field` — rounded-xl, border gray-200, focus ring brand
- `.select-field` — same as input-field
- `.card` — rounded-2xl, border subtle, shadow-sm, p-6
- `.label` — text-sm font-medium text-gray-700

### Extras
- Custom scrollbar: 6px, rounded, gray
- `fadeIn` animation: opacity 0→1 + translateY 8px→0, 0.3s ease-out
- `.animate-fade-in-delay-{1..4}` — staggered delays

---

## Mutations Pattern

All page mutations follow this pattern:
```ts
async function handleAction() {
  try {
    await service.method(payload)
    toast.success('Mensagem de sucesso')
    refetch()
    setModalOpen(false)
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Erro inesperado')
  }
}
```

---

## Out of Scope

- Role-based sidebar (all users see all 9 links; API enforces permissions)
- Global state management library (context + local state is sufficient)
- File upload (arquivoAnexo is a URL string, not a file input)
- Pagination UI (API returns full lists; no pagination endpoints documented)
