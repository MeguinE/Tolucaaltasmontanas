import { useState } from "react";

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const isOk = type === "ok";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: isOk ? "#166534" : "#7C0F16",
        color: "#fff",
        borderRadius: 14,
        padding: "14px 24px",
        fontWeight: 700,
        fontSize: 15,
        boxShadow: "0 8px 30px rgba(0,0,0,.25)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: "90vw",
      }}
    >
      <span>{isOk ? "✅" : "⚠️"}</span>
      <span>{msg}</span>
      <button
        onClick={onClose}
        style={{ marginLeft: 12, background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
      >×</button>
    </div>
  );
}

export default function CategoryRegisterForm({ trainingData }) {
  const safeData = trainingData ?? [];
  const categories = safeData.map((c) => c.category);
  const sedes = Array.from(
    new Set(safeData.flatMap((c) => (c.locations ?? []).map((l) => l.name)))
  );

  const emptyForm = { name: "", age: "", phone: "", email: "", category: "", sede: "", message: "" };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getCategoryId = (name) => safeData.find((c) => c.category === name)?.category_id ?? null;
  const getSedeId = (name) =>
    safeData.flatMap((c) => c.locations).find((l) => l.name === name)?.id ?? null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nombre: form.name.trim().toLowerCase(),
      edad: Number(form.age),
      telefono: form.phone.trim(),
      correo: form.email.trim().toLowerCase(),
      categoria_id: getCategoryId(form.category),
      sede_id: getSedeId(form.sede),
      notas: form.message.trim(),
    };

    if (!payload.nombre) return showToast("Ingresa un nombre válido.", "err");
    if (!payload.edad || payload.edad < 3 || payload.edad > 20)
      return showToast("Edad inválida (3 a 20 años).", "err");
    if (payload.telefono.length < 10) return showToast("Teléfono inválido (mínimo 10 dígitos).", "err");
    if (!payload.correo.includes("@")) return showToast("Correo electrónico inválido.", "err");
    if (!payload.categoria_id) return showToast("Selecciona una categoría.", "err");
    if (!payload.sede_id) return showToast("Selecciona una sede.", "err");

    setLoading(true);
    try {
      const res = await fetch("/api/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.duplicate) {
        showToast("Esta persona ya está registrada. No se permiten registros duplicados.", "err");
        return;
      }
      if (json.ok) {
        showToast("¡Registro enviado con éxito! Te contactaremos pronto.", "ok");
        setForm(emptyForm);
      } else {
        showToast("Error al registrar. Intenta nuevamente.", "err");
        console.error(json.error);
      }
    } catch {
      showToast("Error de conexión. Intenta nuevamente.", "err");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full mt-1 p-3 rounded-lg bg-white/95 text-black shadow-md border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition";
  const labelCls = "block text-white font-semibold tracking-wide text-sm";

  return (
    <>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "" })} />

      <form
        onSubmit={handleSubmit}
        className="relative p-8 md:p-10 rounded-2xl bg-red-700/80 shadow-2xl backdrop-blur-md space-y-5 border border-white/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Nombre completo</label>
            <input
              name="name"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={form.name}
              onChange={handleChange}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Edad</label>
            <input
              name="age"
              type="number"
              placeholder="Ej: 12"
              value={form.age}
              onChange={handleChange}
              className={inputCls}
              min={3}
              max={20}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              name="phone"
              type="tel"
              placeholder="Ej: 272 143 4901"
              value={form.phone}
              onChange={handleChange}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="Ej: correo@gmail.com"
              value={form.email}
              onChange={handleChange}
              className={inputCls}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Categoría</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputCls}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sede</label>
            <select
              name="sede"
              value={form.sede}
              onChange={handleChange}
              className={inputCls}
              required
            >
              <option value="">Selecciona una sede</option>
              {sedes.map((sede) => (
                <option key={sede} value={sede}>{sede}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Información adicional</label>
          <textarea
            name="message"
            placeholder="Posición favorita, experiencia previa, notas..."
            value={form.message}
            onChange={handleChange}
            className={`${inputCls} h-24 resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-red-700 font-bold py-3.5 rounded-xl shadow-xl hover:bg-red-600 hover:text-white hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando…" : "⚽ Enviar Registro"}
        </button>
      </form>
    </>
  );
}
