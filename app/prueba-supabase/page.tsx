"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PruebaSupabase() {
const [mensaje, setMensaje] = useState("Probando conexión...");
const [error, setError] = useState(false);

useEffect(() => {
async function probarConexion() {
const { error: errorConsulta } = await supabase
.from("properties")
.select("id")
.limit(1);

  if (errorConsulta) {
    setMensaje("Error de conexión: " + errorConsulta.message);
    setError(true);
    return;
  }

  setMensaje("Conexión con Supabase exitosa.");
  setError(false);
}

probarConexion();

}, []);

return (
<main style={{ padding: "30px", fontFamily: "Arial" }}> <h1>Prueba de conexión con Supabase</h1>
<p style={{ color: error ? "red" : "green" }}>{mensaje}</p> </main>
);
}
