import { createClient } from '@supabase/supabase-js';

// Astro **SÍ usa import.meta.env**, NO process.env
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Crear cliente
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getTrainingData() {
  // Obtener categorías con sus horarios
  const { data: categorias, error: catError } = await supabase
  .from("categorias")
  .select(`
    id,
    nombre,
    anio_inicio,
    anio_fin,
    horarios:horarios_categoria (
      dia,
      hora_inicio,
      hora_fin,
      nota
    )
  `);

  if (catError) throw new Error(catError.message);

  // Obtener sedes (solo nombre)
  const { data: sedes, error: sedesError } = await supabase
    .from("sedes")
    .select("nombre");

  if (sedesError) throw new Error(sedesError.message);

  // Formato final para tu frontend
  return categorias.map((cat) => ({
    id: cat.id,
    category: cat.nombre,
    years: `${cat.anio_inicio} / ${cat.anio_fin}`,
    image: "img/training.jpg", // Tu imagen default
    schedule: [
      ...cat.horarios.map((h) => ({
        day: h.dia,
        time: `${formatTime(h.hora_inicio)} - ${formatTime(h.hora_fin)}`
      })),
      { note: cat.horarios[0]?.nota || "" }
    ],
    locations: sedes.map((s) => ({
      name: s.nombre
    }))
  }));
}

// Convertir 16:00 → 4:00 PM
function formatTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}
