import { useState } from "react";

export default function CategoryRegisterForm({ trainingData }) {

  // fallback por si trainingData llega undefined o null
  const safeData = trainingData ?? [];

  const categories = safeData.map((c) => c.category);

  const sedes = Array.from(
    new Set(
      safeData.flatMap((c) =>
        (c.locations ?? []).map((l) => l.name)
      )
    )
  );

  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    category: "",
    sede: "",
    message: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del jugador:", form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative p-8 md:p-10 rounded-2xl 
    bg-red-700/80 shadow-2xl backdrop-blur-md 
    space-y-6 border border-white/20." 
    >

      {/* Campos genéricos */}
      {[
        { name: "name", label: "Nombre completo", type: "text", placeholder: "Ej: Juan Pérez" },
        { name: "age", label: "Edad", type: "number", placeholder: "Ej: 12" },
        { name: "phone", label: "Teléfono", type: "tel", placeholder: "Ej: 271-123-4567" },
        { name: "email", label: "Correo electrónico", type: "email", placeholder: "Ej: correo@gmail.com" },
      ].map(({ name, label, type, placeholder }) => (
        <div key={name}>
          <label className="text-white font-semibold tracking-wide">
            {label}
          </label>
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            onChange={handleChange}
            className="w-full mt-1 p-3 rounded-lg bg-white/95 text-black 
            shadow-md border border-gray-200
            focus:ring-2 focus:ring-red-600 focus:border-red-600
            transition"
          />
        </div>
      ))}

      {/* Selección de categoría */}
      <div>
        <label className="text-white font-semibold tracking-wide">
          Categoría</label>
        <select
          name="category"
          onChange={handleChange}
          className="w-full mt-1 p-3 rounded-lg bg-white/90 
            text-black shadow-inner focus:ring-2 focus:ring-red-600"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Selección de sede */}
      <div>
        <label className="text-white font-semibold tracking-wide">
          Sede</label>
        <select
          name="sede"
          onChange={handleChange}
          className="w-full mt-1 p-3 rounded-lg bg-white/90 
            text-black shadow-inner focus:ring-2 focus:ring-red-600"
        >
          <option value="">Selecciona una sede</option>
          {sedes.map((sede) => (
            <option key={sede}>{sede}</option>
          ))}
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label className="text-white font-semibold tracking-wide">
          Información adicional
        </label>
        <textarea
          name="message"
          placeholder="Notas del jugador, posición, experiencia..."
          onChange={handleChange}
          className="w-full mt-1 p-3 h-24 rounded-lg bg-white/90 
            text-black shadow-inner focus:ring-2 focus:ring-red-600"
        />
      </div>
      <button
        className="w-full bg-white text-red-700 font-bold 
    py-3 rounded-lg shadow-xl
    hover:bg-red-600 hover:text-white 
    hover:shadow-2xl transition-transform 
    active:scale-[0.98]"
      >
        Enviar Registro
      </button>
    </form>
  );
}
