"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Consulta = {
  id: string;
  created_at: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  propiedad_id: string | null;
  mensaje: string;
  estado: string;
  propiedad: {
  title: string;
  address: string | null;
}[] | null;
};

export default function AdminConsultasPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadConsultas() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      const { data, error } = await supabase
  .from("consultas")
  .select(`
    id,
    created_at,
    nombre,
    email,
    telefono,
    propiedad_id,
    mensaje,
    estado,
  propiedad:properties!consultas_propiedad_id_fkey (
  title,
  address
)
  `)
  .order("created_at", { ascending: false });
console.log("Consultas cargadas:", data);
      if (error) {
        console.error("Error al cargar consultas:", error.message);
console.error("Código:", error.code);
console.error("Detalle:", error.details);
        setMessage("No se pudieron cargar las consultas.");
      } else {
        setConsultas(data ?? []);
      }

      setLoading(false);
    }

    loadConsultas();
  }, []);

  function formatoFecha(fecha: string) {
    return new Date(fecha).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Consultas recibidas
            </h1>
            <p className="mt-2 text-slate-600">
              Mensajes enviados por interesados en las propiedades.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
          >
            Volver al administrador
          </Link>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total de consultas</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {consultas.length}
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {loading ? (
            <p className="p-8 text-center text-slate-600">
              Cargando consultas...
            </p>
          ) : consultas.length === 0 ? (
            <p className="p-8 text-center text-slate-600">
              Todavía no hay consultas recibidas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Nombre</th>
 <th className="p-4">Contacto</th>
<th className="p-4">Propiedad</th>
<th className="p-4">Mensaje</th>
<th className="p-4">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {consultas.map((consulta) => (
                    <tr key={consulta.id} className="border-b border-slate-200">
                      <td className="whitespace-nowrap p-4">
                        {formatoFecha(consulta.created_at)}
                      </td>

                      <td className="p-4 font-medium text-slate-900">
                        {consulta.nombre}
                      </td>

                      <td className="p-4">
                        {consulta.telefono && (
                          <p>Teléfono: {consulta.telefono}</p>
                        )}
                        {consulta.email && <p>Email: {consulta.email}</p>}
                      </td>
                      <td className="p-4">
  {(() => {
    const propiedad = Array.isArray(consulta.propiedad)
      ? consulta.propiedad[0]
      : consulta.propiedad;

    return propiedad ? (
      <div>
        <p className="font-medium">
          {propiedad.title}
        </p>
        <p className="text-slate-500">
          {propiedad.address || "Sin dirección"}
        </p>
      </div>
    ) : (
      <span className="text-slate-400">
        Sin propiedad asociada
      </span>
    );
  })()}
</td>
<td className="p-4 min-w-[220px]">
  {consulta.mensaje || "Sin mensaje"}
</td>

<td className="p-4">
  <select
    value={consulta.estado || "nuevo"}
    onChange={async (e) => {
      const nuevoEstado = e.target.value;

      const { error } = await supabase
        .from("consultas")
        .update({ estado: nuevoEstado })
        .eq("id", consulta.id);

      if (error) {
        setMessage("No se pudo actualizar el estado.");
        return;
      }

      setConsultas((prev) =>
        prev.map((c) =>
          c.id === consulta.id
            ? { ...c, estado: nuevoEstado }
            : c
        )
      );
    }}
    className="rounded-full border border-slate-300 px-3 py-1 text-sm"
  >
    <option value="nuevo">Nuevo</option>
    <option value="pendiente">Pendiente</option>
    <option value="en_seguimiento">En seguimiento</option>
    <option value="resuelto">Resuelto</option>
  </select>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}