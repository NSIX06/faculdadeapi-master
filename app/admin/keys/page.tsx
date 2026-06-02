"use client";

import { useEffect, useState, useCallback } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────────

type ApiKey = {
  id: number;
  name: string;
  prefix: string;
  scopes: string[];
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  createdBy: { nome: string; email: string };
};

type NewKeyResponse = ApiKey & { key: string };

// ── Escopos agrupados ──────────────────────────────────────────────────────────

const SCOPE_GROUPS = [
  { label: "Usuários",     icon: "👤", scopes: ["usuarios:read","usuarios:write","usuarios:delete"] },
  { label: "Atestados",    icon: "📄", scopes: ["atestados:read","atestados:write","atestados:delete"] },
  { label: "Turmas",       icon: "🏫", scopes: ["turmas:read","turmas:write","turmas:delete"] },
  { label: "Notificações", icon: "🔔", scopes: ["notificacoes:read","notificacoes:write"] },
  { label: "Cronograma",   icon: "📅", scopes: ["cronograma:read","cronograma:write"] },
  { label: "Relatórios",   icon: "📊", scopes: ["relatorios:read"] },
  { label: "Cursos",       icon: "🎓", scopes: ["cursos:read","cursos:write"] },
  { label: "Disciplinas",  icon: "📚", scopes: ["disciplinas:read","disciplinas:write"] },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function scopePill(s: string) {
  if (s === "*") return "bg-violet-100 text-violet-700";
  if (s.endsWith(":read"))   return "bg-sky-100 text-sky-700";
  if (s.endsWith(":write"))  return "bg-amber-100 text-amber-700";
  if (s.endsWith(":delete")) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" });
}

function fmtRelative(iso: string | null) {
  if (!iso) return "Nunca usada";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora mesmo";
  if (min < 60) return `Há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `Há ${d}d`;
  return fmtDate(iso);
}

function authHeader(): HeadersInit {
  const t = localStorage.getItem("admin_token");
  return { Authorization: `Bearer ${t}`, "Content-Type": "application/json" };
}

// ── Pílulas de escopo (reutilizável) ────────────────────────────────────────────

function ScopeList({ scopes, max = 3 }: { scopes: string[]; max?: number }) {
  if (scopes.includes("*")) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${scopePill("*")}`}>
        ★ Acesso total
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {scopes.slice(0, max).map((s) => (
        <span key={s} className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${scopePill(s)}`}>
          {s}
        </span>
      ))}
      {scopes.length > max && (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          +{scopes.length - max}
        </span>
      )}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      Ativa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Revogada
    </span>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all");
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [toast, setToast] = useState("");

  // form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [allAccess, setAllAccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // revelação
  const [newKey, setNewKey] = useState<NewKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/api-keys", { headers: authHeader() });
      if (r.ok) setKeys(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  // ── Ações ──────────────────────────────────────────────────────────────────

  async function createKey() {
    setFormError("");
    if (!name.trim()) { setFormError("Informe um nome para a chave."); return; }
    const sel = allAccess ? ["*"] : scopes;
    if (!sel.length) { setFormError("Selecione ao menos um escopo."); return; }
    setCreating(true);
    try {
      const r = await fetch("/api/api-keys", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ name: name.trim(), scopes: sel, ...(expiresAt && { expiresAt }) }),
      });
      const d = await r.json();
      if (!r.ok) { setFormError(d.error ?? "Erro ao criar."); return; }
      setNewKey(d); setShowCreate(false); resetForm(); fetchKeys();
    } finally { setCreating(false); }
  }

  async function doRevoke() {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const r = await fetch(`/api/api-keys/${revokeTarget.id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (!r.ok && r.status !== 204) {
        const d = await r.json().catch(() => ({}));
        showToast(d.error ?? "Erro ao revogar.");
        return;
      }
      setRevokeTarget(null);
      showToast("Chave revogada com sucesso.");
      fetchKeys();
    } finally {
      setRevoking(false);
    }
  }

  function resetForm() {
    setName(""); setScopes([]); setAllAccess(false); setExpiresAt(""); setFormError("");
  }

  function toggleScope(s: string) {
    setScopes((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  }

  function toggleGroup(groupScopes: string[]) {
    const allOn = groupScopes.every((s) => scopes.includes(s));
    setScopes((p) =>
      allOn ? p.filter((s) => !groupScopes.includes(s)) : [...new Set([...p, ...groupScopes])]
    );
  }

  function copyKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyDocsLink(id: number) {
    navigator.clipboard.writeText(`${window.location.origin}/api/docs/key/${id}`);
    showToast("Link da documentação copiado!");
  }

  // ── Dados derivados ────────────────────────────────────────────────────────

  const displayed = keys.filter((k) =>
    filter === "all" ? true : filter === "active" ? k.isActive : !k.isActive
  );
  const stats = {
    total: keys.length,
    active: keys.filter((k) => k.isActive).length,
    revoked: keys.filter((k) => !k.isActive).length,
  };
  const selectedCount = allAccess ? "todos" : `${scopes.length}`;

  // ── Ações por linha (botões inline) ────────────────────────────────────────

  function RowActions({ k }: { k: ApiKey }) {
    return (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => window.open(`/api/docs/key/${k.id}`, "_blank")}
          title="Ver documentação"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          onClick={() => copyDocsLink(k.id)}
          title="Copiar link dos docs"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m6.656-2.828a4 4 0 00-5.656 0l-3 3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5" />
          </svg>
        </button>
        <button
          onClick={() => setRevokeTarget(k)}
          title="Revogar chave"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">

      {/* ── Título da página ─────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">API Keys</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Crie e gerencie as chaves de acesso à API, definindo o que cada uma pode consultar.
        </p>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total de chaves", value: stats.total, hint: "criadas no total", ring: "ring-slate-200",
            icon: <span className="text-lg">🔑</span>, bg: "bg-slate-50" },
          { label: "Chaves ativas", value: stats.active, hint: "em uso agora", ring: "ring-emerald-100",
            icon: <span className="text-lg">✅</span>, bg: "bg-emerald-50" },
          { label: "Chaves revogadas", value: stats.revoked, hint: "desativadas", ring: "ring-rose-100",
            icon: <span className="text-lg">🚫</span>, bg: "bg-rose-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ${s.ring}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.bg}`}>{s.icon}</div>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{s.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* ── Controles ────────────────────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["all","active","revoked"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                filter === f ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}>
              {{ all: "Todas", active: "Ativas", revoked: "Revogadas" }[f]}
            </button>
          ))}
        </div>

        <button onClick={() => { resetForm(); setShowCreate(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.99]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Key
        </button>
      </div>

      {/* ── Lista ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-slate-400">
          <svg className="mr-3 h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Carregando chaves…
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-slate-50 text-3xl">🔑</div>
          <p className="font-semibold text-slate-900">
            {filter === "all" ? "Nenhuma chave ainda" : `Nenhuma chave ${filter === "active" ? "ativa" : "revogada"}`}
          </p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            {filter === "all"
              ? "Crie sua primeira API key para conectar aplicações à sua API."
              : "Ajuste o filtro acima para ver outras chaves."}
          </p>
          {filter === "all" && (
            <button onClick={() => { resetForm(); setShowCreate(true); }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
              + Criar primeira key
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                  {["Chave","Escopos","Status","Criada","Último uso",""].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((k) => (
                  <tr key={k.id} className={`group transition hover:bg-slate-50/60 ${!k.isActive ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{k.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">{k.prefix}…</code>
                        <span className="text-xs text-slate-400">por {k.createdBy.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs"><ScopeList scopes={k.scopes} /></td>
                    <td className="px-5 py-4"><StatusBadge active={k.isActive} /></td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{fmtDate(k.createdAt)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">{fmtRelative(k.lastUsedAt)}</td>
                    <td className="px-5 py-4 text-right">{k.isActive && <RowActions k={k} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {displayed.map((k) => (
              <div key={k.id} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${!k.isActive ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{k.name}</p>
                    <code className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">{k.prefix}…</code>
                  </div>
                  <StatusBadge active={k.isActive} />
                </div>
                <div className="mt-3"><ScopeList scopes={k.scopes} max={4} /></div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>Criada {fmtDate(k.createdAt)}</span>
                  <span>{fmtRelative(k.lastUsedAt)}</span>
                </div>
                {k.isActive && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button onClick={() => window.open(`/api/docs/key/${k.id}`, "_blank")}
                      className="rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition active:bg-slate-50">
                      📋 Docs
                    </button>
                    <button onClick={() => copyDocsLink(k.id)}
                      className="rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition active:bg-slate-50">
                      🔗 Link
                    </button>
                    <button onClick={() => setRevokeTarget(k)}
                      className="rounded-lg border border-rose-200 py-2 text-xs font-medium text-rose-600 transition active:bg-rose-50">
                      🚫 Revogar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ════════ Modal: Criar key ════════ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in">
          <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl animate-scale-in">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Nova API Key</h2>
                <p className="mt-0.5 text-sm text-slate-500">{selectedCount} escopo(s) selecionado(s)</p>
              </div>
              <button onClick={() => setShowCreate(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">×</button>
            </div>

            {/* Corpo */}
            <div className="space-y-6 overflow-y-auto px-6 py-5">
              {/* Nome */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nome da chave</label>
                <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                  placeholder="ex: Front-end React, App Mobile, Pipeline CI…"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10" />
                <p className="mt-1.5 text-xs text-slate-400">Use um nome que identifique quem vai consumir a chave.</p>
              </div>

              {/* Acesso total */}
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                allAccess ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
              }`}>
                <input type="checkbox" checked={allAccess}
                  onChange={(e) => { setAllAccess(e.target.checked); setScopes([]); }}
                  className="h-4 w-4 accent-violet-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-violet-900">Acesso total <span className="font-mono text-violet-500">(*)</span></p>
                  <p className="text-xs text-violet-600">Permissão irrestrita a todos os recursos. Use só para chaves de confiança.</p>
                </div>
              </label>

              {/* Escopos */}
              {!allAccess && (
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">Escopos de acesso</p>
                  <div className="space-y-3">
                    {SCOPE_GROUPS.map((g) => {
                      const allOn = g.scopes.every((s) => scopes.includes(s));
                      return (
                        <div key={g.label} className="rounded-xl border border-slate-200 p-3">
                          <div className="mb-2.5 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <span>{g.icon}</span> {g.label}
                            </span>
                            <button type="button" onClick={() => toggleGroup(g.scopes)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                              {allOn ? "Limpar" : "Selecionar tudo"}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {g.scopes.map((s) => {
                              const on = scopes.includes(s);
                              const action = s.split(":")[1];
                              return (
                                <button key={s} type="button" onClick={() => toggleScope(s)}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                    on ? scopePill(s) + " ring-2 ring-inset ring-current/30"
                                       : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                  }`}>
                                  {on && "✓ "}{action}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expiração */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expiração <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10" />
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span>⚠</span> {formError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:flex-none sm:px-5">
                Cancelar
              </button>
              <button onClick={createKey} disabled={creating}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50 sm:flex-none sm:px-6">
                {creating ? "Criando…" : "Criar Key"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Modal: Key revelada ════════ */}
      {newKey && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in">
          <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl animate-scale-in">
            {/* Topo de alerta */}
            <div className="border-b border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl">🔐</div>
                <div>
                  <h2 className="font-bold text-amber-900">Copie sua chave agora</h2>
                  <p className="mt-0.5 text-sm text-amber-700">
                    Esta é a <strong>única vez</strong> que ela será exibida por completo.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Chave — {newKey.name}</p>
                <div className="rounded-xl bg-slate-950 px-4 py-4">
                  <p className="break-all font-mono text-sm leading-relaxed text-emerald-400">{newKey.key}</p>
                </div>
                <button onClick={copyKey}
                  className={`mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition ${
                    copied ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                           : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}>
                  {copied ? "✓ Copiado para a área de transferência" : "📋 Copiar chave"}
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Escopos concedidos</p>
                <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-50 p-3">
                  {newKey.scopes.map((s) => (
                    <span key={s} className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${scopePill(s)}`}>
                      {s === "*" ? "★ acesso total" : s}
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 select-none">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600" />
                <span className="text-sm text-slate-700">Confirmo que copiei a chave em local seguro.</span>
              </label>

              <div className="flex gap-3 pt-1">
                <button onClick={() => window.open(`/api/docs/key/${newKey.id}`, "_blank")}
                  className="flex-1 rounded-xl border border-indigo-200 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50">
                  📋 Ver documentação
                </button>
                <button onClick={() => { if (confirmed) { setNewKey(null); setConfirmed(false); } }}
                  disabled={!confirmed}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Modal: Confirmar revogação ════════ */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in">
          <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-sm sm:rounded-3xl animate-scale-in">
            <div className="px-6 pt-6 pb-2 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-2xl">🚫</div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Revogar esta chave?</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                A chave <strong className="text-slate-700">{revokeTarget.name}</strong>{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">{revokeTarget.prefix}…</code>{" "}
                será desativada. As aplicações que a usam perderão acesso <strong>imediatamente</strong>. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-5">
              <button onClick={() => setRevokeTarget(null)} disabled={revoking}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={doRevoke} disabled={revoking}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60">
                {revoking ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Revogando…
                  </>
                ) : "Sim, revogar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Toast ════════ */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
