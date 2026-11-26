"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  operation_type: string;
  price: number;
  currency: string;
  province: string;
  city: string;
  address: string;
  bedrooms: number | null;
  bathrooms: number | null;
  land_area: number | null;
  covered_area: number | null;
};

type PropertyImage = {
  image_url: string;
  created_at: string;
};

function PropertyDetailContent() {
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [nombre, setNombre] = useState("");
const [email, setEmail] = useState("");
const [telefono, setTelefono] = useState("");
const [mensaje, setMensaje] = useState("");
const [enviando, setEnviando] = useState(false);
const [mensajeFormulario, setMensajeFormulario] = useState("");
async function enviarConsulta(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setMensajeFormulario("");

  if (!nombre.trim() || !telefono.trim() || !mensaje.trim()) {
    setMensajeFormulario("Completá los campos obligatorios.");
    return;
  }

  setEnviando(true);

  const { error } = await supabase.from("consultas").insert([
    {
      nombre: nombre.trim(),
      email: email.trim() || null,
      telefono: telefono.trim(),
      propiedad_id: id,
      mensaje: mensaje.trim(),
    },
  ]);

  setEnviando(false);

  if (error) {
    console.error("Error al enviar consulta:", error);
    setMensajeFormulario("No se pudo enviar la consulta. Intentá nuevamente.");
    return;
  }
try {
  const respuestaEmail = await fetch("/api/consultas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      mensaje: mensaje.trim(),
      propiedad: property?.title || "Consulta desde la web",
    }),
  });

  if (!respuestaEmail.ok) {
    console.error("La consulta se guardó, pero no se pudo enviar el email.");
  }
} catch (error) {
  console.error("Error al enviar la notificación:", error);
}
  setNombre("");
  setEmail("");
  setTelefono("");
  setMensaje("");
  setMensajeFormulario("¡Consulta enviada correctamente! Nos comunicaremos con vos.");
}
  useEffect(() => {
    async function cargarPropiedad() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();

      if (error) {
        console.error(error);
        setError("No se pudo encontrar la propiedad.");
        setLoading(false);
        return;
      }

      setProperty(data as Property);

      const { data: fotos, error: errorFotos } = await supabase
        .from("property_images")
        .select("image_url, created_at")
        .eq("property_id", id)
        .order("created_at", { ascending: true });

      if (errorFotos) {
        console.error(errorFotos);
      }

      setImages((fotos || []) as PropertyImage[]);
      setLoading(false);
    }

    if (id) cargarPropiedad();
  }, [id]);

  if (loading) {
    return (
      <main style={styles.loading}>
        Cargando propiedad...
      </main>
    );
  }

  if (error || !property) {
    return (
      <main style={styles.loading}>
        {error || "Propiedad no encontrada."}
        <br />
        <Link href="/">Volver al inicio</Link>
      </main>
    );
  }

  const formatoPrecio = new Intl.NumberFormat("es-AR").format(
    property.price
  );

const whatsappMessage = `Hola, quisiera obtener información sobre la propiedad ${property.title}, ubicada en ${property.address}, ${property.city}, ${property.province}. ¿Podrían brindarme más información?`;

const whatsappNumber = "5493456590400";

