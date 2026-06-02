"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Credenciais inválidas."); return; }
      if (!["ADMIN", "DIRECAO"].includes(data.usuario?.perfil)) {
        setError("Acesso restrito a administradores."); return;
      }
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.usuario));
      router.replace("/admin/keys");
    } catch {
      setError("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("admin@escola.edu.br");
    setSenha("Admin@123");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.25fr_1fr]">

      {/* ════════ Painel de marca (esquerda) ════════ */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-12 xl:p-16">
        {/* Mesh de fundo */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-600/30 blur-[120px]" />
          <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-blue-600/20 blur-[120px]" />
          {/* Grade sutil */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        {/* Topo: marca */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-900/50">
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <p className="font-semibold tracking-tight text-white">Atestado Escolar</p>
            <p className="text-xs text-slate-400">Plataforma de Integração</p>
          </div>
        </div>

        {/* Meio: headline */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white">
            Gerencie o acesso
            <br />
            à sua API com
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              precisão.
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-400">
            Crie chaves com permissões granulares e entregue a cada
            desenvolvedor uma documentação que reflete exatamente o que ele pode acessar.
          </p>
        </div>

        {/* Base: features */}
        <div className="relative z-10 space-y-1">
          {[
            { icon: "🔑", title: "Chaves com escopos", desc: "Controle por recurso e ação" },
            { icon: "📋", title: "Docs sob medida", desc: "Cada dev vê só o que pode usar" },
            { icon: "🛡️", title: "Revogação instantânea", desc: "Desative acessos num clique" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-white/5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-base backdrop-blur">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{f.title}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ════════ Formulário (direita) ════════ */}
      <main className="flex min-h-screen flex-col bg-white">
        {/* Header mobile */}
        <div className="flex items-center gap-2.5 p-6 lg:hidden">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700">
            <span className="text-base">🎓</span>
          </div>
          <span className="font-semibold tracking-tight text-slate-900">Atestado Escolar</span>
        </div>

        {/* Form centralizado */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
          <div className="w-full max-w-[380px] animate-slide-up">
            <div className="mb-8">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Painel Administrativo
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Bem-vindo de volta
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Entre com suas credenciais para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* E-mail */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <div className="group relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center text-slate-400 transition group-focus-within:text-indigo-500">
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="admin@escola.edu.br"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha" className="mb-2 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <div className="group relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center text-slate-400 transition group-focus-within:text-indigo-500">
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="senha"
                    type={showPwd ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition hover:text-slate-600"
                    aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPwd ? (
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Entrando…
                  </>
                ) : (
                  <>
                    Entrar
                    <svg className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Helper de credenciais demo */}
            <button
              onClick={fillDemo}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <div>
                <p className="text-xs font-medium text-slate-600">Usar credenciais de demonstração</p>
                <p className="font-mono text-xs text-slate-400">admin@escola.edu.br</p>
              </div>
              <span className="text-xs font-medium text-indigo-600">Preencher →</span>
            </button>

            <p className="mt-8 text-center text-xs text-slate-400">
              Acesso exclusivo para administradores e direção.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
