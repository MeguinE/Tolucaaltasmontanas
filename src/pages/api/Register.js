export const prerender = false;

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export async function POST({ request }) {
  const body = await request.json();

  // 1. Validar campos vacíos
  if (!body.nombre || !body.correo || !body.telefono || !body.categoria_id || !body.sede_id) {
    return new Response(JSON.stringify({
      ok: false,
      message: "Faltan campos requeridos"
    }), { status: 400 });
  }

  // 2. Verificar que no exista ya el correo
  const { data: existing, error: checkError } = await supabase
    .from("jugadores")
    .select("*")
    .eq("correo", body.correo)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({
      ok: false,
      message: "Ya existe un jugador registrado con este correo"
    }), { status: 409 });
  }

  // 3. Insertar si todo correcto
  const { data, error } = await supabase
    .from("jugadores")
    .insert([body]);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error }), { status: 400 });
  }

  return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
}
