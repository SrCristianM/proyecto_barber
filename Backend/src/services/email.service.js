/**
 * @file email.service.js
 * Servicio de envío de correos electrónicos con Nodemailer.
 * Soporta SMTP configurado (Gmail, Outlook, etc.) y fallback automático a Ethereal Test Account en desarrollo.
 */

import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let transporter = null;
let etherealAccount = null;

export class EmailService {
  /**
   * Obtiene o inicializa el transporte de nodemailer
   */
  static async getTransporter() {
    // Si ya existe y es SMTP configurado, reutilizar
    if (transporter) return transporter;

    const hasSmtpCredentials = Boolean(env.EMAIL?.USER && env.EMAIL?.PASS);

    if (hasSmtpCredentials) {
      try {
        const isGmail = (env.EMAIL.HOST || '').toLowerCase().includes('gmail') || (env.EMAIL.USER || '').toLowerCase().includes('gmail.com');
        transporter = nodemailer.createTransport({
          ...(isGmail ? { service: 'gmail' } : {
            host: env.EMAIL.HOST || "smtp.gmail.com",
            port: env.EMAIL.PORT || 587,
            secure: Boolean(env.EMAIL.SECURE)
          }),
          auth: {
            user: env.EMAIL.USER,
            pass: (env.EMAIL.PASS || '').replace(/\s+/g, '')
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // Verificar conexión
        await transporter.verify();
        logger.info(`✅ Servidor SMTP conectado exitosamente (${env.EMAIL.HOST || "smtp.gmail.com"} - ${env.EMAIL.USER})`);
        return transporter;
      } catch (smtpError) {
        logger.warn(`⚠️ Error al conectar con servidor SMTP configurado: ${smtpError.message}. Recurriendo a cuenta de pruebas Ethereal.`);
        transporter = null;
      }
    }

    // Fallback: Ethereal test account para entorno de pruebas o cuando no hay SMTP
    try {
      if (!etherealAccount) {
        etherealAccount = await nodemailer.createTestAccount();
        logger.info(`📧 Cuenta de pruebas Ethereal creada: ${etherealAccount.user}`);
      }

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: etherealAccount.user,
          pass: etherealAccount.pass
        }
      });

      return transporter;
    } catch (testAccountError) {
      logger.error(`❌ No se pudo crear transporte de correo: ${testAccountError.message}`);
      return null;
    }
  }

