"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PropertyForm = {
  title: string;
  description: string;
  property_type: string;
  operation_type: string;
  price: string;
  currency: string;
  province: string;
  city: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  land_area: string;
  covered_area: string;
  status: string;
  featured: boolean;
};

function EditarPropiedadPageContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<PropertyForm>({
    title: "",
    description: "",
    property_type: "casa",
    operation_type: "venta",
    price: "",
    currency: "USD",
    province: "Entre Ríos",
    city: "Federación",
    address: "",
    bedrooms: "",
    bathrooms: "",
    land_area: "",
    covered_area: "",
    status: "draft",
    featured: false,
  });

  useEffect(() => {
    async function cargarPropiedad() {
      const { data: sessionData } =
        await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setMessage("No se pudo cargar la propiedad.");
        setLoading(false);
        return;
      }

      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        property_type: data.property_type ?? "casa",
        operation_type: data.operation_type ?? "venta",
        price: data.price?.toString() ?? "",
        currency: data.currency ?? "USD",
        province: data.province ?? "",
        city: data.city ?? "",
        address: data.address ?? "",
        bedrooms: data.bedrooms?.toString() ?? "",
        bathrooms: data.bathrooms?.toString() ?? "",
        land_area: data.land_area?.toString() ?? "",
        covered_area: data.covered_area?.toString() ?? "",
        status: data.status ?? "draft",
        featured: data.featured ?? false,
      });

      setLoading(false);
    }

    if (id) {
      cargarPropiedad();
    }
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("properties")
      .update({
        title: form.title,
        description: form.description,
        property_type: form.property_type,
        operation_type: form.operation_type,
        price: form.price === "" ? null : Number(form.price),
        currency: form.currency,
        province: form.province,
        city: form.city,
        address: form.address,
        bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms),
        bathrooms: form.bathrooms === "" ? null : Number(form.bathrooms),
        land_area: form.land_area === "" ? null : Number(form.land_area),
        covered_area:
          form.covered_area === "" ? null : Number(form.covered_area),
        status: form.status,
        featured: form.featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setMessage("Error al guardar los cambios: " + error.message);
      return;
    }

    setMessage("¡Propiedad actualizada correctamente!");
  }

  if (loading) {
    return <p className="p-10">Cargando propiedad...</p>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Editar propiedad
            </h1>
            <p className="mt-2 text-slate-600">
              Modificá los datos de la publicación.
            </p>
          </div>

          <Link
            href="/admin/propiedades"
            className="rounded-lg bg-slate-900 px-5 py-3 text-white"
          >
            Volver
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 shadow"
        >
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Información general
            </h2>

            <label className="mb-1 block text-sm font-medium">
              Título
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mb-4 w-full rounded-lg border p-3"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tipo de propiedad
                </label>
                <select
                  name="property_type"
                  value={form.property_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local comercial</option>
                  <option value="campo">Campo</option>
                  <option value="rural">Rural</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Operación
                </label>
                <select
                  name="operation_type"
                  value={form.operation_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="alquiler_temporario">
                    Alquiler temporario
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Precio
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Importe
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Moneda
                </label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="USD">Dólares (USD)</option>
                  <option value="ARS">Pesos argentinos (ARS)</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Ubicación
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Provincia
                </label>
                <input
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ciudad
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Dirección
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Características
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["bedrooms", "Dormitorios"],
                ["bathrooms", "Baños"],
                ["land_area", "Superficie del terreno (m²)"],
                ["covered_area", "Superficie cubierta (m²)"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="mb-1 block text-sm font-medium">
                    {label}
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={form[name as keyof PropertyForm] as string}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-lg border p-3"
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Descripción
            </h2>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg border p-3"
            />
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Publicación
            </h2>

            <label className="mb-1 block text-sm font-medium">
              Estado
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mb-4 w-full rounded-lg border p-3"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicada</option>
            </select>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
              />
              Destacar esta propiedad en la página principal
            </label>
          </section>

          {message && (
            <p className="rounded-lg bg-slate-100 p-4 text-sm">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-slate-900 px-6 py-4 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}
export default function EditarPropiedadPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando editor...</div>}>
      <EditarPropiedadPageContent />
    </Suspense>
  );
}