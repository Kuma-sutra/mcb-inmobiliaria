"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  title: string;
  address: string | null;
  city: string | null;
};

type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_cover: boolean;
};

export default function AdminFotografiasPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/admin/login";
        return;
      }

      const { data: propertiesData, error } = await supabase
        .from("properties")
        .select("id, title, address, city")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Error al cargar las propiedades: " + error.message);
      } else {
        setProperties(propertiesData ?? []);
      }

      setLoading(false);
    }

    init();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadImages();
    } else {
      setImages([]);
    }
  }, [selectedProperty]);

  async function loadImages() {
    const { data, error } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", selectedProperty)
      .order("display_order", { ascending: true });

    if (error) {
      setMessage("Error al cargar las fotografías: " + error.message);
      return;
    }

    setImages(data ?? []);
  }

  async function uploadImages() {
    if (!selectedProperty || !files || files.length === 0) {
      setMessage("Seleccioná una propiedad y al menos una fotografía.");
      return;
    }

    setUploading(true);
    setMessage("");

    let errors = 0;
    let nextOrder =
      images.length > 0
        ? Math.max(...images.map((image) => image.display_order)) + 1
        : 0;

    for (const file of Array.from(files)) {
      const extension = file.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${extension}`;
      const filePath = `${selectedProperty}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, file);

      if (uploadError) {
        errors++;
        continue;
      }

      const { data: publicUrl } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("property_images")
        .insert({
          property_id: selectedProperty,
          image_url: publicUrl.publicUrl,
          display_order: nextOrder,
          is_cover: images.length === 0 && nextOrder === 0,
        });

      if (insertError) {
        errors++;
      } else {
        nextOrder++;
      }
    }

    setFiles(null);

    const input = document.getElementById(
      "photo-upload"
    ) as HTMLInputElement | null;

    if (input) input.value = "";

    await loadImages();

    setUploading(false);

    setMessage(
      errors === 0
        ? "¡Fotografías cargadas correctamente!"
        : `Se produjeron ${errors} errores durante la carga.`
    );
  }

  async function setCover(imageId: string) {
    const { error: resetError } = await supabase
      .from("property_images")
      .update({ is_cover: false })
      .eq("property_id", selectedProperty);

    if (resetError) {
      setMessage("Error al actualizar la portada: " + resetError.message);
      return;
    }

    const { error } = await supabase
      .from("property_images")
      .update({ is_cover: true })
      .eq("id", imageId);

    if (error) {
      setMessage("Error al elegir la portada: " + error.message);
    } else {
      setMessage("Portada actualizada correctamente.");
      await loadImages();
    }
  }

  async function changeOrder(imageId: string, direction: number) {
    const index = images.findIndex((image) => image.id === imageId);
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= images.length) return;

    const current = images[index];
    const target = images[newIndex];

    const { error: firstError } = await supabase
      .from("property_images")
      .update({ display_order: target.display_order })
      .eq("id", current.id);

    if (firstError) {
      setMessage("No se pudo cambiar el orden.");
      return;
    }

    const { error: secondError } = await supabase
      .from("property_images")
      .update({ display_order: current.display_order })
      .eq("id", target.id);

    if (secondError) {
      setMessage("No se pudo completar el cambio de orden.");
      return;
    }

    await loadImages();
  }

  async function deleteImage(image: PropertyImage) {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar esta fotografía?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("property_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      setMessage("Error al eliminar la fotografía: " + error.message);
      return;
    }

    setMessage("Fotografía eliminada de la propiedad.");
    await loadImages();
  }

  if (loading) {
    return <main className="p-8">Cargando fotografías...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Administración de fotografías
            </h1>
            <p className="mt-2 text-slate-600">
              Gestioná las imágenes de tus propiedades.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Volver al panel
          </Link>
        </div>

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <label className="mb-2 block font-semibold text-slate-800">
            Seleccionar propiedad
          </label>

          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
          >
            <option value="">Elegir una propiedad...</option>

            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title} — {property.address || property.city || ""}
              </option>
            ))}
          </select>
        </section>

        {selectedProperty && (
          <>
            <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Subir fotografías
              </h2>

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="mb-4 block w-full"
              />

              <button
                onClick={uploadImages}
                disabled={uploading}
                className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {uploading ? "Subiendo fotografías..." : "Subir fotografías"}
              </button>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-slate-900">
                Fotografías cargadas ({images.length})
              </h2>

              {images.length === 0 ? (
                <p className="text-slate-500">
                  Esta propiedad todavía no tiene fotografías.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >
                      <div className="relative h-52 bg-slate-100">
                        <img
                          src={image.image_url}
                          alt={image.alt_text || "Fotografía de propiedad"}
                          className="h-full w-full object-cover"
                        />

                        {image.is_cover && (
                          <span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white">
                            Portada
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="mb-3 text-sm text-slate-500">
                          Fotografía {index + 1}
                        </p>

                        {!image.is_cover && (
                          <button
                            onClick={() => setCover(image.id)}
                            className="mb-3 w-full rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-200"
                          >
                            Elegir como portada
                          </button>
                        )}

                        <div className="mb-3 flex gap-2">
                          <button
                            onClick={() => changeOrder(image.id, -1)}
                            disabled={index === 0}
                            className="flex-1 rounded-lg border px-3 py-2 text-sm disabled:opacity-30"
                          >
                            ↑ Subir
                          </button>

                          <button
                            onClick={() => changeOrder(image.id, 1)}
                            disabled={index === images.length - 1}
                            className="flex-1 rounded-lg border px-3 py-2 text-sm disabled:opacity-30"
                          >
                            ↓ Bajar
                          </button>
                        </div>

                        <button
                          onClick={() => deleteImage(image)}
                          className="w-full rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                        >
                          Eliminar fotografía
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {message && (
          <div className="mt-5 rounded-lg bg-blue-50 p-4 text-blue-800">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}