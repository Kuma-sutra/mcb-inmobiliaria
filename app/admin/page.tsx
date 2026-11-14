"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/admin/login");
        return;
      }

      setEmail(data.session.user.email ?? "");
      setChecking(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      } else {
        setEmail(session.user.email ?? "");
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Verificando acceso...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Administración MCB
            </h1>
            <p className="mt-2 text-slate-500">
              Panel de gestión inmobiliaria
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Sesión iniciada: {email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </header>

        <section className="grid gap-6 md:grid-cols-3">

  {/* Acceso a propiedades */}
  <a
    href="/admin/propiedades"
    className="block rounded-xl bg-white p-6 shadow transition hover:shadow-lg hover:-translate-y-1 cursor-pointer"
  >
    <h2 className="text-xl font-semibold text-slate-900">
      Propiedades
    </h2>

    <p className="mt-2 text-slate-500">
      Administrar propiedades publicadas y borradores.
    </p>

    <p className="mt-4 text-sm font-semibold text-blue-700">
      Ingresar →
    </p>
  </a>

  {/* Acceso a fotografías */}
  <a
    href="/admin/propiedades"
    className="block rounded-xl bg-white p-6 shadow transition hover:shadow-lg hover:-translate-y-1 cursor-pointer"
  >
    <h2 className="text-xl font-semibold text-slate-900">
      Fotografías
    </h2>

    <p className="mt-2 text-slate-500">
      Gestionar las imágenes de las propiedades.
    </p>

    <p className="mt-4 text-sm font-semibold text-blue-700">
      Ingresar →
    </p>
  </a>

  {/* Consultas pendientes */}
  <div className="rounded-xl bg-white p-6 shadow opacity-75">
    <h2 className="text-xl font-semibold text-slate-900">
      Consultas
    </h2>

    <p className="mt-2 text-slate-500">
      Próximamente: gestión de consultas.
    </p>

    <p className="mt-4 text-sm font-semibold text-slate-400">
      Próximamente
    </p>
  </div>

</section>
      </div>
    </main>
  );
}