/**
 * Format a Uruguayan phone number for WhatsApp API.
 * Handles: 09X XXX XXX → 598 9X XXX XXX
 * Also handles numbers already with country code.
 */
export function formatWhatsAppUY(phone: string): string {
  // Strip all non-digits
  const digits = phone.replace(/\D/g, '')

  // Already has country code 598
  if (digits.startsWith('598')) return digits

  // Starts with 0 (local format: 09X... or 0X...)
  if (digits.startsWith('0')) return `598${digits.slice(1)}`

  // No prefix — assume Uruguay
  return `598${digits}`
}

/**
 * Build a WhatsApp wa.me URL with optional pre-filled message.
 */
export function whatsAppURL(phone: string, message?: string): string {
  const number = formatWhatsAppUY(phone)
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/**
 * Build a mailto: URL with optional subject and body.
 */
export function mailtoURL(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const qs = params.toString()
  return `mailto:${email}${qs ? `?${qs}` : ''}`
}
