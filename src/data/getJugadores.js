import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export async function getJugadores() {
  // 1. Cargar jugadores
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error jugadores:", error);
    return [];
  }

  // 2. Cargar categorías (id → nombre)
  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nombre");

  // 3. Cargar sedes (id → nombre)
  const { data: sedes } = await supabase
    .from("sedes")
    .select("id, nombre");

  // 4. Crear diccionarios rápidos: { 1: "Infantil 2010", ... }
  const mapCategorias = Object.fromEntries(
    categorias.map((c) => [c.id, c.nombre])
  );

  const mapSedes = Object.fromEntries(
    sedes.map((s) => [s.id, s.nombre])
  );

  // 5. Combinar datos
  return jugadores.map((j) => ({
    id: j.id,
    nombre: capitalizar(j.nombre),
    edad: j.edad,
    telefono: j.telefono,
    correo: j.correo,

    // ⬅️ Convertimos el ID en texto bonito
    categoria: mapCategorias[j.categoria_id] ?? "Sin categoría",
    sede: mapSedes[j.sede_id] ?? "Sin sede",

    notas: j.notas || "Sin notas",
    fecha: formatoFecha(j.created_at),
  }));
}

function capitalizar(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatoFecha(dateStr) {
  const fecha = new Date(dateStr);
  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
