import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const validateEmailConfig = (): void => {
    const requiredEnvVars = [
        "EMAIL_HOST",
        "EMAIL_PORT",
        "EMAIL_USER",
        "EMAIL_PASS",
        "EMAIL_FROM",
    ];

    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            throw new Error(`Environment variable ${envVar} is not defined`);
        }
    });
};

validateEmailConfig();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "2525", 10),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: true,
});

const stripHtml = (html: string): string =>
    html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();

export const sendEmail = async (
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
): Promise<void> => {
    try {
        await transporter.sendMail({
            from: `"Sistema Kardex" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>${subject}</title>
                </head>
                <body style="font-family: sans-serif; color: #333;">
                    ${htmlContent}
                    <hr />
                    <p style="font-size: 12px; color: #888;">
                        Este correo fue enviado automáticamente por el Sistema de Kárdex.<br />
                        Si no reconoces este mensaje, puedes ignorarlo.
                    </p>
                </body>
                </html>
            `,
            text: textContent || stripHtml(htmlContent),
        });
        console.log(`✅ Email enviado a ${to} con asunto: ${subject}`);
    } catch (error) {
        console.error(`❌ Falló el envío a ${to}:`, error);
        throw new Error("Error enviando el correo");
    }
};

export const sendKardexUploadEmail = async (params: {
    to: string;
    nombreAlumno: string;
    expediente: string;
}) => {
    const { to, nombreAlumno, expediente } = params;

    const subject = "Kárdex cargado correctamente";
    const htmlContent = `
        <h2>Hola ${nombreAlumno}</h2>
        <p>Tu kárdex ha sido cargado correctamente en el sistema.</p>
        <p><strong>Expediente:</strong> ${expediente}</p>
        <p>Ahora puedes consultar tu historial académico en la plataforma.</p>
    `;
    const textContent = `
Hola ${nombreAlumno},

Tu kárdex ha sido cargado correctamente en el sistema.
Expediente: ${expediente}

Ahora puedes consultar tu historial académico en la plataforma.
    `;

    await sendEmail(to, subject, htmlContent, textContent);
};
