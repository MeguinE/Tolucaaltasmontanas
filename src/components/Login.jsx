import { useState } from "react";
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Paleta coherente con tu landing (claro + rojo acento)
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

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data: user, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", cleanEmail)
        .single();

      if (error || !user) {
        setErrorMsg("Usuario no encontrado");
        return;
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        setErrorMsg("Contraseña incorrecta");
        return;
      }

      const sessionUser = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      };

      localStorage.setItem("usuario", JSON.stringify(sessionUser));
      window.location.assign("/admin/dashboard/dashboard");
    } catch (err) {
      setErrorMsg("Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("usuario");
    alert("Sesión cerrada");
  }

  return (
    <div style={styles.page(C)}>
      <div style={styles.card(C)}>
        {/* Barra superior roja como tu estilo */}
        <div style={styles.topBar(C)} />

        <div style={styles.header(C)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.logoWrap(C)}>
              <img
                src="/img/Club_Toluca_Logo.png"
                alt="Club Toluca Logo"
                style={{ width: 40, height: 40, objectFit: "contain" }}
              />
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={styles.headerTitle(C)}>Toluca Altas Montañas</div>
              <div style={styles.headerSubtitle(C)}>Acceso al panel</div>
            </div>
          </div>

          <div style={styles.badge(C)}>ADMIN</div>
        </div>

        <form onSubmit={handleLogin} style={{ padding: 22 }}>
          <label style={styles.label(C)}>Correo</label>
          <div style={styles.inputWrap(C, !!errorMsg)}>
            <span style={styles.icon(C)}>✉️</span>
            <input
              type="email"
              placeholder="tucorreo@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input(C)}
            />
          </div>

          <label style={{ ...styles.label(C), marginTop: 14 }}>
            Contraseña
          </label>
          <div style={styles.inputWrap(C, !!errorMsg)}>
            <span style={styles.icon(C)}>🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={styles.input(C)}
            />
          </div>

          {errorMsg && (
            <div style={styles.errorBox(C)}>
              <strong style={{ marginRight: 8 }}>⚠</strong> {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.primaryBtn(C, loading)}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={styles.secondaryBtn(C)}
          >
            Cerrar sesión
          </button>

          <div style={styles.footerNote(C)}>
            Tip: revisa mayúsculas y espacios al final del correo.
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: (C) => ({
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 18,
    background: `
      radial-gradient(900px 500px at 20% 10%, rgba(213,0,50,.10), transparent 60%),
      radial-gradient(900px 500px at 80% 90%, rgba(213,0,50,.08), transparent 60%),
      linear-gradient(180deg, ${C.bg}, ${C.bg})
    `,
  }),

  card: (C) => ({
    width: "min(440px, 94vw)",
    borderRadius: 22,
    overflow: "hidden",
    background: C.card,
    border: `1px solid ${C.line}`,
    boxShadow: "0 18px 50px rgba(0,0,0,.10)",
  }),

  topBar: (C) => ({
    height: 6,
    background: C.red,
  }),

  header: (C) => ({
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: C.card,
    borderBottom: `1px solid ${C.line}`,
  }),

  logoWrap: (C) => ({
    height: 52,
    width: 52,
    borderRadius: 18,
    background: C.soft,
    border: `2px solid ${C.red}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(213,0,50,.12)",
  }),

  headerTitle: (C) => ({
    fontSize: 16,
    fontWeight: 900,
    color: C.text,
    letterSpacing: 0.2,
  }),

  headerSubtitle: (C) => ({
    marginTop: 4,
    fontSize: 12.5,
    color: C.muted,
    fontWeight: 700,
  }),

  badge: (C) => ({
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 1.2,
    padding: "8px 10px",
    borderRadius: 999,
    background: "rgba(213,0,50,.08)",
    border: `1px solid rgba(213,0,50,.25)`,
    color: C.red,
  }),

  label: (C) => ({
    display: "block",
    fontSize: 12.5,
    fontWeight: 800,
    marginBottom: 7,
    color: C.text,
  }),

  inputWrap: (C, hasError) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 14,
    background: C.soft,
    border: `1px solid ${hasError ? C.red : C.line}`,
    boxShadow: hasError ? `0 0 0 3px rgba(213,0,50,.12)` : "none",
  }),

  icon: () => ({
    fontSize: 14,
    opacity: 0.75,
  }),

  input: (C) => ({
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 14.5,
    background: "transparent",
    color: C.text,
  }),

  errorBox: (C) => ({
    marginTop: 14,
    padding: "11px 12px",
    borderRadius: 14,
    background: "rgba(213,0,50,.08)",
    border: `1px solid rgba(213,0,50,.25)`,
    color: "#7C0F16",
    fontSize: 13.5,
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
  }),

  primaryBtn: (C, loading) => ({
    marginTop: 16,
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    background: loading ? "rgba(213,0,50,.65)" : C.red,
    color: "white",
    fontWeight: 900,
    letterSpacing: 0.2,
    boxShadow: "0 14px 30px rgba(213,0,50,.18)",
  }),

  secondaryBtn: (C) => ({
    marginTop: 10,
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    cursor: "pointer",
    background: C.blackBtn,
    border: "none",
    color: "white",
    fontWeight: 900,
    boxShadow: "0 14px 30px rgba(0,0,0,.18)",
  }),

  footerNote: (C) => ({
    marginTop: 14,
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    fontWeight: 600,
  }),
};
