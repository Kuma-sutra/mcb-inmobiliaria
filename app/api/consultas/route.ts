import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { nombre, email, telefono, mensaje, propiedad } =
      await request.json();

    if (!nombre || !telefono || !mensaje) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "MCB Inmobiliaria <consultas@mcbinmobiliaria.com.ar>",
      to: ["pablo.romero.kucharuk@gmail.com"],
      replyTo: email || undefined,
      subject: `Nueva consulta inmobiliaria: ${propiedad || "Propiedad"}`,
      html: `
        <h2>Nueva consulta desde la web de MCB Inmobiliaria</h2>
        <p><strong>Propiedad:</strong> ${propiedad || "No especificada"}</p>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email || "No informado"}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return NextResponse.json(
        { error: "No se pudo enviar el correo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error en la API de consultas:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}