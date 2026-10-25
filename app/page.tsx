const propiedades = [
  {
    id: 1,
    tipo: "CASA",
    operacion: "VENTA",
    titulo: "Casa familiar en Federación",
    ubicacion: "Federación, Entre Ríos",
    precio: "Consultar precio",
    detalle: "3 dormitorios · 2 baños · Patio",
    imagen:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 2,
    tipo: "TERRENO",
    operacion: "VENTA",
    titulo: "Terreno para construir",
    ubicacion: "Federación, Entre Ríos",
    precio: "Consultar precio",
    detalle: "Excelente oportunidad de inversión",
    imagen:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 3,
    tipo: "PROPIEDAD",
    operacion: "ALQUILER",
    titulo: "Propiedad en alquiler",
    ubicacion: "Federación, Entre Ríos",
    precio: "Consultar precio",
    detalle: "Consultanos por disponibilidad",
    imagen:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-slate-900 text-xl font-bold text-amber-400">
              MCB
            </div>
            <div>
              <p className="text-lg font-bold tracking-[0.16em] text-slate-900">
                INMOBILIARIA
              </p>
              <p className="text-xs tracking-widest text-slate-500">
                FEDERACIÓN · ENTRE RÍOS
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#inicio" className="hover:text-amber-600">
              Inicio
            </a>
            <a href="#propiedades" className="hover:text-amber-600">
              Propiedades
            </a>
            <a href="#servicios" className="hover:text-amber-600">
              Servicios
            </a>
            <a href="#contacto" className="hover:text-amber-600">
              Contacto
            </a>
          </nav>

          <a
            href="#contacto"
            className="bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Consultanos
          </a>
        </div>
      </header>

      <section
        id="inicio"
        className="relative flex min-h-[520px] items-center bg-slate-900"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(15,23,42,0.92), rgba(15,23,42,0.35)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=90')",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-24">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
            Tu próximo paso comienza aquí
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            Encontrá el lugar ideal para tu próxima historia.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
            Te acompañamos en la compra, venta y alquiler de propiedades en
            Federación y la región.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#propiedades"
              className="bg-amber-500 px-7 py-4 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Explorar propiedades
            </a>
            <a
              href="#contacto"
              className="border border-white px-7 py-4 font-semibold text-white transition hover:bg-white hover:text-slate-900"
            >
              Contactar inmobiliaria
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 sm:grid-cols-3">
          <a
            href="#propiedades"
            className="border border-slate-200 bg-white p-5 transition hover:border-amber-500"
          >
            <p className="text-sm text-slate-500">Encontrá tu lugar</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              Comprar una propiedad →
            </p>
          </a>
          <a
            href="#propiedades"
            className="border border-slate-200 bg-white p-5 transition hover:border-amber-500"
          >
            <p className="text-sm text-slate-500">Tu próximo hogar</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              Alquilar →
            </p>
          </a>
          <a
            href="#contacto"
            className="border border-slate-200 bg-white p-5 transition hover:border-amber-500"
          >
            <p className="text-sm text-slate-500">¿Querés vender?</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              Ofrecer una propiedad →
            </p>
          </a>
        </div>
      </section>

      <section id="propiedades" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Nuestra selección
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Propiedades destacadas
            </h2>
            <p className="mt-3 text-slate-600">
              Descubrí oportunidades para tu próximo proyecto.
            </p>
          </div>
          <a
            href="#contacto"
            className="font-semibold text-slate-900 underline decoration-amber-500 underline-offset-4"
          >
            Consultar otras propiedades
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((propiedad) => (
            <article
              key={propiedad.id}
              className="overflow-hidden border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={propiedad.imagen}
                  alt={propiedad.titulo}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 bg-white px-3 py-2 text-xs font-bold tracking-wider text-slate-900">
                  {propiedad.operacion}
                </span>
              </div>

              <div className="p-6">
                <p className="text-xs font-semibold tracking-widest text-amber-600">
                  {propiedad.tipo}
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {propiedad.titulo}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {propiedad.ubicacion}
                </p>
                <p className="mt-4 text-sm text-slate-600">
                  {propiedad.detalle}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
                  <span className="font-semibold text-slate-900">
                    {propiedad.precio}
                  </span>
                  <a
                    href="#contacto"
                    className="text-sm font-bold text-amber-700 hover:text-amber-500"
                  >
                    Consultar →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Las propiedades mostradas son ejemplos de diseño. Confirmaremos los
          datos, precios y disponibilidad antes de publicarlas comercialmente.
        </p>
      </section>

      <section id="servicios" className="bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
              Asesoramiento inmobiliario
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Decisiones importantes merecen un acompañamiento profesional.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border-l-2 border-amber-500 pl-5">
              <h3 className="text-lg font-bold">Compra y venta</h3>
              <p className="mt-2 leading-7 text-slate-300">
                Te acompañamos durante el proceso de búsqueda y operación.
              </p>
            </div>
            <div className="border-l-2 border-amber-500 pl-5">
              <h3 className="text-lg font-bold">Alquileres</h3>
              <p className="mt-2 leading-7 text-slate-300">
                Buscamos alternativas que se adapten a tus necesidades.
              </p>
            </div>
            <div className="border-l-2 border-amber-500 pl-5">
              <h3 className="text-lg font-bold">Tasaciones</h3>
              <p className="mt-2 leading-7 text-slate-300">
                Consultá por la valoración de tu propiedad.
              </p>
            </div>
            <div className="border-l-2 border-amber-500 pl-5">
              <h3 className="text-lg font-bold">Asesoramiento</h3>
              <p className="mt-2 leading-7 text-slate-300">
                Te orientamos para que puedas tomar decisiones informadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-7xl px-6 py-20">
        <div className="bg-amber-50 p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Estamos para ayudarte
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Hablemos de tu próximo proyecto inmobiliario.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Escribinos para consultar por una propiedad, solicitar información
            o conversar sobre tu próximo paso.
          </p>
          <a
            href="https://wa.me/5490000000000"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex bg-slate-900 px-7 py-4 font-semibold text-white transition hover:bg-amber-600"
          >
            Contactar por WhatsApp
          </a>
          <p className="mt-4 text-xs text-slate-500">
            Antes de publicar, reemplazaremos el enlace de ejemplo por el
            número oficial de MCB Inmobiliaria.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold tracking-widest text-slate-900">
              MCB INMOBILIARIA
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Federación, Entre Ríos, Argentina
            </p>
          </div>
          <p className="text-sm text-slate-500">
           © 2026 MCB Inmobiliaria. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}