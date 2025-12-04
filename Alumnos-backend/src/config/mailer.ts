// src/config/mailer.ts
import nodemailer from "nodemailer";

const {
    MAILTRAP_HOST,
    MAILTRAP_PORT,
    MAILTRAP_USER,
    MAILTRAP_PASS,
    MAIL_FROM,
} = process.env;

if (!MAILTRAP_HOST || !MAILTRAP_USER || !MAILTRAP_PASS) {
    console.warn("⚠️ Mailtrap no está configurado (faltan variables de entorno)");
}

export const mailer = nodemailer.createTransport({
    host: MAILTRAP_HOST,
    port: MAILTRAP_PORT ? Number(MAILTRAP_PORT) : 2525,
    auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASS,
    },
});

export async function sendKardexUploadMail(opts: {
    to: string;
    nombreAlumno: string;
    expediente: string;
}) {
    const from = MAIL_FROM || "no-reply@unison.mx";

    const subject = "Kárdex cargado correctamente";
    const text = [
        `Hola ${opts.nombreAlumno},`,
        "",
        "Tu kárdex ha sido cargado correctamente en el sistema.",
        `Expediente: ${opts.expediente}`,
        "",
        "Si tú no realizaste esta acción, comunícate con el área correspondiente.",
        "",
        "Saludos.",
    ].join("\n");

    await mailer.sendMail({
        from,
        to: opts.to,
        subject,
        text,
    });
}
