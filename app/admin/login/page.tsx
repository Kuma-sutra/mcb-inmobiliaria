"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Correo electrónico o contraseña incorrectos.");
      return;
    }

    router.push("/admin");
  }
async function handlePasswordRecovery() {
  setError("");

  if (!email) {
    setError("Ingresá tu correo electrónico para recuperar la contraseña.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    setError("No se pudo enviar el correo: " + error.message);
    return;
  }

  setError("Te enviamos un enlace para restablecer tu contraseña.");
}
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-slate-900 text-2xl font-bold text-amber-400">
            MCB
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Administración
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Ingresá con tu cuenta de MCB Inmobiliaria
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-amber-500"
              placeholder="tu correo electrónico"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-amber-500"
              placeholder="Tu contraseña"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
          <div className="mt-4 text-center">
  <button
    type="button"
    onClick={handlePasswordRecovery}
    className="text-sm font-medium text-slate-600 hover:text-slate-900 underline"
  >
    ¿Olvidaste tu contraseña?
  </button>
</div>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          MCB Inmobiliaria · Federación, Entre Ríos
        </p>
      </div>
    </main>
  );
}