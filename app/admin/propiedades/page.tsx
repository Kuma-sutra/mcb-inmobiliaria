"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  title: string;
  operation_type: string;
  price: number | null;
  currency: string | null;
  city: string | null;
  address: string | null;
  status: string;
};

const estados = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
  { value: "reserved", label: "Reservada" },
  { value: "sold", label: "Vendida" },
  { value: "rented", label: "Alquilada" },
  { value: "inactive", label: "Inactiva" },
];

const operaciones = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "alquiler_temporario", label: "Alquiler temporario" },
];

function nombreOperacion(operacion: string) {
  const encontrada = operaciones.find(
    (item) => item.value === operacion
  );

  return encontrada?.label ?? operacion;
}

function nombreEstado(estado: string) {
  const encontrado = estados.find(
    (item) => item.value === estado
  );

  return encontrado?.label ?? estado;
}

export default function AdminPropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filterOperation, setFilterOperation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/admin/login");
        return;
      }

      await loadProperties();
    }

    checkSession();
  }, [router]);

  async function loadProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, title, operation_type, price, currency, city, address, status"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(
        "Error al cargar las propiedades: " + error.message
      );
    } else {
      setProperties((data || []) as Property[]);
    }

    setLoading(false);
  }

  async function changeStatus(id: string, newStatus: string) {
    setUpdating(id);
    setMessage("");

    const { error } = await supabase
      .from("properties")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMessage(
        "No se pudo actualizar el estado: " + error.message
      );
    } else {
      setProperties((current) =>
        current.map((property) =>
          property.id === id
            ? { ...property, status: newStatus }
            : property
        )
      );

      setMessage("Estado actualizado correctamente.");
    }

    setUpdating(null);
  }

  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      property.title.toLowerCase().includes(searchText) ||
      (property.address || "").toLowerCase().includes(searchText) ||
      (property.city || "").toLowerCase().includes(searchText);

    const matchesOperation =
      filterOperation === "all" ||
      property.operation_type === filterOperation;

    const matchesStatus =
      filterStatus === "all" ||
      property.status === filterStatus;

    return matchesSearch && matchesOperation && matchesStatus;
  });

  const totalProperties = properties.length;

  const publishedCount = properties.filter(
    (property) => property.status === "published"
  ).length;

  const draftCount = properties.filter(
    (property) => property.status === "draft"
  ).length;

  const reservedCount = properties.filter(
    (property) => property.status === "reserved"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p className="text-slate-600">
          Cargando propiedades...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* ENCABEZADO */}

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Administración de propiedades
            </h1>

            <p className="mt-2 text-slate-600">
              Gestioná las publicaciones de MCB Inmobiliaria.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
            >
              Volver al administrador
            </Link>

            <Link
              href="/admin/propiedades/nueva"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              + Nueva propiedad
            </Link>
          </div>
        </header>

        {/* MENSAJES */}

        {message && (
          <div className="mb-5 rounded-lg bg-white p-4 text-slate-700 shadow">
            {message}
          </div>
        )}

        {/* ESTADÍSTICAS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Total de propiedades
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalProperties}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Publicadas
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Borradores
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {draftCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">
              Reservadas
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {reservedCount}
            </p>
          </div>

        </div>

        {/* BUSCADOR Y FILTROS */}

        <div className="mb-6 rounded-xl bg-white p-5 shadow">

          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Buscar y filtrar propiedades
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <input
              type="text"
              placeholder="Buscar por título, dirección o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-300 p-3 text-slate-900 outline-none focus:border-blue-500"
            />

            <select
              value={filterOperation}
              onChange={(e) =>
                setFilterOperation(e.target.value)
              }
              className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
            >
              <option value="all">Todas las operaciones</option>

              {operaciones.map((operacion) => (
                <option
                  key={operacion.value}
                  value={operacion.value}
                >
                  {operacion.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900"
            >
              <option value="all">Todos los estados</option>

              {estados.map((estado) => (
                <option
                  key={estado.value}
                  value={estado.value}
                >
                  {estado.label}
                </option>
              ))}
            </select>

          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <p className="text-sm text-slate-500">
              Mostrando {filteredProperties.length} de{" "}
              {totalProperties} propiedades.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setFilterOperation("all");
                setFilterStatus("all");
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>

          </div>

        </div>

        {/* TABLA DE PROPIEDADES */}

        <div className="overflow-x-auto rounded-xl bg-white shadow">

          <table className="w-full text-left">

            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4">Propiedad</th>
                <th className="p-4">Operación</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Ciudad</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>

              {filteredProperties.map((property) => (

                <tr
                  key={property.id}
                  className="border-b border-slate-200 hover:bg-slate-50"
                >

                  <td className="p-4">
                    <p className="font-medium text-slate-900">
                      {property.title}
                    </p>

                    {property.address && (
                      <p className="mt-1 text-sm text-slate-500">
                        {property.address}
                      </p>
                    )}
                  </td>

                  <td className="p-4 text-slate-700">
                    {nombreOperacion(property.operation_type)}
                  </td>

                  <td className="p-4 text-slate-700">
                    {property.price != null
                      ? `${property.currency || ""} ${Number(
                          property.price
                        ).toLocaleString("es-AR")}`
                      : "A consultar"}
                  </td>

                  <td className="p-4 text-slate-700">
                    {property.city || "—"}
                  </td>

                  <td className="p-4">

                    <select
                      value={property.status}
                      disabled={updating === property.id}
                      onChange={(e) =>
                        changeStatus(property.id, e.target.value)
                      }
                      className="rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
                    >
                      {estados.map((estado) => (
                        <option
                          key={estado.value}
                          value={estado.value}
                        >
                          {estado.label}
                        </option>
                      ))}
                    </select>

                    {updating === property.id && (
                      <span className="ml-2 text-sm text-slate-500">
                        Guardando...
                      </span>
                    )}

                  </td>

                  <td className="p-4">
                    <Link
                      href={`/admin/propiedades/${property.id}/editar`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </Link>
                  </td>

                </tr>

              ))}

              {filteredProperties.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-slate-500"
                  >
                    No se encontraron propiedades.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}