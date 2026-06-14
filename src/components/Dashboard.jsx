import { useEffect, useMemo, useState } from "react";

/**
 * @typedef {{
 *  id: any, nombre: any, edad: any, telefono: any,
 *  correo: any, categoria: any, sede: any, notas: any, fecha: string
 * }} Registro
 */

const C = {
  red: "#D50032",
  redDark: "#B8002A",
  bg: "#F4F5F7",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  line: "#E5E7EB",
  soft: "#F9FAFB",
  blackBtn: "#0B0B0C",
};

const PAGE_SIZE = 15;

/** @param {{ registros: Registro[] }} props */
export default function Dashboard({ registros }) {
  const [q, setQ] = useState("");
  const [sedeSel, setSedeSel] = useState("Todas");
  const [catSel, setCatSel] = useState("Todas");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null); // jugador seleccionado para modal
  const [usuario, setUsuario] = useState(null);

  // Protección de sesión
  useEffect(() => {
    const raw = localStorage.getItem("usuario");
    if (!raw) {
      window.location.assign("/admin");
      return;
    }
    try {
      setUsuario(JSON.parse(raw));
    } catch {
      window.location.assign("/admin");
    }
  }, []);

  // Reiniciar página al cambiar filtros
  useEffect(() => { setPage(1); }, [q, sedeSel, catSel]);

  const formatFecha = (s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  };

  const data = useMemo(() => {
    const safe = Array.isArray(registros) ? registros : [];
    const norm = (v, fallback) => (v == null || v === "" ? fallback : String(v));
    const toDate = (s) => { const d = new Date(s); return isNaN(d.getTime()) ? null : d; };

    const sedesMap = new Map();
    const catsMap = new Map();
    for (const r of safe) {
      const sede = norm(r?.sede, "Sin sede");
      const cat = norm(r?.categoria, "Sin categoría");
      sedesMap.set(sede, (sedesMap.get(sede) ?? 0) + 1);
      catsMap.set(cat, (catsMap.get(cat) ?? 0) + 1);
    }

    const sedes = ["Todas", ...Array.from(sedesMap.keys()).sort()];
    const categorias = ["Todas", ...Array.from(catsMap.keys()).sort()];

    const now = new Date();
    const last30 = safe.filter((r) => {
      const d = toDate(r?.fecha);
      if (!d) return false;
      return now - d <= 30 * 24 * 60 * 60 * 1000 && now - d >= 0;
    }).length;

    let filtrados = safe;
    if (sedeSel !== "Todas") filtrados = filtrados.filter((r) => norm(r?.sede, "Sin sede") === sedeSel);
    if (catSel !== "Todas") filtrados = filtrados.filter((r) => norm(r?.categoria, "Sin categoría") === catSel);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      filtrados = filtrados.filter((r) =>
        String(r?.nombre ?? "").toLowerCase().includes(needle) ||
        String(r?.correo ?? "").toLowerCase().includes(needle) ||
        String(r?.telefono ?? "").toLowerCase().includes(needle)
      );
    }

    const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginados = filtrados.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return {
      total: safe.length, last30, sedes, categorias, filtrados, paginados,
      totalPages, safePage,
      sedesCount: Math.max(0, sedes.length - 1),
      catsCount: Math.max(0, categorias.length - 1),
      sedesMap, catsMap, norm,
    };
  }, [registros, q, sedeSel, catSel, page]);

  function handleLogout() {
    localStorage.removeItem("usuario");
    window.location.assign("/admin");
  }

  function exportCSV() {
    const headers = ["Nombre", "Edad", "Teléfono", "Correo", "Categoría", "Sede", "Fecha", "Notas"];
    const rows = data.filtrados.map((r) => [
      r.nombre ?? "", r.edad ?? "", r.telefono ?? "", r.correo ?? "",
      r.categoria ?? "", r.sede ?? "", r.fecha ?? "", r.notas ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registros-toluca-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!usuario) return null; // redirigiendo

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      {/* Modal de detalle */}
      {detail && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setDetail(null)}
        >
          <div
            style={{ background: C.card, borderRadius: 24, width: "min(500px, 96vw)", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ height: 5, background: C.red }} />
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: C.soft, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>
                  {(String(detail?.nombre ?? "X")[0] || "X").toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 17 }}>{detail.nombre}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{detail.correo}</div>
                </div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              {[
                ["Edad", `${detail.edad ?? "—"} años`],
                ["Teléfono", detail.telefono ?? "—"],
                ["Categoría", detail.categoria ?? "—"],
                ["Sede", detail.sede ?? "—"],
                ["Fecha registro", detail.fecha ?? "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{v}</div>
                </div>
              ))}
              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, marginBottom: 3 }}>Notas</div>
                <div style={{ fontSize: 13.5, color: C.text, background: C.soft, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", minHeight: 48 }}>
                  {detail.notas || "Sin notas"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex min-h-screen border-r" style={{ width: 270, borderColor: C.line, background: C.card }}>
          <div className="w-full p-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: C.soft, border: `2px solid ${C.red}`, boxShadow: "0 8px 24px rgba(213,0,50,.12)" }}>
                <img src="/img/Club_Toluca_Logo.png" alt="Logo" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <div className="font-extrabold leading-tight text-sm">Toluca Altas Montañas</div>
                <div className="text-xs" style={{ color: C.muted }}>Admin Panel</div>
              </div>
            </div>

            <nav className="space-y-1">
              <NavItem active icon="📊" label="Dashboard" C={C} />
              <NavItem icon="📝" label="Registros" C={C} />
              <NavItem icon="📍" label="Sedes" C={C} />
              <NavItem icon="🏷️" label="Categorías" C={C} />
            </nav>

            {/* Distribución por categoría */}
            {data.catsCount > 0 && (
              <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: C.muted, marginBottom: 10 }}>Por categoría</div>
                {Array.from(data.catsMap.entries()).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>
                      <span style={{ color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{cat}</span>
                      <span style={{ color: C.muted }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: C.line, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round((count / data.total) * 100)}%`, background: C.red, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto rounded-2xl p-4" style={{ border: `1px solid ${C.line}`, background: C.soft }}>
              <div className="text-xs" style={{ color: C.muted }}>Sesión activa</div>
              <div className="font-bold">{usuario?.nombre ?? "Administrador"}</div>
              <div className="text-xs mt-1" style={{ color: C.muted }}>{usuario?.email ?? "—"}</div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-2xl px-4 py-2 font-extrabold transition text-sm"
                style={{ background: C.blackBtn, color: "white" }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar mobile drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full p-4 flex flex-col gap-6" style={{ width: 290, background: C.card, borderRight: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ background: C.soft, border: `2px solid ${C.red}` }}>
                    <img src="/img/Club_Toluca_Logo.png" alt="Logo" className="w-9 h-9 object-contain" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm leading-tight">Toluca Altas Montañas</div>
                    <div className="text-xs" style={{ color: C.muted }}>Admin Panel</div>
                  </div>
                </div>
                <button className="rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.line}` }} onClick={() => setSidebarOpen(false)}>✕</button>
              </div>
              <nav className="space-y-1">
                <NavItem active icon="📊" label="Dashboard" C={C} />
                <NavItem icon="📝" label="Registros" C={C} />
                <NavItem icon="📍" label="Sedes" C={C} />
                <NavItem icon="🏷️" label="Categorías" C={C} />
              </nav>
              <div className="mt-auto">
                <button onClick={handleLogout} className="w-full rounded-2xl px-4 py-3 font-extrabold text-sm" style={{ background: C.blackBtn, color: "white" }}>
                  Cerrar sesión
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Topbar */}
          <div className="sticky top-0 z-40 border-b" style={{ background: "rgba(255,255,255,.88)", borderColor: C.line, backdropFilter: "blur(12px)" }}>
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
              <button className="lg:hidden rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${C.line}`, background: C.card }} onClick={() => setSidebarOpen(true)}>☰</button>
              <div className="text-sm font-bold" style={{ color: C.muted }}>
                Panel · <span style={{ color: C.red }}>Toluca Altas Montañas</span>
              </div>
              <button
                onClick={exportCSV}
                className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition"
                style={{ border: `1px solid ${C.line}`, background: C.card, color: C.text }}
                title="Exportar registros filtrados a CSV"
              >
                ⬇️ Exportar CSV
              </button>
            </div>
          </div>

          {/* Header hero */}
          <section className="mx-auto max-w-6xl px-4 pt-6">
            <div className="rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: "0 18px 50px rgba(0,0,0,.08)" }}>
              <div style={{ height: 6, background: C.red }} />
              <div className="p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold tracking-[0.25em] uppercase" style={{ color: C.muted }}>Panel de Administración</p>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: C.red }}>Registros del Club</h1>
                  <p className="mt-1 text-sm" style={{ color: C.muted }}>Gestiona sedes, categorías y jugadores registrados.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={exportCSV}
                    className="sm:hidden inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-extrabold text-sm transition"
                    style={{ background: C.soft, color: C.text, border: `1px solid ${C.line}` }}
                  >
                    ⬇️ CSV
                  </button>
                  <a href="#registro" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-extrabold text-sm transition" style={{ background: C.red, color: "white", boxShadow: "0 10px 28px rgba(213,0,50,.18)" }}>
                    ＋ Nuevo registro
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Contenido */}
          <section className="mx-auto max-w-6xl px-4 py-6 space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard title="Total registros" value={data.total} hint="Global" icon="👥" C={C} />
              <KpiCard title="Últimos 30 días" value={data.last30} hint="Actividad" icon="📅" C={C} />
              <KpiCard title="Sedes" value={data.sedesCount} hint="Distribución" icon="📍" C={C} />
              <KpiCard title="Categorías" value={data.catsCount} hint="Academia" icon="🏷️" C={C} />
            </div>

            {/* Filtros */}
            <div className="rounded-3xl p-4" style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(0,0,0,.05)" }}>
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }}>🔎</span>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por nombre, correo o teléfono…"
                      className="w-full rounded-2xl pl-9 pr-3 py-3 outline-none text-sm"
                      style={{ background: C.soft, border: `1px solid ${C.line}` }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = C.red)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = C.line)}
                    />
                  </div>
                  <select value={sedeSel} onChange={(e) => setSedeSel(e.target.value)} className="w-full md:w-48 rounded-2xl px-3 py-3 outline-none text-sm" style={{ background: C.soft, border: `1px solid ${C.line}` }}>
                    {data.sedes.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select value={catSel} onChange={(e) => setCatSel(e.target.value)} className="w-full md:w-48 rounded-2xl px-3 py-3 outline-none text-sm" style={{ background: C.soft, border: `1px solid ${C.line}` }}>
                    {data.categorias.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="text-sm shrink-0" style={{ color: C.muted }}>
                  Mostrando: <b style={{ color: C.text }}>{data.filtrados.length}</b>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="rounded-3xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: "0 18px 50px rgba(0,0,0,.08)" }}>
              <div className="px-4 py-3 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.red }} />
                <h2 className="font-extrabold">Listado de registros</h2>
                <span className="text-xs" style={{ color: C.muted }}>({data.filtrados.length})</span>
              </div>

              {/* Headers desktop */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 border-t text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ borderColor: C.line, background: C.soft, color: C.muted }}>
                <div className="col-span-4">Jugador</div>
                <div className="col-span-2">Teléfono</div>
                <div className="col-span-2">Categoría</div>
                <div className="col-span-2">Sede</div>
                <div className="col-span-2">Fecha</div>
              </div>

              <div className="divide-y" style={{ borderColor: C.line }}>
                {data.paginados.map((r, idx) => (
                  <div
                    key={r.id ?? `${r.correo}-${idx}`}
                    className="group relative cursor-pointer"
                    onClick={() => setDetail(r)}
                  >
                    <div className="absolute left-0 top-0 h-full w-1 opacity-0 group-hover:opacity-100 transition" style={{ background: C.red }} />
                    <div
                      className="grid grid-cols-12 gap-3 px-4 py-4 items-center transition"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(213,0,50,.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center font-extrabold shrink-0" style={{ background: C.soft, border: `1px solid ${C.line}` }}>
                          {(String(r?.nombre ?? "X")[0] || "X").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold truncate">{r.nombre ?? "Sin nombre"}</div>
                          <div className="text-xs truncate" style={{ color: C.muted }}>{r.correo ?? "—"}</div>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-2 text-sm" style={{ color: C.text }}>{r.telefono ?? "—"}</div>
                      <div className="col-span-6 md:col-span-2">
                        <ChipPrimary text={data.norm(r.categoria, "Sin categoría")} C={C} />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <ChipSoft text={data.norm(r.sede, "Sin sede")} C={C} />
                      </div>
                      <div className="col-span-6 md:col-span-2 text-sm" style={{ color: C.muted }}>{formatFecha(r.fecha)}</div>
                    </div>
                  </div>
                ))}

                {data.filtrados.length === 0 && (
                  <div className="px-4 py-12 text-center" style={{ color: C.muted }}>
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-semibold">No hay resultados con esos filtros.</div>
                  </div>
                )}
              </div>

              {/* Paginación */}
              {data.totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between gap-3" style={{ borderColor: C.line, background: C.soft }}>
                  <span className="text-sm" style={{ color: C.muted }}>
                    Página <b style={{ color: C.text }}>{data.safePage}</b> de <b style={{ color: C.text }}>{data.totalPages}</b>
                  </span>
                  <div className="flex gap-2">
                    <PagBtn label="← Anterior" disabled={data.safePage <= 1} onClick={() => setPage((p) => p - 1)} C={C} />
                    {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                      const p = data.safePage <= 3 ? i + 1 : data.safePage - 2 + i;
                      if (p < 1 || p > data.totalPages) return null;
                      return (
                        <PagBtn key={p} label={String(p)} active={p === data.safePage} onClick={() => setPage(p)} C={C} />
                      );
                    })}
                    <PagBtn label="Siguiente →" disabled={data.safePage >= data.totalPages} onClick={() => setPage((p) => p + 1)} C={C} />
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, C }) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-extrabold transition"
      style={{
        background: active ? C.red : "transparent",
        color: active ? "white" : C.text,
        border: active ? `1px solid ${C.red}` : "1px solid transparent",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(213,0,50,.06)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: active ? "rgba(255,255,255,.18)" : "#F3F4F6", border: active ? "1px solid rgba(255,255,255,.25)" : "1px solid #E5E7EB" }}>
        {icon}
      </span>
      {label}
    </a>
  );
}

function KpiCard({ title, value, hint, icon, C }) {
  return (
    <div className="rounded-3xl p-4" style={{ background: C.card, border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(0,0,0,.06)" }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-extrabold tracking-[0.15em] uppercase mb-1" style={{ color: C.muted }}>{title}</div>
          <div className="text-3xl font-extrabold" style={{ color: C.text }}>{value}</div>
        </div>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#EEF2F7" }}>
        <div className="h-full rounded-full" style={{ width: "60%", background: C.red }} />
      </div>
      <div className="mt-1.5 text-xs font-semibold" style={{ color: C.muted }}>{hint}</div>
    </div>
  );
}

function ChipPrimary({ text, C }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: C.red, color: "white" }}>
      {text}
    </span>
  );
}

function ChipSoft({ text, C }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: C.soft, border: `1px solid ${C.line}`, color: C.text }}>
      {text}
    </span>
  );
}

function PagBtn({ label, onClick, disabled, active, C }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl px-3 py-1.5 text-xs font-bold transition"
      style={{
        background: active ? C.red : C.card,
        color: active ? "white" : disabled ? C.muted : C.text,
        border: `1px solid ${active ? C.red : C.line}`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}
