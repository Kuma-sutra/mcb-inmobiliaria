"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NuevaPropiedadPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
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
  });

  // Verificar que exista una sesión de administrador
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/admin/login");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

  // Crear vistas previas de las fotografías
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      setMessage("Solo se permiten archivos de imagen.");
    } else {
      setMessage("");
    }

    setFiles(validFiles);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (files.length === 0) {
      setMessage("Seleccioná al menos una fotografía.");
      return;
    }

    setLoading(true);

try {
  // Verificar que exista una sesión activa
  const { data: { session }, error: sessionError } =
    await supabase.auth.getSession();
    console.log("SESIÓN ACTIVA:", !!session);
console.log("USUARIO AUTENTICADO:", session?.user?.email);
console.log("ERROR DE SESIÓN:", sessionError);

    console.log("SESIÓN ACTIVA:", !!session);
console.log("USUARIO AUTENTICADO:", session?.user?.id);

  if (sessionError || !session) {
    setMessage("No se detectó una sesión activa. Cerrá sesión e ingresá nuevamente.");
    setLoading(false);
    return;
  }

  // Crear un identificador URL amigable
      const slug = `${form.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Date.now()}`;

      // Registrar la propiedad
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          title: form.title,
          slug,
          description: form.description,
          property_type: form.property_type,
          operation_type: form.operation_type,
          price: Number(form.price),
          currency: form.currency,
          province: form.province,
          city: form.city,
          address: form.address,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
          land_area: form.land_area ? Number(form.land_area) : null,
          covered_area: form.covered_area
            ? Number(form.covered_area)
            : null,
          status: form.status,
          featured: false,
        })
        .select()
        .single();

      if (propertyError) {
        throw new Error(
          "No se pudo registrar la propiedad: " + propertyError.message
        );
      }

      // Subir fotografías al almacenamiento de Supabase
      const imageRecords = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const extension = file.name.split(".").pop() || "jpg";
        const filePath = `${property.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(
            "Error al subir la fotografía " +
              file.name +
              ": " +
              uploadError.message
          );
        }

        const { data: publicUrl } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        imageRecords.push({
          property_id: property.id,
          image_url: publicUrl.publicUrl,
          is_cover: i === 0,
          display_order: i + 1,
        });
      }

      // Guardar las fotografías vinculadas a la propiedad
      const { error: imagesError } = await supabase
        .from("property_images")
        .insert(imageRecords);

      if (imagesError) {
        throw new Error(
          "La propiedad fue creada, pero hubo un problema al guardar las fotografías: " +
            imagesError.message
        );
      }

      setMessage("¡Propiedad registrada correctamente!");

      setTimeout(() => {
        router.push("/admin/propiedades");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        Verificando sesión...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Nueva propiedad
            </h1>
            <p className="mt-2 text-slate-600">
              Registrá una propiedad para MCB Inmobiliaria.
            </p>
          </div>

          <Link
            href="/admin/propiedades"
            className="rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
          >
            Volver
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 shadow"
        >
          {/* Información general */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Información general
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Título de la propiedad *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border p-3"
                  placeholder="Ej.: Casa familiar en Federación"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tipo de propiedad *
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
                  <option value="local_comercial">Local comercial</option>
                  <option value="campo">Campo</option>
                  <option value="alojamiento_temporario">
                    Alojamiento temporario
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Operación *
                </label>
                <select
                  name="operation_type"
                  value={form.operation_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Precio *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-lg border p-3"
                  placeholder="Ej.: 120000"
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

          {/* Ubicación */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
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
                  placeholder="Calle y número"
                />
              </div>
            </div>
          </section>

          {/* Características */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Características
            </h2>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Dormitorios
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Baños
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Superficie del terreno (m²)
                </label>
                <input
                  type="number"
                  name="land_area"
                  value={form.land_area}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Superficie cubierta (m²)
                </label>
                <input
                  type="number"
                  name="covered_area"
                  value={form.covered_area}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>
          </section>

          {/* Descripción */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Descripción
            </h2>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg border p-3"
              placeholder="Describí las características y ventajas de la propiedad..."
            />
          </section>

          {/* Fotografías */}
          <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              Fotografías de la propiedad
            </h2>

            <p className="mb-4 text-sm text-slate-600">
              Podés seleccionar varias imágenes desde tu computadora. La
              primera será utilizada como portada.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full rounded-lg border border-dashed border-slate-400 p-4"
            />

            {previews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {previews.map((preview, index) => (
                  <div key={preview} className="relative">
                    <img
                      src={preview}
                      alt={`Fotografía ${index + 1}`}
                      className="h-36 w-full rounded-lg object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded bg-blue-900 px-2 py-1 text-xs text-white">
                        Portada
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="mt-2 w-full rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Quitar imagen
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-sm text-slate-500">
              Fotografías seleccionadas: {files.length}
            </p>
          </section>

          {/* Publicación */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Estado de publicación
            </h2>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 md:w-1/2"
            >
              <option value="draft">Guardar como borrador</option>
              <option value="published">Publicar propiedad</option>
            </select>
          </section>

          {/* Mensajes */}
          {message && (
            <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-800">
              {message}
            </div>
          )}

          {/* Botón */}
          <div className="border-t pt-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-6 py-4 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registrando propiedad..." : "Guardar propiedad"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}