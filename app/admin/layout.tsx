"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = { nome: string; email: string; perfil: string };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const raw = localStorage.getItem("admin_user");
    const isLoginPage = pathname === "/admin/login";
    if (!token && !isLoginPage) { router.replace("/admin/login"); return; }
    if (raw) { try { setUser(JSON.parse(raw)); } catch { /* noop */ } }
    setReady(true);
  }, [pathname, router]);

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.replace("/admin/login");
  }

  const isLoginPage = pathname === "/admin/login";
  if (!ready) return null;
  if (isLoginPage) return <>{children}</>;

  const initials = user?.nome
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "A";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* ════════ Header ════════ */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Marca */}
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm shadow-sm shadow-indigo-200">
              🎓
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none tracking-tight text-slate-900">Atestado Escolar</p>
              <p className="mt-1 text-xs text-slate-400">Painel de API</p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="/admin/keys"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                pathname.startsWith("/admin/keys")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              API Keys
            </a>
            <a
              href="/api/docs"
              target="_blank"
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Documentação
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </nav>

          {/* Usuário desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {user && (
              <div className="text-right">
                <p className="text-xs font-medium leading-none text-slate-900">{user.nome}</p>
                <p className="mt-1 text-xs text-slate-400">{user.perfil}</p>
              </div>
            )}
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
              {initials}
            </div>
            <button
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              title="Sair"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>

          {/* Botão menu mobile */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
            aria-label="Menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu mobile expandido */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden animate-fade-in">
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.nome}</p>
                  <p className="text-xs text-slate-400">{user.perfil}</p>
                </div>
              </div>
            )}
            <a href="/admin/keys" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50">
              API Keys
            </a>
            <a href="/api/docs" target="_blank" className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Documentação ↗
            </a>
            <button onClick={logout} className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
              Sair
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