const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const caracteristicas = [
    {
      nombre: "Dormitorios",
      valor: property.bedrooms,
      icono: "🛏️",
    },
    {
      nombre: "Baños",
      valor: property.bathrooms,
      icono: "🚿",
    },
    {
      nombre: "Terreno",
      valor: property.land_area,
      unidad: "m²",
      icono: "📐",
    },
    {
      nombre: "Superficie cubierta",
      valor: property.covered_area,
      unidad: "m²",
      icono: "🏠",
    },
  ].filter((item) => item.valor !== null);

  return (
    <main style={styles.page}>

      {/* ENCABEZADO */}

      <div style={styles.container}>

        <Link href="/" style={styles.back}>
          ← Volver al inicio
        </Link>

        <div style={styles.header}>

          <div>
            <span style={styles.badge}>
              {property.operation_type.toUpperCase()}
            </span>

            <h1 style={styles.title}>
              {property.title}
            </h1>

            <p style={styles.address}>
              📍 {property.address}, {property.city},{" "}
              {property.province}
            </p>
          </div>

          <div style={styles.priceBox}>
            <span style={styles.priceLabel}>
              Precio
            </span>

            <strong style={styles.price}>
              {property.currency} {formatoPrecio}
            </strong>
          </div>

        </div>

        {/* GALERÍA */}

        <section style={styles.gallerySection}>

          <h2 style={styles.sectionTitle}>
            Fotografías de la propiedad
          </h2>

          {images.length > 0 ? (

            <div style={styles.gallery}>

              {images.map((image, index) => (

                <button
                  key={index}
                  onClick={() => setSelectedImage(image.image_url)}
                  style={styles.imageButton}
                  aria-label={`Ampliar fotografía ${index + 1}`}
                >

                  <img
                    src={image.image_url}
                    alt={`${property.title} - fotografía ${index + 1}`}
                    style={styles.image}
                  />

                </button>

              ))}

            </div>

          ) : (

            <p>No hay fotografías disponibles.</p>

          )}

        </section>

        {/* CARACTERÍSTICAS */}

        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            Características de la propiedad
          </h2>

          <div style={styles.features}>

            <div style={styles.feature}>
              <span>🏡</span>
              <small>Tipo de propiedad</small>
              <strong>{property.property_type}</strong>
            </div>

            {caracteristicas.map((item) => (

              <div key={item.nombre} style={styles.feature}>

                <span>{item.icono}</span>

                <small>{item.nombre}</small>

                <strong>
                  {item.valor} {item.unidad || ""}
                </strong>

              </div>

            ))}

          </div>

        </section>

        {/* DESCRIPCIÓN */}

        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            Descripción
          </h2>

          <p style={styles.description}>
            {property.description ||
              "Consultanos para obtener más información sobre esta propiedad."}
          </p>

        </section>

    {/* CONTACTO Y FORMULARIO */}

<section style={styles.section}>

  <h2 style={styles.sectionTitle}>
    ¿Te interesa esta propiedad?
  </h2>

  <p style={styles.contactText}>
    Completá el formulario y nos comunicaremos con vos.
  </p>

  <form onSubmit={enviarConsulta} style={styles.form}>

    <label style={styles.label}>
      Nombre y apellido *
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        style={styles.input}
        placeholder="Tu nombre"
      />
    </label>

    <label style={styles.label}>
      Correo electrónico
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
        placeholder="tu@email.com"
      />
    </label>

    <label style={styles.label}>
      Teléfono *
      <input
        type="tel"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        required
        style={styles.input}
        placeholder="Tu teléfono"
      />
    </label>

    <label style={styles.label}>
      Mensaje *
      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        required
        style={styles.textarea}
        placeholder="Quisiera recibir más información sobre esta propiedad..."
      />
    </label>

    <button
      type="submit"
      disabled={enviando}
      style={styles.submitButton}
    >
      {enviando ? "Enviando..." : "Enviar consulta"}
    </button>

    {mensajeFormulario && (
      <p style={styles.formMessage}>
        {mensajeFormulario}
      </p>
    )}

  </form>

  <a
    href={whatsappLink}
    target="_blank"
    rel="noopener noreferrer"
    style={styles.whatsapp}
  >
    Consultar también por WhatsApp →
  </a>

</section>
        {/* PIE */}

        <footer style={styles.footer}>
          <strong>MCB INMOBILIARIA</strong>
          <p>Federación · Entre Ríos</p>
        </footer>

      </div>

      {/* VISOR DE FOTOGRAFÍAS */}

      {selectedImage && (

        <div
          onClick={() => setSelectedImage(null)}
          style={styles.modal}
        >

          <button
            onClick={() => setSelectedImage(null)}
            style={styles.closeButton}
            aria-label="Cerrar fotografía"
          >
            ✕
          </button>

          <img
            src={selectedImage}
            alt="Fotografía ampliada de la propiedad"
            style={styles.modalImage}
          />

        </div>

      )}

    </main>
  );
}


