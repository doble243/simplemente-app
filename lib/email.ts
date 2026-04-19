import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: 'simple@menteweb.com',
    pass: process.env.ZOHO_SMTP_PASSWORD,
  },
})

export async function sendLeadNotification(lead: {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  message?: string | null
  score?: number
  ai_notes?: string | null
  next_action?: string | null
}) {
  await transporter.sendMail({
    from: '"Simplemente CRM" <simple@menteweb.com>',
    to: 'simple@menteweb.com',
    subject: `🔔 Nuevo lead: ${lead.name}${lead.company ? ` — ${lead.company}` : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6366f1">Nuevo lead recibido</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold">Nombre</td><td style="padding:8px">${lead.name}</td></tr>
          ${lead.email ? `<tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${lead.email}</td></tr>` : ''}
          ${lead.phone ? `<tr><td style="padding:8px;font-weight:bold">Teléfono</td><td style="padding:8px">${lead.phone}</td></tr>` : ''}
          ${lead.company ? `<tr><td style="padding:8px;font-weight:bold">Empresa</td><td style="padding:8px">${lead.company}</td></tr>` : ''}
          ${lead.message ? `<tr><td style="padding:8px;font-weight:bold">Mensaje</td><td style="padding:8px">${lead.message}</td></tr>` : ''}
          ${lead.score != null ? `<tr><td style="padding:8px;font-weight:bold">Score IA</td><td style="padding:8px">${lead.score}/100</td></tr>` : ''}
          ${lead.ai_notes ? `<tr><td style="padding:8px;font-weight:bold">Análisis IA</td><td style="padding:8px">${lead.ai_notes}</td></tr>` : ''}
          ${lead.next_action ? `<tr><td style="padding:8px;font-weight:bold">Próximo paso</td><td style="padding:8px">${lead.next_action}</td></tr>` : ''}
        </table>
        <p style="margin-top:24px">
          <a href="https://simple.menteweb.com/leads" style="background:#6366f1;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">Ver en CRM</a>
        </p>
      </div>
    `,
  })
}
