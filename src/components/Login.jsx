import { useState } from "react";
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const C = {
    red: "#D50032",
    bg: "#F4F5F7",
    card: "#FFFFFF",
    text: "#111827",
    muted: "#6B7280",
    line: "#E5E7EB",
    soft: "#F9FAFB",
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

      localStorage.setItem(
        "usuario",
        JSON.stringify({ id: user.id, email: user.email, nombre: user.nombre, rol: user.rol })
      );
      window.location.assign("/admin/dashboard");
    } catch {
      setErrorMsg("Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page(C)}>
      <div style={styles.card(C)}>
        <div style={{ height: 6, background: C.red }} />

        <div style={styles.header(C)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.logoWrap(C)}>
              <img
                src="/img/Club_Toluca_Logo.png"
                alt="Club Toluca Logo"
                style={{ width: 40, height: 40, objectFit: "contain" }}
              />
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>Toluca Altas Montañas</div>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginTop: 2 }}>Panel de administración</div>
            </div>
          </div>
          <span style={styles.badge(C)}>ADMIN</span>
        </div>

        <form onSubmit={handleLogin} style={{ padding: "20px 22px 24px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={styles.label(C)}>Correo electrónico</label>
            <div style={styles.inputWrap(C, !!errorMsg)}>
              <span style={{ fontSize: 14, opacity: 0.6 }}>✉️</span>
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
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={styles.label(C)}>Contraseña</label>
            <div style={styles.inputWrap(C, !!errorMsg)}>
              <span style={{ fontSize: 14, opacity: 0.6 }}>🔒</span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ ...styles.input(C), flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, padding: "0 2px" }}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={styles.errorBox(C)}>
              <strong style={{ marginRight: 6 }}>⚠</strong> {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.primaryBtn(C, loading)}
          >
            {loading ? "Iniciando sesión…" : "Entrar al panel"}
          </button>

          <div style={{ marginTop: 14, fontSize: 12, color: C.muted, textAlign: "center" }}>
            Acceso restringido — solo personal autorizado.
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
      ${C.bg}
    `,
  }),
  card: (C) => ({
    width: "min(420px, 94vw)",
    borderRadius: 22,
    overflow: "hidden",
    background: C.card,
    border: `1px solid ${C.line}`,
    boxShadow: "0 20px 60px rgba(0,0,0,.12)",
  }),
  header: (C) => ({
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    boxShadow: "0 8px 24px rgba(213,0,50,.15)",
  }),
  badge: (C) => ({
    fontWeight: 900,
    fontSize: 11,
    letterSpacing: 1.5,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(213,0,50,.08)",
    border: "1px solid rgba(213,0,50,.25)",
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
    padding: "12px 14px",
    borderRadius: 14,
    background: C.soft,
    border: `1.5px solid ${hasError ? C.red : C.line}`,
    boxShadow: hasError ? "0 0 0 3px rgba(213,0,50,.12)" : "none",
  }),
  input: (C) => ({
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 14.5,
    background: "transparent",
    color: C.text,
  }),
  errorBox: () => ({
    marginTop: 12,
    marginBottom: 4,
    padding: "11px 14px",
    borderRadius: 12,
    background: "rgba(213,0,50,.08)",
    border: "1px solid rgba(213,0,50,.25)",
    color: "#7C0F16",
    fontSize: 13.5,
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
  }),
  primaryBtn: (C, loading) => ({
    marginTop: 18,
    width: "100%",
    padding: "13px 12px",
    borderRadius: 14,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    background: loading ? "rgba(213,0,50,.55)" : C.red,
    color: "white",
    fontWeight: 900,
    fontSize: 15,
    boxShadow: "0 14px 30px rgba(213,0,50,.20)",
    transition: "background .2s",
  }),
};
