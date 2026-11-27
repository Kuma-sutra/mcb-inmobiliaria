"use client";

import { useEffect, useMemo, useState } from "react";
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

function obtenerPropiedad(consulta: Consulta) {
  return Array.isArray(consulta.propiedad)
    ? consulta.propiedad[0] ?? null
    : consulta.propiedad;
}

export default function AdminConsultasPage() {
  const [fechaActual, setFechaActual] = useState<Date | null>(null);

useEffect(() => {
  setFechaActual(new Date());
}, []);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

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

      if (error) {
        console.error("Error al cargar consultas:", error.message);
        console.error("Código:", error.code);
        console.error("Detalle:", error.details);
        setMessage("No se pudieron cargar las consultas.");
      } else {
        setConsultas((data ?? []) as Consulta[]);
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

  const estadisticas = useMemo(() => {
    const normalizarEstado = (estado: string | null | undefined) =>
      (estado || "nuevo").toLowerCase();

    const nuevas = consultas.filter((consulta) =>
  normalizarEstado(consulta.estado) === "nuevo"
).length;

const enSeguimiento = consultas.filter((consulta) =>
  ["en_seguimiento", "pendiente"].includes(
    normalizarEstado(consulta.estado)
  )
).length;

const respondidas = consultas.filter((consulta) =>
  normalizarEstado(consulta.estado) === "respondida"
).length;

const cerradas = consultas.filter((consulta) =>
  ["cerrada", "resuelto"].includes(
    normalizarEstado(consulta.estado)
  )
).length;

    const conteoMensual = new Map<string, number>();
    const hoy = fechaActual ?? new Date(0);
    const meses = Array.from({ length: 6 }, (_, indice) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - indice), 1);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      return {
        clave,
        etiqueta: fecha.toLocaleDateString("es-AR", { month: "short" }),
        cantidad: 0,
      };
    });

    consultas.forEach((consulta) => {
      const fecha = new Date(consulta.created_at);
      if (Number.isNaN(fecha.getTime())) return;
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      conteoMensual.set(clave, (conteoMensual.get(clave) ?? 0) + 1);
    });

    meses.forEach((mes) => {
      mes.cantidad = conteoMensual.get(mes.clave) ?? 0;
    });

    const rankingMap = new Map<string, { nombre: string; cantidad: number }>();
    consultas.forEach((consulta) => {
      const propiedad = obtenerPropiedad(consulta);
      const clave = consulta.propiedad_id || propiedad?.title || "sin-propiedad";
      const nombre = propiedad?.title || "Propiedad no identificada";
      const actual = rankingMap.get(clave);
      rankingMap.set(clave, {
        nombre,
        cantidad: (actual?.cantidad ?? 0) + 1,
      });
    });

    const ranking = Array.from(rankingMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const maximoMensual = Math.max(1, ...meses.map((mes) => mes.cantidad));
    const maximoRanking = Math.max(1, ...ranking.map((item) => item.cantidad));

    return {
  total: consultas.length,
  nuevas,
  enSeguimiento,
  respondidas,
  cerradas,
  porcentajeCerradas:
    consultas.length > 0
      ? Math.round((cerradas / consultas.length) * 100)
      : 0,
  meses,
  ranking,
  maximoMensual,
  maximoRanking,
  propiedadMasConsultada: ranking[0]?.nombre ?? "Todavía sin consultas",
};
  }, [consultas, fechaActual]);

  const consultasFiltradas = consultas.filter((consulta) => {
    if (filtroEstado === "todos") return true;
    return (consulta.estado || "nuevo").toLowerCase() === filtroEstado;
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Consultas recibidas
            </h1>
            <p className="mt-2 text-slate-600">
              Seguimiento y estadísticas de interesados en las propiedades.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
          >
            Volver al administrador
          </Link>
        </div>

        {/* Indicadores principales */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total recibidas</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {estadisticas.total}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
  <p className="text-sm font-medium text-slate-500">Nuevas</p>
  <p className="mt-2 text-3xl font-bold text-amber-600">
    {estadisticas.nuevas}
  </p>
  <p className="mt-1 text-xs text-slate-500">Consultas recibidas</p>
</div>

<div className="rounded-xl bg-white p-5 shadow-sm">
  <p className="text-sm font-medium text-slate-500">En seguimiento</p>
  <p className="mt-2 text-3xl font-bold text-blue-600">
    {estadisticas.enSeguimiento}
  </p>
  <p className="mt-1 text-xs text-slate-500">Consultas en gestión</p>
</div>

<div className="rounded-xl bg-white p-5 shadow-sm">
  <p className="text-sm font-medium text-slate-500">Respondidas</p>
  <p className="mt-2 text-3xl font-bold text-emerald-600">
    {estadisticas.respondidas}
  </p>
  <p className="mt-1 text-xs text-slate-500">Consultas respondidas</p>
</div>

<div className="rounded-xl bg-white p-5 shadow-sm">
  <p className="text-sm font-medium text-slate-500">Cerradas</p>
  <p className="mt-2 text-3xl font-bold text-slate-700">
    {estadisticas.cerradas}
  </p>
  <p className="mt-1 text-xs text-slate-500">
    {estadisticas.porcentajeCerradas}% del total
  </p>
</div>
          
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Propiedad más consultada
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {estadisticas.propiedadMasConsultada}
            </p>
          </div>
        </section>

        {/* Estadísticas detalladas */}
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Consultas por mes
            </h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Evolución de los últimos seis meses.
            </p>
            <div className="space-y-4">
              {estadisticas.meses.map((mes) => (
                <div key={mes.clave}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-slate-600">{mes.etiqueta}</span>
                    <span className="font-semibold text-slate-800">{mes.cantidad}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${(mes.cantidad / estadisticas.maximoMensual) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Propiedades más consultadas
            </h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Las cinco propiedades con más consultas recibidas.
            </p>
            {estadisticas.ranking.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay datos para mostrar.</p>
            ) : (
              <div className="space-y-4">
                {estadisticas.ranking.map((item, indice) => (
                  <div key={`${item.nombre}-${indice}`}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">
                        {indice + 1}. {item.nombre}
                      </span>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {item.cantidad}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{
                          width: `${(item.cantidad / estadisticas.maximoRanking) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label htmlFor="filtroEstado" className="font-medium text-slate-700">
            Filtrar por estado:
          </label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow-sm"
          >
            <option value="todos">Todas las consultas</option>
<option value="nuevo">Nuevas</option>
<option value="en_seguimiento">En seguimiento</option>
<option value="respondida">Respondidas</option>
<option value="cerrada">Cerradas</option>
          </select>
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
          ) : consultasFiltradas.length === 0 ? (
            <p className="p-8 text-center text-slate-600">
              No hay consultas para el filtro seleccionado.
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
                  {consultasFiltradas.map((consulta) => {
                    const propiedad = obtenerPropiedad(consulta);
                    return (
                      <tr key={consulta.id} className="border-b border-slate-200">
                        <td className="whitespace-nowrap p-4">
                          {formatoFecha(consulta.created_at)}
                        </td>
                        <td className="p-4 font-medium text-slate-900">
                          {consulta.nombre}
                        </td>
                        <td className="p-4">
                          {consulta.telefono && (
                            <div>
                              <p>Teléfono: {consulta.telefono}</p>
                              <a
                                href={`https://wa.me/${consulta.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                                  `Hola ${consulta.nombre}, te contactamos de MCB Inmobiliaria por tu consulta.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                              >
                                Contactar por WhatsApp
                              </a>
                            </div>
                          )}
                          {consulta.email && <p>Email: {consulta.email}</p>}
                        </td>
                        <td className="p-4">
                          {propiedad ? (
                            <div>
                              <p className="font-medium">{propiedad.title}</p>
                              <p className="text-slate-500">
                                {propiedad.address || "Sin dirección"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              Sin propiedad asociada
                            </span>
                          )}
                        </td>
                        <td className="min-w-[220px] p-4">
                          {consulta.mensaje || "Sin mensaje"}
                        </td>
                        <td className="p-4">
                          <select
                            value={(consulta.estado || "nuevo").toLowerCase()}
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

                              setMessage("");
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
                            <option value="nuevo">Nueva</option>
<option value="en_seguimiento">En seguimiento</option>
<option value="respondida">Respondida</option>
<option value="cerrada">Cerrada</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}