  /**
   * Envía correo con código de verificación para restablecer contraseña
   */
  static async sendPasswordResetCode({ to, name, code, expiresMinutes = 15 }) {
    const fromAddress = env.EMAIL?.FROM || '"Tu Turno Barber" <tuturnobarber@gmail.com>';
    const recipientName = name || "Usuario";

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Tu Turno Barber</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1A1A1A; border: 1px solid #C9A24A; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A1A1A 0%, #2A2415 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #C9A24A;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #C9A24A;">TU TURNO BARBER</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #A0A0A0; letter-spacing: 1px; text-transform: uppercase;">Sistema de Gestión de Barbería</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #FFFFFF;">Restablece tu Contraseña</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #CCCCCC;">
                Hola <strong style="color: #FFFFFF;">${recipientName}</strong>, recibimos una solicitud para restablecer la contraseña de acceso a tu cuenta vinculada a este correo.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #CCCCCC;">
                Ingresa el siguiente código de verificación en la aplicación móvil o plataforma web para continuar:
              </p>

              <!-- Code Box -->
              <div style="background-color: #121212; border: 2px dashed #C9A24A; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A0A0A0; display: block; margin-bottom: 8px;">Código de Verificación</span>
                <span style="font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #C9A24A; font-family: monospace;">${code}</span>
                <span style="font-size: 12px; color: #E0B85C; display: block; margin-top: 8px;">⏱️ Expira en ${expiresMinutes} minutos</span>
              </div>

              <!-- Security Warning -->
              <div style="background-color: rgba(201, 162, 74, 0.08); border-left: 3px solid #C9A24A; padding: 14px 16px; border-radius: 4px; margin: 24px 0 16px 0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #D4AF37;">
                  <strong>Importante:</strong> Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá intacta.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.6; color: #888888;">
                Por tu seguridad, nunca compartas este código con otra persona. El equipo de Tu Turno Barber nunca te pedirá tu contraseña ni este código.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #141414; padding: 20px 24px; text-align: center; border-top: 1px solid #2D2D2D;">
              <p style="margin: 0; font-size: 11px; color: #666666;">
                © ${new Date().getFullYear()} Tu Turno Barber. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    try {
      const activeTransporter = await EmailService.getTransporter();

      if (!activeTransporter) {
        logger.warn(`⚠️ [EmailService] No hay transporte activo. Código para ${to}: ${code}`);
        return {
          success: true,
          previewUrl: null,
          code
        };
      }

      const info = await activeTransporter.sendMail({
        from: fromAddress,
        to,
        subject: `${code} es tu código de recuperación de contraseña - Tu Turno Barber`,
        text: `Hola ${recipientName},\n\nTu código para restablecer tu contraseña en Tu Turno Barber es: ${code}\n\nEste código expira en ${expiresMinutes} minutos.\n\nSi no solicitaste este cambio, puedes ignorar este mensaje.`,
        html: htmlContent
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

      console.log("\x1b[36m%s\x1b[0m", "============================================================");
      console.log("\x1b[33m%s\x1b[0m", `📬 CORREO DE VERIFICACIÓN ENVIADO CON ÉXITO`);
      console.log(`   Para: ${to}`);
      console.log(`   Código: ${code} (Válido por ${expiresMinutes} minutos)`);
      if (previewUrl) {
        console.log("\x1b[32m%s\x1b[0m", `   🔗 Vista previa Ethereal: ${previewUrl}`);
      } else {
        console.log(`   Enviado vía servidor SMTP directo`);
      }
      console.log("\x1b[36m%s\x1b[0m", "============================================================");

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || null,
        code
      };
    } catch (error) {
      logger.error(`❌ [EmailService] Error enviando correo a ${to}: ${error.message}`);
      console.log("\x1b[31m%s\x1b[0m", `⚠️ CÓDIGO DE RESPALDO (Por error de envío): ${code} para ${to}`);
      return {
        success: false,
        error: error.message,
        code
      };
    }
  }

  /**
   * Envía confirmación de que la contraseña ha sido actualizada
   */
  static async sendPasswordChangedNotification({ to, name }) {
    const fromAddress = env.EMAIL?.FROM || '"Tu Turno Barber" <tuturnobarber@gmail.com>';
    const recipientName = name || "Usuario";

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contraseña Restablecida - Tu Turno Barber</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1A1A1A; border: 1px solid #2ECC71; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 28px 24px; text-align: center; border-bottom: 1px solid #2ECC71;">
              <h1 style="margin: 0; font-size: 22px; color: #2ECC71;">Contraseña Actualizada</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <p style="font-size: 14px; color: #CCCCCC; line-height: 1.6;">
                Hola <strong style="color: #FFFFFF;">${recipientName}</strong>, tu contraseña de acceso a Tu Turno Barber ha sido restablecida exitosamente.
              </p>
              <p style="font-size: 13px; color: #E74C3C; line-height: 1.5; margin-top: 20px;">
                Si tú no realizaste esta acción, comunícate inmediatamente con nuestro equipo de soporte para proteger tu cuenta.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    try {
      const activeTransporter = await EmailService.getTransporter();
      if (!activeTransporter) return;

      const info = await activeTransporter.sendMail({
        from: fromAddress,
        to,
        subject: "Tu contraseña ha sido restablecida - Tu Turno Barber",
        text: `Hola ${recipientName},\n\nTu contraseña en Tu Turno Barber ha sido restablecida exitosamente.\n\nSi no realizaste esta acción, comunícate de inmediato con soporte.`,
        html: htmlContent
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Vista previa de confirmación: ${previewUrl}`);
      }
    } catch (e) {
      logger.warn(`[EmailService] No se pudo enviar confirmación de cambio de contraseña: ${e.message}`);
    }
  }
}

export default EmailService;