// ESTILOS VISUALES

const styles: { [key: string]: React.CSSProperties } = {

  page: {
    background: "#F5F7FA",
    minHeight: "100vh",
    color: "#14213D",
    padding: "40px 20px",
  },

  container: {
    maxWidth: 1150,
    margin: "0 auto",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#14213D",
    background: "#FFFFFF",
    fontSize: 18,
  },

  back: {
    display: "inline-block",
    color: "#14213D",
    textDecoration: "none",
    marginBottom: 30,
    fontWeight: 600,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 25,
    marginBottom: 35,
  },

  badge: {
    display: "inline-block",
    background: "#F59E0B",
    color: "#14213D",
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 800,
    borderRadius: 4,
  },

  title: {
    fontSize: 36,
    fontWeight: 800,
    margin: "15px 0 8px",
  },

  address: {
    color: "#64748B",
    fontSize: 16,
  },

  priceBox: {
    background: "#FFFFFF",
    padding: "20px 28px",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
  },

  priceLabel: {
    display: "block",
    color: "#64748B",
    fontSize: 13,
    marginBottom: 8,
  },

  price: {
    fontSize: 25,
    color: "#D97706",
  },

  gallerySection: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 25,
    fontWeight: 750,
    marginBottom: 22,
    color: "#14213D",
  },

  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 15,
  },

  imageButton: {
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    overflow: "hidden",
    borderRadius: 10,
  },

  image: {
    width: "100%",
    height: 260,
    objectFit: "cover",
    display: "block",
    borderRadius: 10,
  },

  section: {
    marginTop: 55,
  },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 15,
  },

  feature: {
    background: "#FFFFFF",
    padding: 22,
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },

  description: {
    background: "#FFFFFF",
    padding: 25,
    borderRadius: 10,
    lineHeight: 1.8,
    color: "#475569",
    whiteSpace: "pre-line",
  },

  contact: {
    marginTop: 55,
    background: "#14213D",
    color: "#FFFFFF",
    padding: 35,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 25,
  },

  contactTitle: {
    fontSize: 24,
    marginBottom: 8,
  },

  contactText: {
  color: "#475569",
  marginBottom: 12,
},
form: {
  display: "grid",
  gap: 16,
  maxWidth: 650,
  marginTop: 24,
  marginBottom: 24,
},
label: {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontWeight: 600,
  color: "#14213D",
},
input: {
  padding: "13px 14px",
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box",
},
textarea: {
  padding: "13px 14px",
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  fontSize: 16,
  minHeight: 120,
  resize: "vertical",
  width: "100%",
  boxSizing: "border-box",
},
submitButton: {
  background: "#D97706",
  color: "#FFFFFF",
  padding: "15px 22px",
  border: "none",
  borderRadius: 7,
  fontWeight: 750,
  fontSize: 16,
  cursor: "pointer",
},
formMessage: {
  marginTop: 10,
  fontWeight: 600,
  color: "#14213D",
},
  whatsapp: {
    background: "#25D366",
    color: "#FFFFFF",
    padding: "16px 25px",
    borderRadius: 7,
    textDecoration: "none",
    fontWeight: 750,
  },

  footer: {
    marginTop: 60,
    padding: 25,
    borderTop: "1px solid #E2E8F0",
    textAlign: "center",
    color: "#64748B",
  },

  modal: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.92)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    cursor: "zoom-out",
  },

  modalImage: {
    maxWidth: "95%",
    maxHeight: "90vh",
    objectFit: "contain",
  },

  closeButton: {
    position: "absolute",
    top: 20,
    right: 25,
    background: "transparent",
    color: "#FFFFFF",
    border: "none",
    fontSize: 32,
    cursor: "pointer",
  },

};
export default function PropertyDetailPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 40 }}>
          Cargando propiedad...
        </main>
      }
    >
      <PropertyDetailContent />
    </Suspense>
  );
}