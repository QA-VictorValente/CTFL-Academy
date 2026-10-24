export interface SendPasswordResetEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<SendPasswordResetEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    console.log('\n' + '='.repeat(60));
    console.log('[DEV MOCK EMAIL] Envio de Recuperação de Senha');
    console.log(`Para: ${email}`);
    console.log(`Link de Redefinição: ${resetUrl}`);
    console.log(`Expiração: 15 minutos`);
    console.log('='.repeat(60) + '\n');
    return { success: true, messageId: 'mock-dev-email' };
  }

  try {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - CTFL Academy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
          <tr>
            <td>
              <div style="display: inline-block; padding: 6px 12px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 6px; font-size: 12px; font-weight: 600; color: #60a5fa; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px;">
                CTFL Academy • ISTQB v4.0.1
              </div>
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">
                Recuperação de Acesso
              </h1>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Recebemos uma solicitação para redefinir a senha da sua conta vinculada ao e-mail <strong style="color: #f1f5f9;">${email}</strong>.
              </p>
              <div style="margin: 28px 0; text-align: left;">
                <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; letter-spacing: 0.01em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">
                  Redefinir Minha Senha
                </a>
              </div>
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.5; color: #64748b;">
                Este link é de uso único e expira automaticamente em <strong>15 minutos</strong>. Se o botão não funcionar, copie e cole o endereço abaixo no seu navegador:
              </p>
              <p style="margin: 0 0 24px; font-size: 12px; line-height: 1.5; word-break: break-all; color: #38bdf8; background-color: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #1e293b;">
                ${resetUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #1f2937; margin: 24px 0;" />
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                Se você não solicitou esta redefinição, nenhuma ação é necessária. Sua senha atual permanecerá segura.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: 'Recuperação de Senha — CTFL Academy',
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Resend Error]:', res.status, errText);
      return { success: false, error: errText };
    }

    const data = (await res.json()) as { id: string };
    return { success: true, messageId: data.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Resend Exception]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
