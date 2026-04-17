import type { Metadata } from 'next'
import { ContactForm } from '@/components/public/ContactForm'

export const metadata: Metadata = { title: 'Contacto' }

export default function ContactoPage() {
  return <ContactForm />
}
