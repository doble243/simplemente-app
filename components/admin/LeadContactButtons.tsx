'use client'

import { MessageCircle, Mail } from 'lucide-react'
import { whatsAppURL, mailtoURL } from '@/lib/utils/contact'

interface Props {
  name:    string
  phone?:  string | null
  email?:  string | null
  size?:   'sm' | 'md'
}

export function LeadContactButtons({ name, phone, email, size = 'md' }: Props) {
  if (!phone && !email) return null

  const greeting = `Hola ${name.split(' ')[0]}, te contacto desde Simplemente 👋`

  const isSm = size === 'sm'

  return (
    <div className="flex items-center gap-2">
      {/* WhatsApp — primary (only if phone exists) */}
      {phone && (
        <a
          href={whatsAppURL(phone, greeting)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-colors
            bg-[#25D366] hover:bg-[#20b558] text-white
            ${isSm ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-[13px]'}`}
          onClick={e => e.stopPropagation()}
        >
          <MessageCircle className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          WhatsApp
        </a>
      )}

      {/* Email — secondary */}
      {email && (
        <a
          href={mailtoURL(email, `Consulta de Simplemente — ${name}`, greeting)}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors
            ${isSm ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-[13px]'}`}
          onClick={e => e.stopPropagation()}
        >
          <Mail className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          Email
        </a>
      )}

      {/* If only email (no phone) — show email as primary */}
      {!phone && email && null /* already handled above */}
    </div>
  )
}
