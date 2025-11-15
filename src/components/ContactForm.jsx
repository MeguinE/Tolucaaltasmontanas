import { useState } from "react";

export default function CategoryRegisterForm({ trainingData }) {
  const categories = trainingData.map((c) => c.category);
  const sedes = Array.from(
    new Set(trainingData.flatMap((c) => c.locations.map((l) => l.name)))
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
      className="p-6 md:p-8 rounded-xl 
        bg-red-700 opacity-80 shadow-xl backdrop-blur-md space-y-6"
    >
      {/* Campo genérico */}
      {[
        { name: "name", label: "Nombre completo", type: "text", placeholder: "Ej: Juan Pérez" },
        { name: "age", label: "Edad", type: "number", placeholder: "Ej: 12" },
        { name: "phone", label: "Teléfono", type: "tel", placeholder: "Ej: 271-123-4567" },
        { name: "email", label: "Correo electrónico", type: "email", placeholder: "Ej: correo@gmail.com" },
      ].map(({ name, label, type, placeholder }) => (
        <div key={name}>
          <label className="text-white font-semibold">
            {label}
          </label>
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            onChange={handleChange}
            className="w-full mt-1 p-3 rounded-lg bg-white/90 
              text-black shadow-inner focus:ring-2 focus:ring-red-600"
          />
        </div>
      ))}

      {/* Selección de categoría */}
      <div>
        <label className="text-white font-semibold">Categoría</label>
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
        <label className="text-white font-semibold">Sede</label>
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
        <label className="text-white font-semibold">
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
        className="w-full bg-white text-red-700 font-semibold 
          py-3 rounded-lg shadow-lg hover:bg-red-600 hover:text-white 
          transition"
      >
        Enviar Registro
      </button>
    </form>
  );
}
