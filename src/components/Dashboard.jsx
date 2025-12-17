import { useMemo, useState } from "react";

/**
 * @typedef {{
 *  id: any,
 *  nombre: any,
 *  edad: any,
 *  telefono: any,
 *  correo: any,
 *  categoria: any,
 *  sede: any,
 *  notas: any,
 *  fecha: string
 * }} Registro
 */

/** @param {{ registros: Registro[] }} props */
export default function Dashboard({ registros }) {
  const [q, setQ] = useState("");
  const [sedeSel, setSedeSel] = useState("Todas");
  const [catSel, setCatSel] = useState("Todas");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // === Paleta coherente con tu landing ===
  // Base: blanco/gris claro | Primario: rojo | Secundario: negro/gris
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

  const formatFecha = (s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const data = useMemo(() => {
    const safe = Array.isArray(registros) ? registros : [];

    const norm = (v, fallback) =>
      v == null || v === "" ? fallback : String(v);
    const toDate = (s) => {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };

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
      const diff = now.getTime() - d.getTime();
      return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    }).length;

    let filtrados = safe;

    if (sedeSel !== "Todas") {
      filtrados = filtrados.filter(
        (r) => norm(r?.sede, "Sin sede") === sedeSel
      );
    }

    if (catSel !== "Todas") {
      filtrados = filtrados.filter(
        (r) => norm(r?.categoria, "Sin categoría") === catSel
      );
    }

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      filtrados = filtrados.filter((r) => {
        const nombre = String(r?.nombre ?? "").toLowerCase();
        const correo = String(r?.correo ?? "").toLowerCase();
        const tel = String(r?.telefono ?? "").toLowerCase();
        return (
          nombre.includes(needle) ||
          correo.includes(needle) ||
          tel.includes(needle)
        );
      });
    }

    return {
      total: safe.length,
      last30,
      sedes,
      categorias,
      filtrados,
      sedesCount: Math.max(0, sedes.length - 1),
      catsCount: Math.max(0, categorias.length - 1),
      norm,
    };
  }, [registros, q, sedeSel, catSel]);

  if (!registros) return <p className="p-6">Cargando...</p>;

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside
          className="hidden lg:flex min-h-screen border-r"
          style={{ width: 280, borderColor: C.line, background: C.card }}
        >
          <div className="w-full p-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: C.soft,
                  border: `2px solid ${C.red}`,
                  boxShadow: "0 12px 28px rgba(213,0,50,0.12)",
                }}
              >
                <img
                  src="/img/Club_Toluca_Logo.png"
                  alt="Club Toluca Logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <div className="font-extrabold leading-tight">
                  Toluca Altas Montañas
                </div>
                <div className="text-xs" style={{ color: C.muted }}>
                  Admin Panel
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <NavItem active icon="📊" label="Dashboard" C={C} />
              <NavItem icon="📝" label="Registros" C={C} />
              <NavItem icon="📍" label="Sedes" C={C} />
              <NavItem icon="🏷️" label="Categorías" C={C} />
              <NavItem icon="📈" label="Reportes" C={C} />
              <NavItem icon="⚙️" label="Configuración" C={C} />
            </nav>

            <div
              className="mt-auto rounded-2xl p-4"
              style={{ border: `1px solid ${C.line}`, background: C.soft }}
            >
              <div className="text-xs" style={{ color: C.muted }}>
                Sesión
              </div>
              <div className="font-bold">Administrador</div>
              <div className="text-xs mt-1" style={{ color: C.muted }}>
                Filial · Altas Montañas
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full rounded-2xl px-4 py-2 font-extrabold transition"
                style={{ background: C.blackBtn, color: "white" }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="absolute left-0 top-0 h-full p-4"
              style={{
                width: 300,
                background: C.card,
                borderRight: `1px solid ${C.line}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center"
                    style={{ background: C.soft, border: `2px solid ${C.red}` }}
                  >
                    <img
                      src="/img/Club_Toluca_Logo.png"
                      alt="Club Toluca Logo"
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-extrabold leading-tight">
                      Toluca Altas Montañas
                    </div>
                    <div className="text-xs" style={{ color: C.muted }}>
                      Admin Panel
                    </div>
                  </div>
                </div>

                <button
                  className="rounded-xl px-3 py-2"
                  style={{ border: `1px solid ${C.line}` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-1">
                <NavItem active icon="📊" label="Dashboard" C={C} />
                <NavItem icon="📝" label="Registros" C={C} />
                <NavItem icon="📍" label="Sedes" C={C} />
                <NavItem icon="🏷️" label="Categorías" C={C} />
                <NavItem icon="📈" label="Reportes" C={C} />
                <NavItem icon="⚙️" label="Configuración" C={C} />
              </div>
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="flex-1">
          {/* Topbar (claro, como tu landing) */}
          <div
            className="sticky top-0 z-40 border-b"
            style={{
              background: "rgba(255,255,255,.85)",
              borderColor: C.line,
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <button
                className="lg:hidden rounded-xl px-3 py-2"
                style={{ border: `1px solid ${C.line}`, background: C.card }}
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>

              <div className="text-sm font-bold" style={{ color: C.muted }}>
                Panel ·{" "}
                <span style={{ color: C.red }}>Toluca Altas Montañas</span>
              </div>
            </div>
          </div>

          {/* Header coherente: base blanca + título rojo */}
          <section className="mx-auto max-w-6xl px-4 pt-6">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                boxShadow: "0 18px 50px rgba(0,0,0,.08)",
              }}
            >
              <div style={{ height: 6, background: C.red }} />

              <div className="p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p
                    className="text-xs font-extrabold tracking-[0.25em] uppercase"
                    style={{ color: C.muted }}
                  >
                    Panel de Administración
                  </p>
                  <h1
                    className="text-3xl md:text-4xl font-extrabold tracking-tight"
                    style={{ color: C.red }}
                  >
                    Registros del Club
                  </h1>
                  <p className="mt-2 text-sm" style={{ color: C.muted }}>
                    Sedes, categorías y registros (sin bajas por ahora).
                  </p>
                </div>

                <a
                  href="#registro"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-extrabold transition"
                  style={{
                    background: C.red,
                    color: "white",
                    boxShadow: "0 14px 30px rgba(213,0,50,0.18)",
                  }}
                >
                  ＋ Nuevo registro
                </a>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="mx-auto max-w-6xl px-4 py-6 space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard
                title="Registros Totales"
                value={data.total}
                hint="Global"
                C={C}
              />
              <KpiCard
                title="Últimos 30 días"
                value={data.last30}
                hint="Actividad"
                C={C}
              />
              <KpiCard
                title="Sedes"
                value={data.sedesCount}
                hint="Distribución"
                C={C}
              />
              <KpiCard
                title="Categorías"
                value={data.catsCount}
                hint="Academia"
                C={C}
              />
            </div>

            {/* Filters */}
            <div
              className="rounded-3xl p-4"
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                boxShadow: "0 12px 30px rgba(0,0,0,.06)",
              }}
            >
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <div className="flex-1">
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: C.muted }}
                      >
                        🔎
                      </span>
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por nombre, correo o teléfono…"
                        className="w-full rounded-2xl pl-9 pr-3 py-3 outline-none"
                        style={{
                          background: C.soft,
                          border: `1px solid ${C.line}`,
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = C.red)
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = C.line)
                        }
                      />
                    </div>
                  </div>

                  <select
                    value={sedeSel}
                    onChange={(e) => setSedeSel(e.target.value)}
                    className="w-full md:w-56 rounded-2xl px-3 py-3 outline-none"
                    style={{
                      background: C.soft,
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    {data.sedes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={catSel}
                    onChange={(e) => setCatSel(e.target.value)}
                    className="w-full md:w-56 rounded-2xl px-3 py-3 outline-none"
                    style={{
                      background: C.soft,
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    {data.categorias.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm" style={{ color: C.muted }}>
                  Mostrando:{" "}
                  <b style={{ color: C.text }}>{data.filtrados.length}</b>
                </div>
              </div>
            </div>

            {/* Tabla moderna (clara, como landing) */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                boxShadow: "0 18px 50px rgba(0,0,0,.08)",
              }}
            >
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: C.red }}
                  />
                  <h2 className="font-extrabold">Listado de registros</h2>
                  <span className="text-xs" style={{ color: C.muted }}>
                    ({data.filtrados.length})
                  </span>
                </div>
              </div>

              {/* headers desktop */}
              <div
                className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 border-t text-[11px] font-extrabold uppercase tracking-[0.18em]"
                style={{
                  borderColor: C.line,
                  background: C.soft,
                  color: C.muted,
                }}
              >
                <div className="col-span-4">Jugador</div>
                <div className="col-span-2">Teléfono</div>
                <div className="col-span-2">Categoría</div>
                <div className="col-span-2">Sede</div>
                <div className="col-span-2">Fecha</div>
              </div>

              <div className="divide-y" style={{ borderColor: C.line }}>
                {data.filtrados.map((r, idx) => (
                  <div
                    key={r.id ?? `${r.correo}-${idx}`}
                    className="group relative"
                  >
                    {/* acento rojo lateral */}
                    <div
                      className="absolute left-0 top-0 h-full w-1 opacity-0 group-hover:opacity-100 transition"
                      style={{ background: C.red }}
                    />

                    <div
                      className="grid grid-cols-12 gap-3 px-4 py-4 items-center transition"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(213,0,50,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Jugador */}
                      <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-2xl flex items-center justify-center font-extrabold"
                          style={{
                            background: C.soft,
                            border: `1px solid ${C.line}`,
                          }}
                        >
                          {(String(r?.nombre ?? "X")[0] || "X").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold truncate">
                            {r.nombre ?? "Sin nombre"}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: C.muted }}
                          >
                            {r.correo ?? "—"}
                          </div>
                        </div>
                      </div>

                      {/* Teléfono */}
                      <div
                        className="col-span-6 md:col-span-2"
                        style={{ color: C.text }}
                      >
                        {r.telefono ?? "—"}
                      </div>

                      {/* Categoría */}
                      <div className="col-span-6 md:col-span-2">
                        <ChipPrimary
                          text={data.norm(r.categoria, "Sin categoría")}
                          C={C}
                        />
                      </div>

                      {/* Sede */}
                      <div className="col-span-6 md:col-span-2">
                        <ChipSoft text={data.norm(r.sede, "Sin sede")} C={C} />
                      </div>

                      {/* Fecha */}
                      <div
                        className="col-span-6 md:col-span-2"
                        style={{ color: C.muted }}
                      >
                        {formatFecha(r.fecha)}
                      </div>
                    </div>
                  </div>
                ))}

                {data.filtrados.length === 0 && (
                  <div className="px-4 py-10" style={{ color: C.muted }}>
                    No hay resultados con esos filtros.
                  </div>
                )}
              </div>
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
      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold transition"
      style={{
        background: active ? C.red : "transparent",
        color: active ? "white" : C.text,
        border: active ? `1px solid ${C.red}` : `1px solid transparent`,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(213,0,50,0.06)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{
          background: active ? "rgba(255,255,255,.18)" : "#F3F4F6",
          border: active
            ? "1px solid rgba(255,255,255,.25)"
            : "1px solid #E5E7EB",
        }}
      >
        {icon}
      </span>
      {label}
    </a>
  );
}

function KpiCard({ title, value, hint, C }) {
  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: C.card,
        border: `1px solid ${C.line}`,
        boxShadow: "0 12px 30px rgba(0,0,0,.06)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className="text-xs font-extrabold tracking-[0.18em] uppercase"
            style={{ color: C.muted }}
          >
            {title}
          </div>
          <div
            className="mt-2 text-3xl font-extrabold"
            style={{ color: C.text }}
          >
            {value}
          </div>
        </div>

        <span
          className="text-xs px-3 py-1 rounded-full font-bold"
          style={{
            background: C.soft,
            border: `1px solid ${C.line}`,
            color: C.muted,
          }}
        >
          {hint}
        </span>
      </div>

      <div
        className="mt-4 h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: "#EEF2F7" }}
      >
        <div className="h-full w-2/3" style={{ background: C.red }} />
      </div>
    </div>
  );
}

function ChipPrimary({ text, C }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold"
      style={{
        background: C.red,
        color: "white",
        boxShadow: "0 12px 24px rgba(213,0,50,0.14)",
      }}
    >
      {text}
    </span>
  );
}

function ChipSoft({ text, C }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold"
      style={{
        background: C.soft,
        border: `1px solid ${C.line}`,
        color: C.text,
      }}
    >
      {text}
    </span>
  );
}
function handleLogout() {
  localStorage.removeItem("usuario");
  window.location.assign("/admin"); // pon aquí tu ruta real de login
}
